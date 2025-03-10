import {
  getExchangeEstimateFallback,
  createExchangeTransactionFallback,
  getTransactionStatusFallback,
  getMinimumExchangeAmountFallback,
  validateExchangeAmountFallback,
} from "./exchange-api-fallback"

// Fix the API URL and endpoint structure
const CHANGENOW_API_URL = "https://api.changenow.io/v1"
const CHANGENOW_API_KEY = process.env.NEXT_PUBLIC_CHANGENOW_API_KEY || ""

// Flag to control whether to use fallback if the real API fails
const USE_FALLBACK_ON_FAILURE = true

// Supported currencies for exchange to Kaspa
export const SUPPORTED_CURRENCIES = [
  {
    symbol: "btc",
    name: "Bitcoin",
    logoUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  },
  {
    symbol: "eth",
    name: "Ethereum",
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    symbol: "usdt",
    name: "Tether USD",
    logoUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  },
  {
    symbol: "usdc",
    name: "USD Coin",
    logoUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  },
  {
    symbol: "sol",
    name: "Solana",
    logoUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/solana-sol-logo-QNdpvcw87ctU3of0NAXRrbAHndYmr9.png",
  },
  {
    symbol: "doge",
    name: "Dogecoin",
    logoUrl: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
  },
  {
    symbol: "ltc",
    name: "Litecoin",
    logoUrl: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
  },
  {
    symbol: "bnb",
    name: "Binance Coin",
    logoUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  },
  {
    symbol: "xrp",
    name: "Ripple",
    logoUrl: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
  },
  {
    symbol: "ada",
    name: "Cardano",
    logoUrl: "https://cryptologos.cc/logos/cardano-ada-logo.png",
  },
]

// Types
export interface ExchangePair {
  from: string
  to: string
  flow: string
  rate: number
  minerFee: number
  networkFee: number
  estimatedAmount: number
}

export interface ExchangeTransaction {
  id: string
  from: string
  to: string
  amount: string
  payinAddress: string
  payoutAddress: string
  refundAddress?: string
  validUntil: string
  status: string
}

export interface ExchangeEstimate {
  estimatedAmount: string
  rate: string
  fee: string
  minAmount?: string
  maxAmount?: string
}

export interface ExchangeError {
  error: string
  message: string
  statusCode: number
}

