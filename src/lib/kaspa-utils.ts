const MIDDLEMAN_PRIVATE_KEY = process.env.MIDDLEMAN_WALLET_PRIVATE_KEY
if (!MIDDLEMAN_PRIVATE_KEY) {
  console.warn("MIDDLEMAN_WALLET_PRIVATE_KEY environment variable is not set")
}

// Use a hardcoded middleman address instead of generating it from the private key
// This avoids the WebAssembly dependency during server-side rendering
const middlemanAddress = "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj"

// Kaspa network configuration
const NETWORK = "mainnet"
const API_URL = "https://api.kaspa.org"

/**
 * Get the middleman wallet address
 */
export function getMiddlemanAddress(): string {
  return middlemanAddress
}

/**
 * Validate a Kaspa address
 */
export function isValidKaspaAddress(address: string): boolean {
  try {
    // Simple validation without using the Address class
    if (!address || typeof address !== "string") return false
    if (!address.startsWith("kaspa:")) return false
    if (address.length < 60 || address.length > 70) return false

    // Check for valid characters after the prefix
    const addressPart = address.substring(6)
    const validCharsRegex = /^[a-zA-Z0-9]+$/
    return validCharsRegex.test(addressPart)
  } catch (error) {
    return false
  }
}

/**
 * Check if an NFT is owned by an address
 */
export async function checkNftOwnership(nftId: string, address: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/nft/${nftId}`)
    if (!response.ok) throw new Error("Failed to fetch NFT data")

    const nftData = await response.json()
    return nftData.owner === address
  } catch (error) {
    console.error("Error checking NFT ownership:", error)
    return false
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(txId: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/transaction/${txId}`)
    if (!response.ok) throw new Error("Failed to fetch transaction")

    return await response.json()
  } catch (error) {
    console.error("Error fetching transaction:", error)
    throw error
  }
}

/**
 * Create and sign a transaction to send an NFT
 * This is a mock implementation that doesn't use WebAssembly
 */
export async function createNftTransferTransaction(nftId: string, recipientAddress: string): Promise<string> {
  try {
    // Mock implementation that doesn't use WebAssembly
    console.log(`Would create NFT transfer transaction for NFT ${nftId} to ${recipientAddress}`)

    // Return a mock transaction ID
    return `mock_tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
  } catch (error) {
    console.error("Error creating NFT transfer transaction:", error)
    throw error
  }
}

/**
 * Monitor for incoming NFT transfers to the middleman wallet
 */
export async function checkForIncomingNfts(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/address/${middlemanAddress}/transactions`)
    if (!response.ok) throw new Error("Failed to fetch transactions")

    const transactions = await response.json()
    // Filter for recent incoming transactions that might contain NFTs
    // This is simplified - actual implementation would need to parse transaction data

    return transactions.filter((tx: any) => {
      // Filter logic for NFT transfers
      return tx.isIncoming && !tx.isProcessed
    })
  } catch (error) {
    console.error("Error checking for incoming NFTs:", error)
    return []
  }
}

