import { getAddressTransactions, sompiToKas } from "@/lib/kaspa-api"

/**
 * Verify if a transaction has been sent to the middleman wallet
 * @param dealId The deal ID to verify
 * @param middlemanAddress The middleman wallet address
 * @param expectedAmount The expected amount (for KAS transactions)
 * @param isNFT Whether this is an NFT transaction
 * @returns Transaction ID if found, null otherwise
 */
export async function verifyDealTransaction(
  dealId: string,
  middlemanAddress: string,
  expectedAmount?: string,
  isNFT = false,
): Promise<string | null> {
  try {
    console.log(`Verifying transaction for deal ${dealId} to ${middlemanAddress}`)

    // Get recent transactions for the middleman address
    const transactions = await getAddressTransactions(middlemanAddress)

    // For NFT transactions, we need to check if any transaction contains an NFT
    if (isNFT) {
      // In a real implementation, we would check for NFT transfer in the transaction
      // For now, we'll simulate by checking if there's a recent transaction
      const recentTx = transactions.find((tx) => {
        // Check if this transaction has a memo or data field that contains the deal ID
        // This would be how we identify which transaction belongs to which deal
        return tx.memo?.includes(dealId) || tx.data?.includes(dealId)
      })

      return recentTx ? recentTx.txid : null
    }

    // For KAS transactions, we need to check if the amount matches
    if (expectedAmount) {
      const expectedKas = Number.parseFloat(expectedAmount)

      // Find a transaction with the expected amount
      const matchingTx = transactions.find((tx) => {
        // Convert sompi to KAS for comparison
        const txAmount = sompiToKas(tx.amount)

        // Allow for a small difference due to fees
        const difference = Math.abs(txAmount - expectedKas)
        const isCloseEnough = difference < 0.001 // Within 0.001 KAS

        // Check if this transaction has a memo or data field that contains the deal ID
        const hasDealId = tx.memo?.includes(dealId) || tx.data?.includes(dealId)

        return isCloseEnough && hasDealId
      })

      return matchingTx ? matchingTx.txid : null
    }

    return null
  } catch (error) {
    console.error("Error verifying transaction:", error)
    return null
  }
}

/**
 * Send assets from the middleman wallet to the recipient
 * @param recipientAddress The recipient address
 * @param amount The amount to send (for KAS transactions)
 * @param isNFT Whether this is an NFT transaction
 * @param nftId The NFT ID (for NFT transactions)
 * @returns Transaction ID if successful, null otherwise
 */
export async function sendFromMiddleman(
  recipientAddress: string,
  amount?: string,
  isNFT = false,
  nftId?: string,
): Promise<string | null> {
  try {
    console.log(`Sending ${isNFT ? "NFT" : "KAS"} from middleman to ${recipientAddress}`)

    // In a real implementation, this would use the private key to sign and send a transaction
    // For now, we'll simulate a successful transaction

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate a mock transaction ID
    const txId = `tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`

    return txId
  } catch (error) {
    console.error("Error sending from middleman:", error)
    return null
  }
}

/**
 * Calculate and send the service fee
 * @param amount The amount from which to calculate the fee
 * @param feePercentage The fee percentage (e.g., 0.001 for 0.1%)
 * @param feeAddress The address to send the fee to
 * @returns Transaction ID if successful, null otherwise
 */
export async function sendServiceFee(
  amount: string,
  feePercentage: number,
  feeAddress: string,
): Promise<string | null> {
  try {
    const amountValue = Number.parseFloat(amount)
    const feeAmount = amountValue * feePercentage

    console.log(`Sending service fee of ${feeAmount} KAS to ${feeAddress}`)

    // In a real implementation, this would use the private key to sign and send a transaction
    // For now, we'll simulate a successful transaction

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate a mock transaction ID
    const txId = `fee_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`

    return txId
  } catch (error) {
    console.error("Error sending service fee:", error)
    return null
  }
}

