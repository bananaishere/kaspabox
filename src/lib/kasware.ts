import * as KaspaAPI from "./kaspa-api"

// Define Kasware wallet interface with multiple possible API methods
interface KaswareWallet {
  isKasware?: boolean

  // Account methods
  getAccounts?: () => Promise<string[]>
  accounts?: () => Promise<string[]>
  selectedAddress?: string

  // Transaction methods
  sendKaspa: (params: {
    to: string
    amount: string
    message?: string
  }) => Promise<
    | {
        hash?: string
        txid?: string
        transactionId?: string
      }
    | string
  >
  sendTransaction?: (txParams: any) => Promise<any>
  transfer?: (txParams: any) => Promise<any>
  send?: (txParams: any) => Promise<any>
  signTransaction?: (txParams: any) => Promise<any>
  sendSignedTransaction?: (signedTx: any) => Promise<any>
  createTransaction?: (txParams: any) => Promise<any>
  signAndSendTransaction?: (tx: any) => Promise<any>
  request?: (args: { method: string; params: any[] }) => Promise<any>

  // Event methods
  on?: (event: string, handler: (data: any) => void) => void
  addListener?: (event: string, handler: (data: any) => void) => void
  addEventListener?: (event: string, handler: (data: any) => void) => void
  removeListener?: (event: string, handler: (data: any) => void) => void
  off?: (event: string, handler: (data: any) => void) => void
  removeEventListener?: (event: string, handler: (data: any) => void) => void

  [key: string]: any // Allow any method to be accessed
}

// Extend Window interface to include kasware
declare global {
  interface Window {
    kasware?: KaswareWallet
  }
}

/**
 * Checks if the Kasware wallet extension is installed
 * Uses multiple detection methods for better compatibility
 */
export function isKaswareInstalled(): boolean {
  if (typeof window === "undefined") return false

  const hasKaswareObject = typeof window.kasware !== "undefined"

  if (!hasKaswareObject) return false

  // Try multiple detection methods
  return (
    // Official flag
    window.kasware.isKasware === true ||
    // Method existence checks
    typeof window.kasware.getAccounts === "function" ||
    typeof window.kasware.accounts === "function" ||
    typeof window.kasware.requestAccounts === "function" ||
    typeof window.kasware.enable === "function" ||
    // Property checks
    typeof window.kasware.selectedAddress === "string"
  )
}

/**
 * Formats a Kaspa address for display by truncating the middle
 */
export function formatKaspaAddress(address: string, startChars = 12, endChars = 4): string {
  if (!address) return ""
  if (address.length <= startChars + endChars) return address

  const start = address.substring(0, startChars)
  const end = address.substring(address.length - endChars)
  return `${start}...${end}`
}

/**
 * Validates a Kaspa address format
 * Enhanced with more thorough validation
 */
export function isValidKaspaAddress(address: string): boolean {
  if (!address) return false

  // Trim any whitespace
  const trimmedAddress = address.trim()

  // Basic validation - Kaspa addresses start with "kaspa:" and are typically 62-66 characters long
  if (!trimmedAddress.startsWith("kaspa:")) return false

  // Check length (typical Kaspa addresses are 62-66 characters)
  if (trimmedAddress.length < 60 || trimmedAddress.length > 70) return false

  // Check for invalid characters (Kaspa addresses should only contain alphanumeric characters after the prefix)
  const addressPart = trimmedAddress.substring(6) // Remove "kaspa:" prefix
  const validCharsRegex = /^[a-zA-Z0-9]+$/
  if (!validCharsRegex.test(addressPart)) return false

  return true
}

/**
 * Normalizes a Kaspa address by trimming whitespace and ensuring proper format
 */
export function normalizeKaspaAddress(address: string): string {
  // Trim whitespace
  const trimmed = address.trim()

  // If it's already a valid address, return it
  if (isValidKaspaAddress(trimmed)) {
    return trimmed
  }

  // If it doesn't have the kaspa: prefix, add it and check again
  if (!trimmed.startsWith("kaspa:")) {
    const withPrefix = `kaspa:${trimmed}`
    if (isValidKaspaAddress(withPrefix)) {
      return withPrefix
    }
  }

  // Return the original trimmed address if we couldn't normalize it
  return trimmed
}

