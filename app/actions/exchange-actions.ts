"use server"

import {
  getExchangeEstimate,
  createExchangeTransaction,
  getTransactionStatus,
  validateExchangeAmount,
} from "@/lib/exchange-api"

// Add better error handling and logging
export async function getEstimate(fromCurrency: string, toCurrency: string, amount: string) {
  try {
    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      return {
        success: false,
        error: "Please enter a valid amount",
      }
    }

    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_CHANGENOW_API_KEY) {
      return {
        success: false,
        error: "API key is not configured. Please add the NEXT_PUBLIC_CHANGENOW_API_KEY environment variable.",
      }
    }

    // Try to get the estimate first
    try {
      const estimate = await getExchangeEstimate(fromCurrency, toCurrency, amount)

      // If we got here, the estimate was successful
      return {
        success: true,
        data: estimate,
      }
    } catch (estimateError: any) {
      console.error("Estimate error:", estimateError)

      // Try to get the minimum amount to provide better error messages
      try {
        const validation = await validateExchangeAmount(fromCurrency, toCurrency, amount)
        if (!validation.valid) {
          return {
            success: false,
            error: validation.message,
            minAmount: validation.minAmount,
          }
        }
      } catch (validationError) {
        // If both fail, return the original estimate error
        return {
          success: false,
          error: estimateError.message || "Failed to get exchange estimate",
        }
      }

      // If validation passed but estimate failed for other reasons
      return {
        success: false,
        error: estimateError.message || "Failed to get exchange estimate",
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

// Improve error handling in createExchange
export async function createExchange(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
  address: string,
  refundAddress?: string,
) {
  try {
    if (!address) {
      return {
        success: false,
        error: "Recipient address is required",
      }
    }

    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      return {
        success: false,
        error: "Please enter a valid amount",
      }
    }

    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_CHANGENOW_API_KEY) {
      return {
        success: false,
        error: "API key is not configured. Please add the NEXT_PUBLIC_CHANGENOW_API_KEY environment variable.",
      }
    }

    // Try to validate the amount first
    try {
      const validation = await validateExchangeAmount(fromCurrency, toCurrency, amount)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.message,
        }
      }
    } catch (validationError: any) {
      console.error("Validation error:", validationError)
      // Continue with the exchange even if validation fails
    }

    try {
      const transaction = await createExchangeTransaction(fromCurrency, toCurrency, amount, address, refundAddress)

      return {
        success: true,
        data: transaction,
      }
    } catch (txError: any) {
      return {
        success: false,
        error: txError.message || "Failed to create exchange transaction",
      }
    }
  } catch (error: any) {
    console.error("Exchange creation action error:", error)
    return {
      success: false,
      error: error.message || "Failed to create exchange transaction",
    }
  }
}

/**
 * Get transaction status (server action)
 */
export async function checkTransactionStatus(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        error: "Transaction ID is required",
      }
    }

    const status = await getTransactionStatus(id)
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

