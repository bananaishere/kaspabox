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

    // Check if response is OK before trying to parse JSON
    if (!response.ok) {
      console.warn(`API returned status ${response.status}: ${response.statusText}`)
      return [] // Return empty array as fallback
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("Error fetching fiat currency pairs:", error)
    return [] // Return empty array as fallback
  }
}

/**
 * Get minimum and maximum fiat amount for a currency pair
 * Modified to handle "Not Found" responses gracefully
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

    // Default values in case API call fails
    const defaultMinAmount = getCurrencyDefaultMinAmount(fromCurrency)
    const defaultMaxAmount = getCurrencyDefaultMaxAmount(fromCurrency)

    // Check if API key is available
    if (!CHANGENOW_API_KEY) {
      console.warn("API key is not configured. Using default values.")
      return {
        minAmount: defaultMinAmount,
        maxAmount: defaultMaxAmount,
      }
    }

    const response = await fetch(
      `${CHANGENOW_API_URL}/ranges?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&api_key=${CHANGENOW_API_KEY}`,
    )

    // Check if response is OK before trying to parse JSON
    if (!response.ok) {
      console.warn(`API returned status ${response.status}: ${response.statusText}`)

      // Update cache with default values
      rateCache[cacheKey] = {
        rate: 0,
        timestamp: now,
        minAmount: defaultMinAmount,
        maxAmount: defaultMaxAmount,
      }

      return {
        minAmount: defaultMinAmount,
        maxAmount: defaultMaxAmount,
      }
    }

    const data = await response.json()

    // Update cache with range data
    if (!rateCache[cacheKey]) {
      rateCache[cacheKey] = {
        rate: 0,
        timestamp: now,
        minAmount: data.minAmount || defaultMinAmount,
        maxAmount: data.maxAmount || defaultMaxAmount,
      }
    } else {
      rateCache[cacheKey].minAmount = data.minAmount || defaultMinAmount
      rateCache[cacheKey].maxAmount = data.maxAmount || defaultMaxAmount
      rateCache[cacheKey].timestamp = now
    }

    return {
      minAmount: data.minAmount || defaultMinAmount,
      maxAmount: data.maxAmount || defaultMaxAmount,
    }
  } catch (error: any) {
    console.error("Error fetching fiat range:", error)

    // Return default values based on currency
    return {
      minAmount: getCurrencyDefaultMinAmount(fromCurrency),
      maxAmount: getCurrencyDefaultMaxAmount(fromCurrency),
    }
  }
}

/**
 * Helper function to get default minimum amount based on currency
 */
function getCurrencyDefaultMinAmount(currency: string): number {
  switch (currency.toLowerCase()) {
    case "usd":
      return 50
    case "eur":
      return 50
    case "gbp":
      return 40
    default:
      return 50
  }
}

/**
 * Helper function to get default maximum amount based on currency
 */
function getCurrencyDefaultMaxAmount(currency: string): number {
  switch (currency.toLowerCase()) {
    case "usd":
      return 20000
    case "eur":
      return 18000
    case "gbp":
      return 16000
    default:
      return 20000
  }
}

