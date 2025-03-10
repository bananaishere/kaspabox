export interface KaswareAPI {
  // Methods
  requestAccounts: () => Promise<string[]>
  getAccounts: () => Promise<string[]>
  getVersion: () => Promise<string>
  getNetwork: () => Promise<string>
  switchNetwork: (network: string) => Promise<void>
  disconnect: () => Promise<void>
  getPublicKey: () => Promise<string>
  getBalance: () => Promise<string>
  getKRC20Balance: (tokenAddress: string) => Promise<string>
  getTokens?: () => Promise<Array<{ symbol: string; name: string; balance: string; address?: string }>>
  createKRC20Order: (params: any) => Promise<any>
  buyKRC20Token: (params: any) => Promise<any>
  cancelKRC20Order: (orderId: string) => Promise<any>
  signMessage: (message: string) => Promise<string>
  signKRC20Transaction: (params: any) => Promise<any>
  sendKaspa: (
    toAddress: string,
    sompi: number,
    options?: {
      priorityFee?: number
      payload?: string
    },
  ) => Promise<string>

  // Events
  on: (event: string, callback: (data: any) => void) => void
  removeListener: (event: string, callback: (data: any) => void) => void
}

// Extend Window interface to include kasware
declare global {
  interface Window {
    kasware?: KaswareAPI
  }
}

/**
 * Check if Kasware wallet is installed and available
 */
export function isKaswareInstalled(): boolean {
  if (typeof window === "undefined") return false

  return typeof window.kasware !== "undefined"
}

/**
 * Detect Kasware wallet and log status
 */
export function detectKasware(): boolean {
  if (typeof window === "undefined") return false

  if (typeof window.kasware !== "undefined") {
    console.log("Kasware wallet is installed!")
    return true
  } else {
    console.log("Kasware wallet is not installed.")
    return false
  }
}

/**
 * Request connection to Kasware wallet
 * This should only be called in response to a user action (e.g., button click)
 */
export async function connectToKasware(): Promise<string[]> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    // Use requestAccounts to prompt the user to connect
    const accounts = await window.kasware.requestAccounts()
    console.log("Connected to Kasware wallet:", accounts)
    return accounts
  } catch (error) {
    console.error("Failed to connect to Kasware wallet:", error)
    throw error
  }
}

/**
 * Get connected accounts without prompting
 */
export async function getConnectedAccounts(): Promise<string[]> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    const accounts = await window.kasware.getAccounts()
    return accounts
  } catch (error) {
    console.error("Failed to get Kasware accounts:", error)
    throw error
  }
}

/**
 * Get wallet version
 */
export async function getWalletVersion(): Promise<string> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    return await window.kasware.getVersion()
  } catch (error) {
    console.error("Failed to get Kasware version:", error)
    throw error
  }
}

/**
 * Get current network
 */
export async function getNetwork(): Promise<string> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    return await window.kasware.getNetwork()
  } catch (error) {
    console.error("Failed to get Kasware network:", error)
    throw error
  }
}

/**
 * Switch network
 */
export async function switchNetwork(network: string): Promise<void> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    await window.kasware.switchNetwork(network)
    console.log(`Switched to network: ${network}`)
  } catch (error) {
    console.error("Failed to switch network:", error)
    throw error
  }
}

/**
 * Disconnect from wallet
 */
export async function disconnect(): Promise<void> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    await window.kasware.disconnect()
    console.log("Disconnected from Kasware wallet")
  } catch (error) {
    console.error("Failed to disconnect from Kasware wallet:", error)
    throw error
  }
}

/**
 * Get wallet balance
 */
export async function getBalance(): Promise<string> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    return await window.kasware.getBalance()
  } catch (error) {
    console.error("Failed to get Kasware balance:", error)
    throw error
  }
}

/**
 * Get KRC20 token balance
 */
export async function getKRC20Balance(tokenAddress: string): Promise<string> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    return await window.kasware.getKRC20Balance(tokenAddress)
  } catch (error) {
    console.error(`Failed to get KRC20 balance for ${tokenAddress}:`, error)
    throw error
  }
}

