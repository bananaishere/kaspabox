"use server"

import { revalidatePath } from "next/cache"
import {
  getMiddlemanAddress,
  isValidKaspaAddress,
  checkNftOwnership,
  getTransaction,
  createNftTransferTransaction,
  checkForIncomingNfts,
} from "@/lib/kaspa-utils"

// Mock KV implementation for environments where Vercel KV is not available
const mockKV = {
  async get(key: string) {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key)
      }
      return null
    } catch (e) {
      console.warn("Using mock KV storage")
      return null
    }
  },
  async set(key: string, value: string) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value)
      }
      return "OK"
    } catch (e) {
      console.warn("Using mock KV storage")
      return "OK"
    }
  },
  async keys(pattern: string) {
    try {
      if (typeof localStorage !== "undefined") {
        const keys = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(pattern.replace("*", ""))) {
            keys.push(key)
          }
        }
        return keys
      }
      return []
    } catch (e) {
      console.warn("Using mock KV storage")
      return []
    }
  },
}

// Use the mock KV implementation
// This avoids the import error with @vercel/kv
const kv = mockKV

// Types
type PendingTransfer = {
  id: string
  nftId: string
  fromAddress: string
  toAddress: string
  status: "pending" | "confirmed" | "completed" | "failed"
  createdAt: number
  updatedAt: number
  txId?: string
  completionTxId?: string
  error?: string
}

/**
 * Initialize a new NFT transfer through the middleman
 */
export async function initializeNftTransfer(
  nftId: string,
  fromAddress: string,
  toAddress: string,
): Promise<{ success: boolean; transferId?: string; error?: string }> {
  try {
    // Validate addresses
    if (!isValidKaspaAddress(fromAddress) || !isValidKaspaAddress(toAddress)) {
      return { success: false, error: "Invalid Kaspa address" }
    }

    // Check if the sender owns the NFT
    const ownsNft = await checkNftOwnership(nftId, fromAddress)
    if (!ownsNft) {
      return { success: false, error: "Sender does not own this NFT" }
    }

    // Create a new transfer record
    const transferId = `transfer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const transfer: PendingTransfer = {
      id: transferId,
      nftId,
      fromAddress,
      toAddress,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Store in database (using mock KV for this example)
    await kv.set(`transfers:${transferId}`, JSON.stringify(transfer))

    // Return the middleman address and transfer ID
    return {
      success: true,
      transferId,
    }
  } catch (error) {
    console.error("Error initializing NFT transfer:", error)
    return {
      success: false,
      error: "Failed to initialize transfer",
    }
  }
}

/**
 * Confirm receipt of an NFT by the middleman wallet
 */
export async function confirmNftReceipt(
  transferId: string,
  txId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the transfer record
    const transferJson = await kv.get(`transfers:${transferId}`)
    if (!transferJson) {
      return { success: false, error: "Transfer not found" }
    }

    const transfer: PendingTransfer = JSON.parse(transferJson as string)

    // Verify the transaction
    const tx = await getTransaction(txId)

    // Check if this transaction transfers the NFT to the middleman
    // This is simplified - actual implementation would need to parse transaction data
    const middlemanAddress = getMiddlemanAddress()
    const isValidTransfer = tx.outputs.some((output: any) => output.address === middlemanAddress && output.containsNft)

    if (!isValidTransfer) {
      return { success: false, error: "Invalid transaction" }
    }

    // Update the transfer status
    transfer.status = "confirmed"
    transfer.txId = txId
    transfer.updatedAt = Date.now()

    // Save the updated transfer
    await kv.set(`transfers:${transferId}`, JSON.stringify(transfer))

    revalidatePath("/admin/transfers")
    return { success: true }
  } catch (error) {
    console.error("Error confirming NFT receipt:", error)
    return { success: false, error: "Failed to confirm receipt" }
  }
}

/**
 * Complete an NFT transfer by sending it from the middleman to the recipient
 */
export async function completeNftTransfer(
  transferId: string,
): Promise<{ success: boolean; txId?: string; error?: string }> {
  try {
    // Get the transfer record
    const transferJson = await kv.get(`transfers:${transferId}`)
    if (!transferJson) {
      return { success: false, error: "Transfer not found" }
    }

    const transfer: PendingTransfer = JSON.parse(transferJson as string)

    // Check if the transfer is in the correct state
    if (transfer.status !== "confirmed") {
      return {
        success: false,
        error: `Transfer is in ${transfer.status} state, not confirmed`,
      }
    }

    // Create and send the transaction
    const txId = await createNftTransferTransaction(transfer.nftId, transfer.toAddress)

    // Update the transfer status
    transfer.status = "completed"
    transfer.completionTxId = txId
    transfer.updatedAt = Date.now()

    // Save the updated transfer
    await kv.set(`transfers:${transferId}`, JSON.stringify(transfer))

    revalidatePath("/admin/transfers")
    return { success: true, txId }
  } catch (error) {
    console.error("Error completing NFT transfer:", error)
    return { success: false, error: "Failed to complete transfer" }
  }
}

/**
 * Get all pending transfers
 */
export async function getPendingTransfers(): Promise<PendingTransfer[]> {
  try {
    // Get all transfer keys
    const keys = await kv.keys("transfers:*")

    // Get all transfers
    const transfers = await Promise.all(
      keys.map(async (key) => {
        const transferJson = await kv.get(key)
        return JSON.parse(transferJson as string) as PendingTransfer
      }),
    )

    // Filter for pending and confirmed transfers
    return transfers.filter((transfer) => ["pending", "confirmed"].includes(transfer.status))
  } catch (error) {
    console.error("Error getting pending transfers:", error)
    return []
  }
}

/**
 * Process incoming NFTs
 * This would typically be called by a cron job
 */
export async function processIncomingNfts(): Promise<{
  processed: number
  errors: number
}> {
  try {
    const incomingNfts = await checkForIncomingNfts()
    let processed = 0
    let errors = 0

    for (const nft of incomingNfts) {
      try {
        // Find the corresponding transfer
        const keys = await kv.keys("transfers:*")

        for (const key of keys) {
          const transferJson = await kv.get(key)
          const transfer = JSON.parse(transferJson as string) as PendingTransfer

          if (transfer.status === "pending" && transfer.nftId === nft.nftId) {
            // Confirm the receipt
            await confirmNftReceipt(transfer.id, nft.txId)
            processed++
            break
          }
        }
      } catch (error) {
        console.error("Error processing incoming NFT:", error)
        errors++
      }
    }

    revalidatePath("/admin/transfers")
    return { processed, errors }
  } catch (error) {
    console.error("Error processing incoming NFTs:", error)
    return { processed: 0, errors: 1 }
  }
}