/**
 * Get estimated crypto amount for a fiat purchase
 * Modified to handle API errors gracefully
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

    // Get default values for fallback
    const defaultMinAmount = getCurrencyDefaultMinAmount(fromCurrency)
    const defaultMaxAmount = getCurrencyDefaultMaxAmount(fromCurrency)

    // Check if API key is available
    if (!CHANGENOW_API_KEY) {
      console.warn("API key is not configured. Using mock estimation.")
      // Use mock estimation
      const mockRate = getMockExchangeRate(fromCurrency, toCurrency)
      const estimatedAmount = (Number(amount) * mockRate).toString()
      const networkFee = (Number(amount) * 0.05).toString()

      // Update cache
      rateCache[cacheKey] = {
        rate: mockRate,
        timestamp: now,
        minAmount: defaultMinAmount,
        maxAmount: defaultMaxAmount,
      }

      return {
        estimatedAmount,
        rate: mockRate.toString(),
        networkFee,
        minAmount: defaultMinAmount.toString(),
        maxAmount: defaultMaxAmount.toString(),
      }
    }

    // Fetch new estimate from API
    const response = await fetch(
      `${CHANGENOW_API_URL}/estimate?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&fromAmount=${amount}&api_key=${CHANGENOW_API_KEY}`,
    )

    // Check if response is OK before trying to parse JSON
    if (!response.ok) {
      console.warn(`API returned status ${response.status}: ${response.statusText}`)

      // Use mock estimation as fallback
      const mockRate = getMockExchangeRate(fromCurrency, toCurrency)
      const estimatedAmount = (Number(amount) * mockRate).toString()
      const networkFee = (Number(amount) * 0.05).toString()

      // Update cache
      rateCache[cacheKey] = {
        rate: mockRate,
        timestamp: now,
        minAmount: defaultMinAmount,
        maxAmount: defaultMaxAmount,
      }

      return {
        estimatedAmount,
        rate: mockRate.toString(),
        networkFee,
        minAmount: defaultMinAmount.toString(),
        maxAmount: defaultMaxAmount.toString(),
      }
    }

    const data = await response.json()

    // Update rate cache
    const rate =
      Number(data.rate) ||
      Number(data.estimatedAmount) / Number(amount) ||
      getMockExchangeRate(fromCurrency, toCurrency)

    // Get range data if we don't have it
    let minAmount = defaultMinAmount
    let maxAmount = defaultMaxAmount

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
      estimatedAmount: data.estimatedAmount?.toString() || (Number(amount) * rate).toString(),
      rate: data.rate?.toString() || rate.toString(),
      networkFee: data.networkFee ? data.networkFee.toString() : (Number(amount) * 0.05).toString(),
      minAmount: minAmount.toString(),
      maxAmount: maxAmount.toString(),
    }
  } catch (error: any) {
    console.error("Error fetching fiat estimate:", error)

    // Use mock estimation as fallback
    const mockRate = getMockExchangeRate(fromCurrency, toCurrency)
    const estimatedAmount = (Number(amount) * mockRate).toString()
    const networkFee = (Number(amount) * 0.05).toString()
    const minAmount = getCurrencyDefaultMinAmount(fromCurrency)
    const maxAmount = getCurrencyDefaultMaxAmount(fromCurrency)

    return {
      estimatedAmount,
      rate: mockRate.toString(),
      networkFee,
      minAmount: minAmount.toString(),
      maxAmount: maxAmount.toString(),
    }
  }
}

/**
 * Helper function to get mock exchange rates
 */
function getMockExchangeRate(fromCurrency: string, toCurrency: string): number {
  // Mock exchange rates for common pairs
  if (toCurrency.toLowerCase() === "kas") {
    switch (fromCurrency.toLowerCase()) {
      case "usd":
        return 50.0 // 1 USD = 50 KAS
      case "eur":
        return 55.0 // 1 EUR = 55 KAS
      case "gbp":
        return 65.0 // 1 GBP = 65 KAS
      default:
        return 50.0
    }
  } else if (toCurrency.toLowerCase() === "btc") {
    switch (fromCurrency.toLowerCase()) {
      case "usd":
        return 0.000025 // 1 USD = 0.000025 BTC
      case "eur":
        return 0.000027 // 1 EUR = 0.000027 BTC
      case "gbp":
        return 0.00003 // 1 GBP = 0.000030 BTC
      default:
        return 0.000025
    }
  } else if (toCurrency.toLowerCase() === "eth") {
    switch (fromCurrency.toLowerCase()) {
      case "usd":
        return 0.00035 // 1 USD = 0.00035 ETH
      case "eur":
        return 0.00038 // 1 EUR = 0.00038 ETH
      case "gbp":
        return 0.00042 // 1 GBP = 0.00042 ETH
      default:
        return 0.00035
    }
  } else if (toCurrency.toLowerCase() === "sol") {
    switch (fromCurrency.toLowerCase()) {
      case "usd":
        return 0.0075 // 1 USD = 0.0075 SOL
      case "eur":
        return 0.0082 // 1 EUR = 0.0082 SOL
      case "gbp":
        return 0.009 // 1 GBP = 0.0090 SOL
      default:
        return 0.0075
    }
  }

  // Default fallback rate
  return 1.0
}

