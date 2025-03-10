export function detectKaswareWallet(): boolean {
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
 * Add a script to detect Kasware wallet on page load
 * This can be included in the app layout
 */
export function addKaswareDetectionScript(): string {
  return `
    if (typeof window !== 'undefined') {
      if (typeof window.kasware !== 'undefined') {
        console.log('Kasware wallet is installed!');
      } else {
        console.log('Kasware wallet is not installed.');
      }
    }
  `
}

