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
 * Formats a Kaspa address for display by truncating the middle
 */
export function formatKaspaAddress(address: string, startChars = 12, endChars = 4): string {
  if (!address) return ""
  if (address.length <= startChars + endChars) return address

  const start = address.substring(0, startChars)
  const end = address.substring(address.length - endChars)
  return `${start}...${end}`
}