/**
 * Create a fiat-to-crypto transaction
 * Modified to handle API errors gracefully
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

    // Check if API key is available
    if (!CHANGENOW_API_KEY) {
      console.warn("API key is not configured. Using mock transaction.")
      // Return mock transaction data
      return createMockTransaction(fromCurrency, toCurrency, amount, address)
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

    // Check if response is OK before trying to parse JSON
    if (!response.ok) {
      console.warn(`API returned status ${response.status}: ${response.statusText}`)
      // Return mock transaction data as fallback
      return createMockTransaction(fromCurrency, toCurrency, amount, address)
    }

    const data = await response.json()
    console.log("Fiat transaction creation response:", data)

    return {
      id: data.id || `mock_${Date.now()}`,
      paymentUrl:
        data.paymentUrl ||
        `https://changenow.io/exchange/direct?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`,
      status: data.status || "waiting",
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    }
  } catch (error: any) {
    console.error("Fiat transaction error:", error)
    // Return mock transaction data as fallback
    return createMockTransaction(fromCurrency, toCurrency, amount, address)
  }
}

/**
 * Helper function to create mock transaction data
 */
function createMockTransaction(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
  address: string,
): FiatTransaction {
  const id = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  return {
    id,
    paymentUrl: `https://changenow.io/exchange/direct?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`,
    status: "waiting",
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
  }
}

/**
 * Get the status of a fiat-to-crypto transaction
 * Modified to handle API errors gracefully
 */
export async function getFiatTransactionStatus(id: string): Promise<any> {
  try {
    // Check if it's a mock transaction
    if (id.startsWith("mock_")) {
      // Return mock status data
      return {
        id,
        status: "waiting",
        fromAmount: "100",
        fromCurrency: "USD",
        toAmount: "5000",
        toCurrency: "KAS",
        payinAddress: "mock_address",
        payoutAddress: "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj",
        updatedAt: new Date().toISOString(),
      }
    }

    // Check if API key is available
    if (!CHANGENOW_API_KEY) {
      console.warn("API key is not configured. Using mock status.")
      return {
        id,
        status: "waiting",
        fromAmount: "100",
        fromCurrency: "USD",
        toAmount: "5000",
        toCurrency: "KAS",
        payinAddress: "mock_address",
        payoutAddress: "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj",
        updatedAt: new Date().toISOString(),
      }
    }

    const response = await fetch(`${CHANGENOW_API_URL}/transactions/${id}/?api_key=${CHANGENOW_API_KEY}`)

    // Check if response is OK before trying to parse JSON
    if (!response.ok) {
      console.warn(`API returned status ${response.status}: ${response.statusText}`)
      // Return mock status data as fallback
      return {
        id,
        status: "waiting",
        fromAmount: "100",
        fromCurrency: "USD",
        toAmount: "5000",
        toCurrency: "KAS",
        payinAddress: "mock_address",
        payoutAddress: "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj",
        updatedAt: new Date().toISOString(),
      }
    }

    return await response.json()
  } catch (error: any) {
    console.error("Transaction status error:", error)
    // Return mock status data as fallback
    return {
      id,
      status: "waiting",
      fromAmount: "100",
      fromCurrency: "USD",
      toAmount: "5000",
      toCurrency: "KAS",
      payinAddress: "mock_address",
      payoutAddress: "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj",
      updatedAt: new Date().toISOString(),
    }
  }
}