// Update the getExchangeEstimate function to handle undefined values properly
export async function getExchangeEstimate(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
): Promise<ExchangeEstimate> {
  try {
    // Log the request parameters for debugging
    console.log(`Requesting estimate for ${amount} ${fromCurrency} to ${toCurrency}`)

    const response = await fetch(
      `${CHANGENOW_API_URL}/exchange-amount/${amount}/${fromCurrency}_${toCurrency}/?api_key=${CHANGENOW_API_KEY}`,
    )

    // Log the raw response for debugging
    console.log(`Response status: ${response.status}`)

    const data = await response.json()

    // Log the response data for debugging
    console.log("API Response:", data)

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`)
    }

    // Check if required properties exist and provide defaults if they don't
    if (data.estimatedAmount === undefined) {
      throw new Error("API response missing estimatedAmount")
    }

    // Safely convert values to strings with fallbacks
    return {
      estimatedAmount: String(data.estimatedAmount || 0),
      rate: String(data.rate || 0),
      fee: String(data.networkFee || data.minerFee || 0),
      minAmount: data.minAmount !== undefined ? String(data.minAmount) : undefined,
      maxAmount: data.maxAmount !== undefined ? String(data.maxAmount) : undefined,
    }
  } catch (error: any) {
    console.error("Exchange estimate error:", error)

    // Use fallback if enabled and the real API failed
    if (USE_FALLBACK_ON_FAILURE) {
      console.log("Using fallback implementation for exchange estimate")
      try {
        return await getExchangeEstimateFallback(fromCurrency, toCurrency, amount)
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
        throw error // Throw the original error if fallback also fails
      }
    }

    throw new Error(`Failed to get exchange estimate: ${error.message}`)
  }
}

// Update the createExchangeTransaction function to use the correct endpoint
export async function createExchangeTransaction(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
  address: string,
  refundAddress?: string,
): Promise<ExchangeTransaction> {
  try {
    const payload = {
      from: fromCurrency,
      to: toCurrency,
      amount: amount,
      address: address,
      extraId: "",
      refundAddress: refundAddress || "",
      refundExtraId: "",
      userId: "kaspatip-user",
      contactEmail: "",
    }

    console.log("Creating transaction with payload:", payload)

    const response = await fetch(`${CHANGENOW_API_URL}/transactions/${CHANGENOW_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    console.log("Transaction creation response:", data)

    if (!response.ok) {
      throw new Error(data.message || "Failed to create exchange transaction")
    }

    return {
      id: data.id,
      from: data.fromCurrency,
      to: data.toCurrency,
      amount: String(data.amount || 0),
      payinAddress: data.payinAddress,
      payoutAddress: data.payoutAddress,
      refundAddress: data.refundAddress,
      validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      status: data.status || "waiting",
    }
  } catch (error: any) {
    console.error("Exchange transaction error:", error)

    // Use fallback if enabled and the real API failed
    if (USE_FALLBACK_ON_FAILURE) {
      console.log("Using fallback implementation for transaction creation")
      try {
        return await createExchangeTransactionFallback(fromCurrency, toCurrency, amount, address, refundAddress)
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
        throw error // Throw the original error if fallback also fails
      }
    }

    throw new Error(`Failed to create exchange transaction: ${error.message}`)
  }
}

// Update the getTransactionStatus function to use the correct endpoint
export async function getTransactionStatus(id: string): Promise<any> {
  try {
    const response = await fetch(`${CHANGENOW_API_URL}/transactions/${id}/${CHANGENOW_API_KEY}`)

    const data = await response.json()
    console.log("Transaction status response:", data)

    if (!response.ok) {
      throw new Error(data.message || "Failed to get transaction status")
    }

    return data
  } catch (error: any) {
    console.error("Transaction status error:", error)

    // Use fallback if enabled and the real API failed
    if (USE_FALLBACK_ON_FAILURE) {
      console.log("Using fallback implementation for transaction status")
      try {
        return await getTransactionStatusFallback(id)
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
        throw error // Throw the original error if fallback also fails
      }
    }

    throw new Error(`Failed to get transaction status: ${error.message}`)
  }
}

// Update the getMinimumExchangeAmount function to use the correct endpoint
export async function getMinimumExchangeAmount(fromCurrency: string, toCurrency: string): Promise<string> {
  try {
    const response = await fetch(
      `${CHANGENOW_API_URL}/min-amount/${fromCurrency}_${toCurrency}?api_key=${CHANGENOW_API_KEY}`,
    )

    const data = await response.json()
    console.log("Minimum amount response:", data)

    if (!response.ok) {
      throw new Error(data.message || "Failed to get minimum exchange amount")
    }

    // Ensure we return a string, with a default of "0" if minAmount is undefined
    return String(data.minAmount || 0)
  } catch (error: any) {
    console.error("Minimum amount error:", error)

    // Use fallback if enabled and the real API failed
    if (USE_FALLBACK_ON_FAILURE) {
      console.log("Using fallback implementation for minimum amount")
      try {
        return await getMinimumExchangeAmountFallback(fromCurrency, toCurrency)
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
        throw error // Throw the original error if fallback also fails
      }
    }

    throw new Error(`Failed to get minimum exchange amount: ${error.message}`)
  }
}

/**
 * Validate if an amount is within exchange limits
 */
export async function validateExchangeAmount(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
): Promise<{ valid: boolean; message?: string; minAmount?: string }> {
  try {
    const minAmount = await getMinimumExchangeAmount(fromCurrency, toCurrency)

    if (Number.parseFloat(amount) < Number.parseFloat(minAmount)) {
      return {
        valid: false,
        message: `Minimum amount is ${minAmount} ${fromCurrency.toUpperCase()}`,
        minAmount,
      }
    }

    return { valid: true }
  } catch (error: any) {
    console.log("Validation error:", error)

    // Use fallback if enabled and the real API failed
    if (USE_FALLBACK_ON_FAILURE) {
      console.log("Using fallback implementation for validation")
      try {
        return await validateExchangeAmountFallback(fromCurrency, toCurrency, amount)
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError)
      }
    }

    return {
      valid: false,
      message: error.message,
    }
  }
}

/**
 * Format currency amount with appropriate precision
 */
export function formatCurrencyAmount(amount: number | string, currency: string): string {
  const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

  // Different currencies have different standard decimal precisions
  const precisionMap: Record<string, number> = {
    btc: 8,
    eth: 6,
    usdt: 2,
    usdc: 2,
    sol: 4,
    doge: 2,
    kas: 8,
    default: 4,
  }

  const precision = precisionMap[currency.toLowerCase()] || precisionMap.default
  return numAmount.toFixed(precision)
}

