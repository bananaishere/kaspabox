import { isValidKaspaAddress } from "@/lib/address-utils"

const CHANGENOW_API_URL = "https://api.changenow.io/v1/fiat-to-crypto"
const CHANGENOW_API_KEY = process.env.NEXT_PUBLIC_CHANGENOW_API_KEY || ""

// Rate cache to avoid excessive API calls
const rateCache: Record<string, { rate: number; timestamp: number; minAmount: number; maxAmount: number }> = {}
const CACHE_EXPIRY = 60000 // 1 minute

// Supported fiat currencies
export const SUPPORTED_FIAT = [
  {
    symbol: "usd",
    name: "US Dollar",
    sign: "$",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/usd-logo-Ow9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd.png",
  },
  {
    symbol: "eur",
    name: "Euro",
    sign: "€",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eur-logo-Ow9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd.png",
  },
  {
    symbol: "gbp",
    name: "British Pound",
    sign: "£",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gbp-logo-Ow9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd9Iy9Yd.png",
  },
]

// Supported cryptocurrencies for purchase
export const SUPPORTED_CRYPTO = [
  {
    symbol: "kas",
    name: "Kaspa",
    logoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-color-a6gTLOtFUkyTfto7nuemX26goOL0VS.png",
  },
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
    symbol: "sol",
    name: "Solana",
    logoUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/solana-sol-logo-QNdpvcw87ctU3of0NAXRrbAHndYmr9.png",
  },
]

// Types for API responses
export interface FiatRange {
  minAmount: number
  maxAmount: number
}

export interface FiatEstimate {
  estimatedAmount: string
  rate: string
  networkFee: string
  minAmount: string
  maxAmount: string
}

export interface FiatTransaction {
  id: string
  paymentUrl: string
  status: string
  createdAt: string
  validUntil: string
}

/**
 * Get available fiat-to-crypto currency pairs
 */
export async function getFiatCurrencyPairs(): Promise<any> {
  try {
    const response = await fetch(`${CHANGENOW_API_URL}/currencies?api_key=${CHANGENOW_API_KEY}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `API Error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("Error fetching fiat currency pairs:", error)
    throw new Error(`Failed to get currency pairs: ${error.message}`)
  }
}

/**
 * Get minimum and maximum fiat amount for a currency pair
 */
export async function getFiatRange(fromCurrency: string, toCurrency: string): Promise<FiatRange> {
  try {
    // Check cache first
    const cacheKey = `${fromCurrency}_${toCurrency}_range`
    const now = Date.now()
    if (rateCache[cacheKey] && now - rateCache[cacheKey].timestamp < CACHE_EXPIRY) {
      return {
        minAmount: rateCache[cacheKey].minAmount,
        maxAmount: rateCache[cacheKey].maxAmount,
      }
    }

    const response = await fetch(
      `${CHANGENOW_API_URL}/ranges?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&api_key=${CHANGENOW_API_KEY}`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `API Error: ${response.status}`)
    }

    const data = await response.json()

    // Update cache with range data
    if (!rateCache[cacheKey]) {
      rateCache[cacheKey] = {
        rate: 0,
        timestamp: now,
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
      }
    } else {
      rateCache[cacheKey].minAmount = data.minAmount
      rateCache[cacheKey].maxAmount = data.maxAmount
      rateCache[cacheKey].timestamp = now
    }

    return {
      minAmount: data.minAmount,
      maxAmount: data.maxAmount,
    }
  } catch (error: any) {
    console.error("Error fetching fiat range:", error)

    // Return default values if API fails
    return {
      minAmount: 50,
      maxAmount: 20000,
    }
  }
}

/**
 * Get estimated crypto amount for a fiat purchase
 */
export async function getFiatEstimate(fromCurrency: string, toCurrency: string, amount: string): Promise<FiatEstimate> {
  try {
    // Check cache for rate first
    const cacheKey = `${fromCurrency}_${toCurrency}_rate`
    const now = Date.now()

    // Simple estimation if we have a cached rate
    if (rateCache[cacheKey] && now - rateCache[cacheKey].timestamp < CACHE_EXPIRY) {
      const rate = rateCache[cacheKey].rate
      const estimatedAmount = (Number(amount) * rate).toString()
      // Standard network fee (this would normally come from the API)
      const networkFee = (Number(amount) * 0.05).toString() // Approximate 5% fee

      return {
        estimatedAmount,
        rate: rate.toString(),
        networkFee,
        minAmount: rateCache[cacheKey].minAmount.toString(),
        maxAmount: rateCache[cacheKey].maxAmount.toString(),
      }
    }

    // Fetch new estimate from API
    const response = await fetch(
      `${CHANGENOW_API_URL}/estimate?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&fromAmount=${amount}&api_key=${CHANGENOW_API_KEY}`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `API Error: ${response.status}`)
    }

    const data = await response.json()

    // Update rate cache
    const rate = Number(data.rate) || Number(data.estimatedAmount) / Number(amount)

    // Get range data if we don't have it
    let minAmount = 50
    let maxAmount = 20000

    try {
      const rangeData = await getFiatRange(fromCurrency, toCurrency)
      minAmount = rangeData.minAmount
      maxAmount = rangeData.maxAmount
    } catch (e) {
      console.warn("Couldn't get range data, using defaults")
    }

    // Update cache
    rateCache[cacheKey] = {
      rate,
      timestamp: now,
      minAmount,
      maxAmount,
    }

    return {
      estimatedAmount: data.estimatedAmount.toString(),
      rate: data.rate.toString(),
      networkFee: data.networkFee ? data.networkFee.toString() : "0",
      minAmount: minAmount.toString(),
      maxAmount: maxAmount.toString(),
    }
  } catch (error: any) {
    console.error("Error fetching fiat estimate:", error)
    throw new Error(`Failed to get estimate: ${error.message}`)
  }
}

/**
 * Create a fiat-to-crypto transaction
 */
export async function createFiatTransaction(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
  address: string,
  returnUrl: string,
): Promise<FiatTransaction> {
  try {
    // Validate address for KAS
    if (toCurrency.toLowerCase() === "kas" && !isValidKaspaAddress(address)) {
      throw new Error("Invalid Kaspa address")
    }

    const payload = {
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      address,
      flow: "standard", // standard flow
      type: "direct", // direct purchase
      returnUrl, // URL to return to after payment
      userId: "kaspabox-user", // optional user identifier
    }

    console.log("Creating fiat transaction with payload:", payload)

    const response = await fetch(`${CHANGENOW_API_URL}/transactions/?api_key=${CHANGENOW_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `API Error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Fiat transaction creation response:", data)

    return {
      id: data.id,
      paymentUrl: data.paymentUrl,
      status: data.status || "waiting",
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    }
  } catch (error: any) {
    console.error("Fiat transaction error:", error)
    throw new Error(`Failed to create transaction: ${error.message}`)
  }
}

/**
 * Get the status of a fiat-to-crypto transaction
 */
export async function getFiatTransactionStatus(id: string): Promise<any> {
  try {
    const response = await fetch(`${CHANGENOW_API_URL}/transactions/${id}/?api_key=${CHANGENOW_API_KEY}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error("Transaction status error:", error)
    throw new Error(`Failed to get transaction status: ${error.message}`)
  }
}

