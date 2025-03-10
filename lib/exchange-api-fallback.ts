const MOCK_EXCHANGE_RATES: Record<string, number> = {
  btc: 250000, // 1 BTC = 250,000 KAS
  eth: 15000, // 1 ETH = 15,000 KAS
  usdt: 3.5, // 1 USDT = 3.5 KAS
  usdc: 3.5, // 1 USDC = 3.5 KAS
  sol: 350, // 1 SOL = 350 KAS
  doge: 0.35, // 1 DOGE = 0.35 KAS
  ltc: 85, // 1 LTC = 85 KAS
  bnb: 450, // 1 BNB = 450 KAS
  xrp: 0.75, // 1 XRP = 0.75 KAS
  ada: 0.45, // 1 ADA = 0.45 KAS
}

// Mock minimum amounts
const MOCK_MIN_AMOUNTS: Record<string, number> = {
  btc: 0.0001,
  eth: 0.01,
  usdt: 10,
  usdc: 10,
  sol: 0.1,
  doge: 50,
  ltc: 0.1,
  bnb: 0.05,
  xrp: 10,
  ada: 10,
}

// Types (same as the real API)
export interface ExchangeEstimate {
  estimatedAmount: string
  rate: string
  fee: string
  minAmount?: string
  maxAmount?: string
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

/**
 * Get estimated exchange amount (fallback implementation)
 */
export async function getExchangeEstimateFallback(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
): Promise<ExchangeEstimate> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const rate = MOCK_EXCHANGE_RATES[fromCurrency.toLowerCase()] || 1
  const estimatedAmount = (Number.parseFloat(amount) * rate).toString()
  const fee = (Number.parseFloat(estimatedAmount) * 0.01).toString() // 1% fee

  return {
    estimatedAmount,
    rate: rate.toString(),
    fee,
    minAmount: MOCK_MIN_AMOUNTS[fromCurrency.toLowerCase()]?.toString(),
    maxAmount: (MOCK_MIN_AMOUNTS[fromCurrency.toLowerCase()] * 1000).toString(), // 1000x min amount
  }
}

/**
 * Create an exchange transaction (fallback implementation)
 */
export async function createExchangeTransactionFallback(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
  address: string,
  refundAddress?: string,
): Promise<ExchangeTransaction> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const id = `mock_${Date.now().toString(16)}`
  const rate = MOCK_EXCHANGE_RATES[fromCurrency.toLowerCase()] || 1
  const estimatedAmount = (Number.parseFloat(amount) * rate).toString()

  return {
    id,
    from: fromCurrency,
    to: toCurrency,
    amount,
    payinAddress: `mock_${fromCurrency.toLowerCase()}_address_${Math.random().toString(16).substring(2, 10)}`,
    payoutAddress: address,
    refundAddress,
    validUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    status: "waiting",
  }
}

/**
 * Get transaction status (fallback implementation)
 */
export async function getTransactionStatusFallback(id: string): Promise<any> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Extract timestamp from mock ID to determine status
  const timestamp = Number.parseInt(id.split("_")[1] || "0", 16)
  const elapsedSeconds = (Date.now() - timestamp) / 1000

  let status = "waiting"
  if (elapsedSeconds > 60) {
    status = "finished"
  } else if (elapsedSeconds > 30) {
    status = "exchanging"
  } else if (elapsedSeconds > 15) {
    status = "confirming"
  }

  return {
    id,
    status,
    hash: `0x${Math.random().toString(16).substring(2, 42)}`,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Get minimum exchange amount (fallback implementation)
 */
export async function getMinimumExchangeAmountFallback(fromCurrency: string, toCurrency: string): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return (MOCK_MIN_AMOUNTS[fromCurrency.toLowerCase()] || 0.001).toString()
}

/**
 * Validate if an amount is within exchange limits (fallback implementation)
 */
export async function validateExchangeAmountFallback(
  fromCurrency: string,
  toCurrency: string,
  amount: string,
): Promise<{ valid: boolean; message?: string; minAmount?: string }> {
  const minAmount = await getMinimumExchangeAmountFallback(fromCurrency, toCurrency)

  if (Number.parseFloat(amount) < Number.parseFloat(minAmount)) {
    return {
      valid: false,
      message: `Minimum amount is ${minAmount} ${fromCurrency.toUpperCase()}`,
      minAmount,
    }
  }

  return { valid: true }
}