/**
 * Get all tokens in the wallet
 * This is a convenience method that may not be available in all wallet versions
 */
export async function getTokens(): Promise<Array<{ symbol: string; name: string; balance: string; address?: string }>> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    if (typeof window.kasware.getTokens === "function") {
      return await window.kasware.getTokens()
    }
    throw new Error("getTokens method not available in this wallet version")
  } catch (error) {
    console.error("Failed to get tokens:", error)
    throw error
  }
}

/**
 * Send Kaspa
 * @param toAddress Recipient Kaspa address
 * @param amount Amount in KAS (will be converted to sompi)
 * @param message Optional message (will be used as payload)
 * @param priorityFee Optional priority fee in sompi
 * @returns Promise resolving to transaction ID
 */
export async function sendKaspa(
  toAddress: string,
  amount: string | number,
  message?: string,
  priorityFee?: number,
): Promise<string> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    // Convert KAS to sompi (1 KAS = 100,000,000 sompi)
    const kasAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    const sompiAmount = Math.floor(kasAmount * 100_000_000)

    // Prepare options object if message or priorityFee is provided
    const options: { payload?: string; priorityFee?: number } = {}

    if (message) {
      options.payload = message
    }

    if (priorityFee !== undefined) {
      options.priorityFee = priorityFee
    }

    // Log transaction details for debugging
    console.log("Sending transaction:", {
      toAddress,
      sompiAmount,
      options,
    })

    // Call the Kasware API
    const txid = await window.kasware.sendKaspa(
      toAddress,
      sompiAmount,
      Object.keys(options).length > 0 ? options : undefined,
    )

    console.log("Transaction result:", txid)
    return txid
  } catch (error) {
    console.error("Error sending Kaspa:", error)
    throw error
  }
}

/**
 * Sign a message
 */
export async function signMessage(message: string): Promise<string> {
  if (!isKaswareInstalled()) {
    throw new Error("Kasware wallet is not installed")
  }

  try {
    return await window.kasware.signMessage(message)
  } catch (error) {
    console.error("Failed to sign message:", error)
    throw error
  }
}

/**
 * Set up event listeners for Kasware wallet events
 */
export function setupKaswareEventListeners(
  onAccountsChanged?: (accounts: string[]) => void,
  onNetworkChanged?: (network: string) => void,
  onBalanceChanged?: (balance: string) => void,
): () => void {
  if (!isKaswareInstalled()) {
    console.warn("Kasware wallet is not installed, cannot set up event listeners")
    return () => {}
  }

  const accountsChangedHandler = (accounts: string[]) => {
    console.log("Accounts changed:", accounts)
    if (onAccountsChanged) onAccountsChanged(accounts)
  }

  const networkChangedHandler = (network: string) => {
    console.log("Network changed:", network)
    if (onNetworkChanged) onNetworkChanged(network)
  }

  const balanceChangedHandler = (balance: string) => {
    console.log("Balance changed:", balance)
    if (onBalanceChanged) onBalanceChanged(balance)
  }

  // Set up event listeners
  window.kasware.on("accountsChanged", accountsChangedHandler)
  window.kasware.on("networkChanged", networkChangedHandler)
  window.kasware.on("balanceChanged", balanceChangedHandler)

  // Return a cleanup function
  return () => {
    window.kasware.removeListener("accountsChanged", accountsChangedHandler)
    window.kasware.removeListener("networkChanged", networkChangedHandler)
    window.kasware.removeListener("balanceChanged", balanceChangedHandler)
  }
}

/**
 * Format Kaspa amount from sompi to KAS
 * 1 KAS = 100,000,000 sompi
 */
export function sompiToKas(sompi: string | number): string {
  const sompiValue = typeof sompi === "string" ? BigInt(sompi) : BigInt(Math.floor(Number(sompi)))
  const kasValue = Number(sompiValue) / 100_000_000
  return kasValue.toFixed(8)
}

/**
 * Format KAS to sompi
 */
export function kasToSompi(kas: number | string): string {
  const kasValue = typeof kas === "string" ? Number(kas) : kas
  const sompiValue = Math.floor(kasValue * 100_000_000)
  return sompiValue.toString()
}

