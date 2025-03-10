"use server"

import { getFiatEstimate, getFiatRange, createFiatTransaction, getFiatTransactionStatus } from "@/lib/fiat-exchange-api"
import { isValidKaspaAddress, normalizeKaspaAddress } from "@/lib/address-utils"

/**
 * Get fiat-to-crypto estimate
 */
export async function getFiatToKaspaEstimate(fromCurrency: string, toCurrency: string, amount: string) {
  try {
    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      return {
        success: false,
        error: "Please enter a valid amount",
      }
    }

    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_CHANGENOW_API_KEY) {
      console.warn("API key is not configured. Using mock data.")
      // Continue with mock data
    }

    try {
      // Get min/max amount first
      const range = await getFiatRange(fromCurrency, toCurrency)

      // Validate amount is within range
      if (Number(amount) < range.minAmount) {
        return {
          success: false,
          error: `Minimum amount is ${range.minAmount} ${fromCurrency.toUpperCase()}`,
          minAmount: range.minAmount.toString(),
          maxAmount: range.maxAmount.toString(),
        }
      }

      if (Number(amount) > range.maxAmount) {
        return {
          success: false,
          error: `Maximum amount is ${range.maxAmount} ${fromCurrency.toUpperCase()}`,
          minAmount: range.minAmount.toString(),
          maxAmount: range.maxAmount.toString(),
        }
      }

      // Get the estimate
      const estimate = await getFiatEstimate(fromCurrency, toCurrency, amount)

      return {
        success: true,
        data: {
          ...estimate,
          minAmount: range.minAmount.toString(),
          maxAmount: range.maxAmount.toString(),
        },
      }
    } catch (estimateError: any) {
      console.error("Estimate error:", estimateError)

      // Try to get a basic estimate with fallback values
      try {
        const estimate = await getFiatEstimate(fromCurrency, toCurrency, amount)
        return {
          success: true,
          data: estimate,
        }
      } catch (fallbackError) {
        return {
          success: false,
          error: estimateError.message || "Failed to get exchange estimate",
        }
      }
    }
  } catch (error: any) {
    console.error("Estimate action error:", error)
    return {
      success: false,
      error: error.message || "Failed to get exchange estimate",
    }
  }
}

/**
 * Create fiat-to-crypto transaction
 */
export async function createFiatToCryptoTransaction(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
  address: string,
  returnUrl: string,
) {
  try {
    // Validate address
    if (toCurrency.toLowerCase() === "kas") {
      const normalizedAddress = normalizeKaspaAddress(address)
      if (!isValidKaspaAddress(normalizedAddress)) {
        return {
          success: false,
          error: "Invalid Kaspa address format",
        }
      }
      address = normalizedAddress // Use normalized address
    } else if (!address.trim()) {
      return {
        success: false,
        error: "Recipient address is required",
      }
    }

    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_CHANGENOW_API_KEY) {
      console.warn("API key is not configured. Using mock data.")
      // Continue with mock data
    }

    // Validate amount is a number
    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      return {
        success: false,
        error: "Please enter a valid amount",
      }
    }

    // Validate amount is within range
    try {
      const range = await getFiatRange(fromCurrency, toCurrency)
      if (Number(amount) < range.minAmount) {
        return {
          success: false,
          error: `Minimum amount is ${range.minAmount} ${fromCurrency.toUpperCase()}`,
        }
      }

      if (Number(amount) > range.maxAmount) {
        return {
          success: false,
          error: `Maximum amount is ${range.maxAmount} ${fromCurrency.toUpperCase()}`,
        }
      }
    } catch (rangeError: any) {
      console.warn("Range validation error:", rangeError)
      // Continue even if range validation fails
    }

    try {
      const transaction = await createFiatTransaction(fromCurrency, toCurrency, amount, address, returnUrl)

      return {
        success: true,
        data: transaction,
      }
    } catch (txError: any) {
      return {
        success: false,
        error: txError.message || "Failed to create transaction",
      }
    }
  } catch (error: any) {
    console.error("Transaction creation action error:", error)
    return {
      success: false,
      error: error.message || "Failed to create transaction",
    }
  }
}

/**
 * Check transaction status
 */
export async function checkFiatTransactionStatus(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        error: "Transaction ID is required",
      }
    }

    const status = await getFiatTransactionStatus(id)
    return {
      success: true,
      data: status,
    }
  } catch (error: any) {
    console.error("Status check error:", error)
    return {
      success: false,
      error: error.message || "Failed to check transaction status",
    }
  }
}