/**
 * Converts KAS amount to sompi (smallest unit)
 * 1 KAS = 100,000,000 sompi
 */
export function kasToSompi(kas: number): bigint {
  return BigInt(Math.floor(kas * 100_000_000))
}

/**
 * Converts sompi amount to KAS
 */
export function sompiToKas(sompi: bigint): number {
  return Number(sompi) / 100_000_000
}

/**
 * Gets the current connected wallet address
 * Tries multiple methods for better compatibility
 */
export async function getCurrentWalletAddress(): Promise<string | null> {
  if (!isKaswareInstalled()) return null

  try {
    // Try different methods to get the current address
    if (typeof window.kasware.getAccounts === "function") {
      const accounts = await window.kasware.getAccounts()
      return accounts && accounts.length > 0 ? accounts[0] : null
    }

    if (typeof window.kasware.accounts === "function") {
      const accounts = await window.kasware.accounts()
      return accounts && accounts.length > 0 ? accounts[0] : null
    }

    if (window.kasware.selectedAddress) {
      return window.kasware.selectedAddress
    }

    return null
  } catch (error) {
    console.error("Error getting current wallet address:", error)
    return null
  }
}

/**
 * Formats an amount to a valid Kaspa amount string
 * Ensures the amount has max 8 decimal places and is a valid number
 */
export function formatKaspaAmount(amount: number | string): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  if (isNaN(num) || num <= 0) {
    throw new Error("Invalid amount")
  }
  // Format with exactly 8 decimal places for consistency
  return num.toFixed(8)
}

// Add a function to check the balance of a Kaspa address
export async function checkKaspaBalance(address: string): Promise<number> {
  try {
    const balanceData = await KaspaAPI.getAddressBalance(address)
    // Convert from sompi to KAS
    return KaspaAPI.sompiToKas(balanceData.balance)
  } catch (error) {
    console.error("Error checking Kaspa balance:", error)
    throw error
  }
}

/**
 * Sends Kaspa tokens to a specified address
 * @param to Recipient address
 * @param amount Amount in KAS (as a string or number)
 * @param message Optional message
 * @returns Transaction result
 */
export async function sendKaspa(to: string, amount: string | number, message?: string): Promise<any> {
  if (!isKaswareInstalled()) {
    // If Kasware is not installed, throw an error
    // In a real application, you might want to use the API as a fallback
    throw new Error("Kasware wallet is not installed")
  }

  // Normalize and validate the address
  const normalizedAddress = normalizeKaspaAddress(to)
  if (!isValidKaspaAddress(normalizedAddress)) {
    throw new Error("Invalid Kaspa address format")
  }

  try {
    // Format amount properly with 8 decimal places
    const formattedAmount = formatKaspaAmount(amount)

    // Log transaction details for debugging
    console.log("Sending transaction with params:", { to: normalizedAddress, amount: formattedAmount, message })

    // Prepare transaction parameters
    const params: any = {
      to: normalizedAddress,
      amount: formattedAmount,
    }

    if (message) {
      params.message = message
    }

    // Send transaction using the wallet's sendKaspa method
    const result = await window.kasware.sendKaspa(params)
    console.log("Transaction result:", result)
    return result
  } catch (error) {
    console.error("Error sending Kaspa:", error)
    throw error
  }
}

// Add a function to get transaction status
export async function getKaspaTransactionStatus(txid: string): Promise<KaspaAPI.KaspaTransactionStatus> {
  try {
    return await KaspaAPI.getTransactionStatus(txid)
  } catch (error) {
    console.error("Error getting transaction status:", error)
    throw error
  }
}

/**
 * Logs all available methods on the Kasware object
 * Useful for debugging
 */
export function logKaswareMethods(): void {
  if (!isKaswareInstalled()) {
    console.log("Kasware not installed")
    return
  }

  console.log("Available Kasware methods:")
  for (const key in window.kasware) {
    const type = typeof window.kasware[key]
    console.log(`- ${key}: ${type}`)
  }
}

