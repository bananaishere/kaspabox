"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, X, Shield, ExternalLink, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  isKaswareInstalled,
  connectToKasware,
  getConnectedAccounts,
  setupKaswareEventListeners,
} from "@/lib/kasware-integration"

// Create a global event for wallet connection status
export const WALLET_EVENTS = {
  CONNECTED: "kasware_connected",
  DISCONNECTED: "kasware_disconnected",
  ACCOUNTS_CHANGED: "kasware_accounts_changed",
}

// Add KSPR Bot integration to the wallet connect component

export function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [walletVersion, setWalletVersion] = useState<string | null>(null)

  // Define callback functions first to avoid initialization errors
  // Handle successful connection
  const handleSuccessfulConnection = useCallback((address: string) => {
    setWalletAddress(address)
    setIsConnected(true)
    setConnectionState("connected")

    // Dispatch global event
    window.dispatchEvent(
      new CustomEvent(WALLET_EVENTS.CONNECTED, {
        detail: { address },
      }),
    )
  }, [])

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    setIsConnected(false)
    setWalletAddress("")
    setConnectionState("idle")

    // Dispatch global event
    window.dispatchEvent(new CustomEvent(WALLET_EVENTS.DISCONNECTED))
  }, [])

  // Check for Kasware extension
  const checkKaswareExtension = useCallback(() => {
    const isInstalled = isKaswareInstalled()
    setIsExtensionInstalled(isInstalled)
    return isInstalled
  }, [])

  // Check for extension on load and when window gets focus
  useEffect(() => {
    // Initial check
    checkKaswareExtension()

    // Check again when window gets focus (user might have installed extension)
    const handleFocus = () => {
      checkKaswareExtension()
    }

    window.addEventListener("focus", handleFocus)

    // Also check periodically (some extensions inject late)
    const intervalCheck = setInterval(() => {
      const detected = checkKaswareExtension()
      if (detected) {
        clearInterval(intervalCheck)
      }
    }, 1000)

    // Clean up
    return () => {
      window.removeEventListener("focus", handleFocus)
      clearInterval(intervalCheck)
    }
  }, [checkKaswareExtension])

  // Check for existing connection on load
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (!isExtensionInstalled) return

      try {
        const accounts = await getConnectedAccounts()
        if (accounts && accounts.length > 0) {
          handleSuccessfulConnection(accounts[0])
        }
      } catch (error) {
        console.error("Error checking existing connection:", error)
      }
    }

    if (isExtensionInstalled) {
      checkExistingConnection()
    }
  }, [isExtensionInstalled, handleSuccessfulConnection])

  // Set up event listeners for wallet events
  useEffect(() => {
    if (!isExtensionInstalled) return

    // Set up Kasware event listeners
    const cleanup = setupKaswareEventListeners(
      // Accounts changed handler
      (accounts) => {
        if (accounts.length === 0) {
          // Disconnected
          handleDisconnect()
        } else {
          // Connected or changed account
          handleSuccessfulConnection(accounts[0])
        }

        // Dispatch custom event for other components
        window.dispatchEvent(
          new CustomEvent(WALLET_EVENTS.ACCOUNTS_CHANGED, {
            detail: { accounts },
          }),
        )
      },
      // Network changed handler
      (network) => {
        console.log("Network changed:", network)
      },
      // Balance changed handler
      (balance) => {
        console.log("Balance changed:", balance)
      },
    )

    // Return cleanup function
    return cleanup
  }, [isExtensionInstalled, handleDisconnect, handleSuccessfulConnection])

  // Connect wallet with error handling
  const connectWallet = async () => {
    setIsDialogOpen(false)
    setErrorMessage("")

    if (!isExtensionInstalled) {
      setErrorMessage("Kasware extension not detected. Please install it first.")
      return
    }

    try {
      setConnectionState("connecting")

      // Use our connectToKasware function
      const accounts = await connectToKasware()

      if (accounts && accounts.length > 0) {
        handleSuccessfulConnection(accounts[0])
      } else {
        throw new Error("No accounts returned from wallet.")
      }
    } catch (error: any) {
      console.error("Connection error:", error)
      setConnectionState("error")
      setErrorMessage(error.message || "Failed to connect to Kasware wallet.")
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      // Try to disconnect using our function
      if (isKaswareInstalled() && window.kasware?.disconnect) {
        await window.kasware.disconnect()
      }
    } catch (error) {
      console.error("Error disconnecting:", error)
    }

    // Always update our state
    handleDisconnect()
  }

  // Format Kaspa address for display
  const formatKaspaAddress = (address: string): string => {
    if (!address) return ""
    if (address.length <= 16) return address

    return `${address.substring(0, 8)}...${address.substring(address.length - 4)}`
  }

  // Update the dialog content to include KSPR Bot option
  return (
    <>
      <Button
        variant={isConnected ? "outline" : "default"}
        className={`text-base py-2 px-3 md:py-2.5 md:px-4 ${
          isConnected
            ? "bg-white text-teal-600 hover:bg-teal-50 border-teal-200"
            : "bg-teal-600 text-white hover:bg-teal-700"
        }`}
        onClick={() => {
          if (isConnected) {
            disconnectWallet()
          } else {
            if (isExtensionInstalled) {
              connectWallet()
            } else {
              setIsDialogOpen(true)
            }
          }
        }}
      >
        {connectionState === "connecting" ? (
          <div className="flex items-center justify-center gap-1 md:gap-2">
            <Shield className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
            <span className="hidden md:inline">Connecting...</span>
            <span className="md:hidden">Connect</span>
          </div>
        ) : isConnected ? (
          <div className="flex items-center justify-center gap-1 md:gap-2">
            <span className="max-w-[60px] md:max-w-[100px] truncate">{formatKaspaAddress(walletAddress)}</span>
            <X className="h-3 w-3 md:h-4 md:w-4" />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 md:gap-2">
            <Wallet className="h-4 w-4 md:h-5 md:w-5" />
            <span className="hidden md:inline">Connect Wallet</span>
            <span className="md:hidden">Connect</span>
          </div>
        )}
      </Button>

      {/* Dialog for when extension is not installed */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              {isExtensionInstalled
                ? "Connect your Kasware wallet to send Kaspa tokens"
                : "Choose a wallet to connect with"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {isExtensionInstalled ? (
              <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={connectWallet}>
                Connect Kasware
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                  <p className="text-sm text-amber-700">Wallet extension is required to use this application.</p>
                </div>

                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => window.open("https://www.kasware.xyz/", "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Install Kasware Extension
                </Button>

                <p className="text-xs text-center text-gray-500 mt-2">After installing, please refresh this page.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Error message dialog */}
      {errorMessage && (
        <Dialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage("")}>
          <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Connection Error
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">{errorMessage}</p>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setErrorMessage("")}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

