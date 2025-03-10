"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  RefreshCw,
  Info,
  Shield,
  ArrowLeftRight,
  Share2,
  ExternalLink,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { NFT } from "@/components/nft-browser"
import { verifyTransactionToAddress } from "@/lib/kaspa-api"

// Middleman wallet address - In a real implementation, this would be a secure server-controlled wallet
const MIDDLEMAN_WALLET = "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj"

// NFT contract address - In a real implementation, this would be the address of the NFT contract
const NFT_CONTRACT_ADDRESS = "kaspa:qz0k2kj6rl8nt9xzm7tuf2l0ujd6axm6rsjzfrnldnrjhs8ywjpxcvqvl9t5j"

// Add fee constants
const FEE_ADDRESS = "kaspa:qznc7k7jv06txsjvsjpy2k9jltutkfyjyt57vs2qe43ln0era3m4urhdkkpag"
const FEE_PERCENTAGE = 0.001 // 0.1%

// Define exchange types
type ExchangeType = "nft-kas" | "nft-nft"

// Interface for deal data with extended support for NFT-to-NFT exchanges
interface Deal {
  id: string
  exchangeType: ExchangeType
  // NFT 1 (always required)
  nft1Id: string
  nft1Name?: string
  nft1Description?: string
  nft1Image?: string
  nft1Contract: string
  nft1OwnerAddress: string
  // NFT 2 (for NFT-to-NFT exchanges)
  nft2Id?: string
  nft2Name?: string
  nft2Description?: string
  nft2Image?: string
  nft2Contract?: string
  nft2OwnerAddress?: string
  // KAS amount (for NFT-to-KAS exchanges)
  kaspaAmount?: string
  // Common properties
  party1Address: string
  party2Address: string
  party1Deposited: boolean
  party2Deposited: boolean
  exchangeCompleted: boolean
  party1TxId?: string
  party2TxId?: string
  completionTxIds?: {
    party1Transfer?: string
    party2Transfer?: string
    feeTx?: string
  }
  createdAt: string
  updatedAt?: string
  status: "pending" | "awaiting_deposits" | "processing" | "completed" | "failed"
  // Transaction tracking
  party1DepositTxHash?: string
  party2DepositTxHash?: string
  party1ReceiveTxHash?: string
  party2ReceiveTxHash?: string
}

// Function to persist deals to localStorage
const saveDealToStorage = (deal: Deal) => {
  try {
    // Get existing deals from localStorage
    const storedDeals = localStorage.getItem("kaspabox_deals")
    const deals = storedDeals ? JSON.parse(storedDeals) : {}

    // Add or update the deal
    deals[deal.id] = deal

    // Save back to localStorage
    localStorage.setItem("kaspabox_deals", JSON.stringify(deals))

    // Verify the save was successful
    const verifyDeals = localStorage.getItem("kaspabox_deals")
    const parsedDeals = verifyDeals ? JSON.parse(verifyDeals) : {}

    if (!parsedDeals[deal.id]) {
      console.error("Deal was not saved correctly")
      return false
    }

    console.log("Deal saved successfully:", deal.id)
    return true
  } catch (error) {
    console.error("Error saving deal to localStorage:", error)
    return false
  }
}

// Function to load deals from localStorage
const loadDealsFromStorage = (): Record<string, Deal> => {
  try {
    const storedDeals = localStorage.getItem("kaspabox_deals")
    if (storedDeals) {
      return JSON.parse(storedDeals)
    }
    return {}
  } catch (error) {
    console.error("Error loading deals from localStorage:", error)
    return {}
  }
}

// Function to get a deal by ID
const getDealById = (dealId: string): Deal | null => {
  const deals = loadDealsFromStorage()
  return deals[dealId] || null
}

// Add a function to manually verify transactions on the explorer
const verifyOnExplorer = (address: string) => {
  window.open(`https://explorer.kaspa.org/addresses/${address}`, "_blank")
}

// Function to get NFT image URL from Kaspa NFT marketplace
const getNFTImageUrl = (nftId: string, collectionName?: string) => {
  // If using a placeholder image
  if (!collectionName || nftId.includes("placeholder")) {
    return "/placeholder.svg?height=300&width=300"
  }

  // In a real implementation, this would fetch from the actual API
  // For now, we'll construct a URL based on the pattern
  return `https://www.kaspa.com/nft/marketplace/assets/${collectionName}/${nftId}.png`
}

// Function to verify a transaction on the blockchain
const verifyBlockchainTransaction = async (address: string, amount: string, isNFT = false): Promise<string | null> => {
  try {
    console.log(`Verifying ${isNFT ? "NFT" : "KAS"} transaction to ${address}${!isNFT ? ` for ${amount} KAS` : ""}`)

    // In a real implementation, this would call the Kaspa API to verify the transaction
    // For now, we'll simulate a blockchain verification with a delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Call the verifyTransactionToAddress function from kaspa-api.ts
    const txId = await verifyTransactionToAddress(address, isNFT ? "1" : amount)

    if (txId) {
      console.log(`Transaction verified: ${txId}`)
      return txId
    }

    return null
  } catch (error) {
    console.error("Error verifying transaction:", error)
    return null
  }
}

// Also fix the completeExchange function to prevent state update issues
// Replace the completeExchange function with this improved version:

// Function to complete the exchange
const completeExchange = async (dealId: string) => {
  const deal = getDealById(dealId)
  if (!deal || deal.status !== "processing") return

  try {
    console.log(`Completing exchange for deal ${dealId}`)

    // Simulate sending assets back to the respective parties
    const completionTxIds = {
      party1Transfer: `tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`,
      party2Transfer: `tx_${(Date.now() + 1).toString(36)}_${Math.random().toString(36).substring(2, 9)}`,
      feeTx: `tx_${(Date.now() + 2).toString(36)}_${Math.random().toString(36).substring(2, 9)}`,
    }

    // Update the deal
    deal.status = "completed"
    deal.exchangeCompleted = true
    deal.completionTxIds = completionTxIds
    deal.updatedAt = new Date().toISOString()

    // Save the updated deal
    saveDealToStorage(deal)

    // If we have the current deal loaded, update it
    // Use a functional update to avoid dependency issues
    if (currentDeal && currentDeal.id === dealId) {
      setCurrentDeal((prevDeal) => {
        if (prevDeal && prevDeal.id === dealId) {
          return { ...deal }
        }
        return prevDeal
      })
    }

    console.log(`Exchange completed for deal ${dealId}`)
  } catch (error) {
    console.error(`Error completing exchange for deal ${dealId}:`, error)

    // Update the deal to failed status
    if (deal) {
      deal.status = "failed"
      deal.updatedAt = new Date().toISOString()
      saveDealToStorage(deal)

      if (currentDeal && currentDeal.id === dealId) {
        setCurrentDeal((prevDeal) => {
          if (prevDeal && prevDeal.id === dealId) {
            return { ...deal }
          }
          return prevDeal
        })
      }
    }
  }
}

// Function to view a transaction on the Kaspa explorer
const viewTransactionOnExplorer = (txHash: string) => {
  if (!txHash) return
  window.open(`https://explorer.kaspa.org/txs/${txHash}`, "_blank")
}

export function NFTMiddleman() {
  // Mode: null (initial), "create" (create new deal), "view" (view deal status)
  const [mode, setMode] = useState<"create" | "view" | null>(null)

  // Exchange type selection
  const [exchangeType, setExchangeType] = useState<ExchangeType>("nft-kas")

  // NFT Browser state
  const [showNFTBrowser, setShowNFTBrowser] = useState(false)
  const [nftBrowserTarget, setNftBrowserTarget] = useState<"nft1" | "nft2">("nft1")

  // Deal information
  const [dealId, setDealId] = useState("")
  const [showShareDialog, setShowShareDialog] = useState(false)

  // NFT 1 (offering NFT)
  const [nft1, setNft1] = useState<NFT | null>(null)

  // NFT 2 (requested NFT - for NFT-to-NFT exchanges)
  const [nft2, setNft2] = useState<NFT | null>(null)

  // KAS amount (for NFT-to-KAS exchanges)
  const [kaspaAmount, setKaspaAmount] = useState("")

  // Current deal
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null)

  // UI state
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Step tracking for improved UI flow
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)

  // First, add a new state to track the deal creation step
  // Add this near the other state declarations (around line 130)
  const [dealCreationStep, setDealCreationStep] = useState<1 | 2>(1)

  // Handle NFT selection from browser
  const handleNFTSelect = (selectedNFT: NFT) => {
    if (nftBrowserTarget === "nft1") {
      setNft1(selectedNFT)
    } else {
      setNft2(selectedNFT)
    }
    setShowNFTBrowser(false)
  }

  // Load deals from localStorage on component mount
  useEffect(() => {
    // Check if there's a deal ID in the URL
    const urlParams = new URLSearchParams(window.location.search)
    const urlDealId = urlParams.get("dealId")

    if (urlDealId) {
      setDealId(urlDealId)

      // Try to load the deal
      const deal = getDealById(urlDealId)
      if (deal) {
        setCurrentDeal(deal)
        setMode("view")
      }
    }
  }, [])

  // Handle creating a new deal
  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsProcessing(true)

    try {
      // Only validate the KAS amount
      if (exchangeType === "nft-kas") {
        if (!kaspaAmount || isNaN(Number(kaspaAmount)) || Number(kaspaAmount) <= 0) {
          throw new Error("Please enter a valid KAS amount")
        }
      } else {
        // For NFT-NFT exchanges, we still need some validation
        if (!kaspaAmount || isNaN(Number(kaspaAmount)) || Number(kaspaAmount) <= 0) {
          throw new Error("Please enter a valid KAS amount for your offer")
        }
      }

      // Generate a unique deal ID
      const newDealId = `deal_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`

      // Create mock NFT data if none is provided
      const mockNft1 = {
        id: `nft_${Date.now().toString(36)}`,
        name: "Your NFT",
        description: "NFT for exchange",
        image: "/placeholder.svg?height=300&width=300",
        contractAddress: NFT_CONTRACT_ADDRESS,
        ownerAddress: "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj",
      }

      const mockNft2 = {
        id: `nft_${(Date.now() + 1).toString(36)}`,
        name: "Requested NFT",
        description: "NFT requested for exchange",
        image: "/placeholder.svg?height=300&width=300",
        contractAddress: NFT_CONTRACT_ADDRESS,
        ownerAddress: "",
      }

      // Create the deal
      const newDeal: Deal = {
        id: newDealId,
        exchangeType,

        // NFT 1 info (use mock data if no NFT is selected)
        nft1Id: nft1?.id || mockNft1.id,
        nft1Name: nft1?.name || mockNft1.name,
        nft1Description: nft1?.description || mockNft1.description,
        nft1Image: nft1?.image || mockNft1.image,
        nft1Contract: nft1?.contractAddress || mockNft1.contractAddress,
        nft1OwnerAddress: nft1?.ownerAddress || mockNft1.ownerAddress,

        // Conditional fields based on exchange type
        ...(exchangeType === "nft-kas"
          ? {
              kaspaAmount,
              party2Address: "",
            }
          : {
              nft2Id: nft2?.id || mockNft2.id,
              nft2Name: nft2?.name || mockNft2.name,
              nft2Description: nft2?.description || mockNft2.description,
              nft2Image: nft2?.image || mockNft2.image,
              nft2Contract: nft2?.contractAddress || mockNft2.contractAddress,
              nft2OwnerAddress: nft2?.ownerAddress || mockNft2.ownerAddress,
            }),

        // Common fields
        party1Address: "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj",
        party1Deposited: false,
        party2Deposited: false,
        exchangeCompleted: false,
        createdAt: new Date().toISOString(),
        status: "awaiting_deposits",
      }

      // Save the deal
      const saved = saveDealToStorage(newDeal)
      if (!saved) {
        throw new Error("Failed to save deal. Please try again.")
      }

      // Set current deal and update state
      setCurrentDeal(newDeal)
      setDealId(newDealId)

      // Update URL with deal ID for sharing
      const url = new URL(window.location.href)
      url.searchParams.set("dealId", newDealId)
      window.history.pushState({}, "", url.toString())

      // Show the deal status on the same page
      setMode("create")

      // Show share dialog
      setShowShareDialog(true)
    } catch (error: any) {
      console.error("Error creating deal:", error)
      setErrorMessage(error.message || "Failed to create deal")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle looking up a deal
  const handleLookupDeal = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!dealId) {
      setErrorMessage("Please enter a Deal ID")
      return
    }

    // Load the deal
    const deal = getDealById(dealId)
    if (!deal) {
      setErrorMessage("Deal not found. Please check the Deal ID and try again.")
      return
    }

    // Set current deal and update state
    setCurrentDeal(deal)
    setMode("view")

    // Update URL with deal ID
    const url = new URL(window.location.href)
    url.searchParams.set("dealId", dealId)
    window.history.pushState({}, "", url.toString())
  }

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)

    setTimeout(() => setCopiedText(null), 2000)
  }

  // Refresh deal status with blockchain verification
  // Replace the refreshDealStatus function with this improved version:
  const refreshDealStatus = async () => {
    if (!dealId && !currentDeal?.id) return

    setIsRefreshing(true)

    try {
      const id = currentDeal?.id || dealId
      const deal = getDealById(id)

      if (deal) {
        let updated = false

        // Check for new deposits if the deal is awaiting deposits
        if (deal.status === "awaiting_deposits" && (!deal.party1Deposited || !deal.party2Deposited)) {
          // Check for party1 deposit if not already deposited
          if (!deal.party1Deposited) {
            const txId = await verifyBlockchainTransaction(
              MIDDLEMAN_WALLET,
              deal.exchangeType === "nft-kas" ? "1" : "1", // NFT amount is always 1
              true, // This is an NFT transaction
            )

            if (txId) {
              deal.party1Deposited = true
              deal.party1DepositTxHash = txId
              updated = true
            }
          }

          // Check for party2 deposit if not already deposited
          if (!deal.party2Deposited) {
            const txId = await verifyBlockchainTransaction(
              MIDDLEMAN_WALLET,
              deal.exchangeType === "nft-kas" ? deal.kaspaAmount || "0" : "1",
              deal.exchangeType === "nft-nft", // If nft-nft, this is an NFT transaction
            )

            if (txId) {
              deal.party2Deposited = true
              deal.party2DepositTxHash = txId
              updated = true
            }
          }

          // If both parties have deposited, update the status to processing
          if (deal.party1Deposited && deal.party2Deposited && deal.status === "awaiting_deposits") {
            deal.status = "processing"
            deal.updatedAt = new Date().toISOString()
            updated = true

            // Simulate the exchange process
            setTimeout(() => {
              completeExchange(deal.id)
            }, 5000)
          }

          if (updated) {
            saveDealToStorage(deal)
            // Only update the state if there were actual changes
            setCurrentDeal((prevDeal) => {
              // Make sure we're not causing unnecessary re-renders
              if (JSON.stringify(prevDeal) !== JSON.stringify(deal)) {
                return { ...deal }
              }
              return prevDeal
            })
          }
        } else {
          // For other statuses, just check if the deal has changed
          if (JSON.stringify(currentDeal) !== JSON.stringify(deal)) {
            setCurrentDeal({ ...deal })
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing deal status:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Generate shareable link
  const getShareableLink = () => {
    if (!currentDeal) return ""

    const url = new URL(window.location.href)
    url.searchParams.set("dealId", currentDeal.id)
    return url.toString()
  }

  // Reset the form when exchange type changes
  useEffect(() => {
    if (exchangeType === "nft-kas") {
      setNft2(null)
    }
  }, [exchangeType])

  // Create a ref to track the previous deal ID
  const previousDealId = useRef<string | null>(null)

  // Poll for updates to the deal status
  // Replace the useEffect for polling with this improved version:
  useEffect(() => {
    // Only start polling if we are in "view" mode and have a currentDeal
    if (mode === "view" && currentDeal) {
      // Get the current deal ID
      const currentDealId = currentDeal.id

      // Check if the deal ID has changed
      if (currentDealId !== previousDealId.current) {
        // Update the ref with the new deal ID
        previousDealId.current = currentDealId

        // Initial refresh when the deal ID changes
        refreshDealStatus()
      }

      // Set up polling interval
      const intervalId = setInterval(() => {
        refreshDealStatus()
      }, 10000) // Poll every 10 seconds

      // Clean up interval on unmount and when the deal ID changes
      return () => clearInterval(intervalId)
    }
  }, [mode, currentDeal])

  return (
    <div className="space-y-6">
      {/* Initial Selection Screen */}
      {mode === null && (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-100 rounded-md p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-teal-600" />
              <h3 className="font-medium text-teal-800">NFT Middleman Service</h3>
            </div>
            <p className="text-sm text-teal-700 mb-2">
              Secure NFT trading with escrow protection. Trade NFTs for Kaspa or exchange NFTs with other NFTs without
              having to trust the other party.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => setMode("create")}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8"
                size="sm"
              >
                Create New Deal
              </Button>
            </div>
          </div>

          {/* Look Up Existing Deal */}
          <div className="border border-teal-200 rounded-md p-3 bg-teal-50">
            <form onSubmit={handleLookupDeal} className="space-y-2">
              <Label htmlFor="lookupDealId" className="text-xs text-teal-700 font-medium">
                Look Up Existing Deal
              </Label>
              <div className="flex gap-2">
                <Input
                  id="lookupDealId"
                  value={dealId}
                  onChange={(e) => setDealId(e.target.value)}
                  placeholder="Enter Deal ID"
                  className="text-xs h-8 border-teal-200 focus-visible:ring-teal-500"
                  required
                />
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white h-8 text-xs" size="sm">
                  Look Up
                </Button>
              </div>
            </form>
          </div>

          {/* Instructions box moved to the bottom */}
          <div className="bg-teal-50 border border-teal-100 rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-teal-600" />
              <h3 className="font-medium text-teal-800">How the NFT Middleman works:</h3>
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-teal-700">
              <li>Select your exchange type: NFT-for-KAS or NFT-for-NFT</li>
              <li>Select the NFT(s) and/or enter the KAS amount for the exchange</li>
              <li>
                <strong>Create and share the deal ID with the other party</strong>
              </li>
              <li>Both parties send their assets to the middleman wallet</li>
              <li>Once both deposits are confirmed, the exchange completes automatically</li>
              <li>Each party receives their requested asset(s)</li>
            </ol>
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-700 font-medium">Important:</p>
              <p className="text-sm text-amber-700">
                After creating a deal, you <strong>must share the deal ID</strong> with the other party. They will need
                to use this ID to view and complete the transaction.
              </p>
            </div>
            <p className="mt-3 text-sm text-teal-600">
              A 0.1% service fee is collected to support ꓘaspaBOX development.
            </p>
          </div>
        </div>
      )}

      {/* Create Deal Flow */}
      {mode === "create" && (
        <div className="space-y-6">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-teal-800">Create NFT Exchange Deal</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMode(null)
                setCurrentDeal(null)
                setDealId("")
                setNft1(null)
                setNft2(null)
                setKaspaAmount("")
                setCurrentStep(1)
                setDealCreationStep(1) // Add this line
              }}
              className="text-teal-600"
            >
              Back
            </Button>
          </div>

          {/* Step Indicator */}
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-teal-600 px-1">
            <span className={currentStep >= 1 ? "font-medium" : ""}>Choose Type</span>
            <span className={currentStep >= 2 ? "font-medium" : ""}>Set Details</span>
            <span className={currentStep >= 3 ? "font-medium" : ""}>Complete</span>
          </div>

          {/* Step 1: Choose Exchange Type */}
          {currentStep === 1 && !currentDeal && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-medium text-teal-800 mb-2">Choose Exchange Type</h3>
                <p className="text-sm text-teal-600">Select how you want to exchange your NFT</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    exchangeType === "nft-kas"
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-teal-300 hover:bg-teal-50/50"
                  }`}
                  onClick={() => {
                    setExchangeType("nft-kas")
                    setCurrentStep(2)
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                      <ArrowLeftRight className="h-6 w-6 text-teal-600" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">NFT for KAS</h4>
                    <p className="text-sm text-gray-600">NFT for Kaspa</p>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-6 cursor-pointer transition-all ${
                    exchangeType === "nft-nft"
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-teal-300 hover:bg-teal-50/50"
                  }`}
                  onClick={() => {
                    setExchangeType("nft-nft")
                    setCurrentStep(2)
                  }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                      <ArrowLeftRight className="h-6 w-6 text-teal-600" />
                    </div>
                    <h4 className="text-lg font-medium mb-2">NFT for NFT</h4>
                    <p className="text-sm text-gray-600">Exchange your NFT for another NFT</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enter Details */}
          {currentStep === 2 && !currentDeal && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-medium text-teal-800 mb-2">
                  {exchangeType === "nft-kas" ? "Set NFT Sale Price" : "Set NFT Exchange Details"}
                </h3>
                <p className="text-sm text-teal-600">
                  {exchangeType === "nft-kas"
                    ? "Enter the amount of KAS you want for your NFT"
                    : "Enter the amount of KAS for your NFT exchange"}
                </p>
              </div>

              <form onSubmit={handleCreateDeal} className="space-y-6">
                <div className="space-y-4 border border-teal-100 rounded-md p-6 bg-teal-50">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <ArrowLeftRight className="h-4 w-4 text-teal-600" />
                    </div>
                    <h4 className="font-medium text-teal-700">
                      {exchangeType === "nft-kas" ? "NFT for KAS Exchange" : "NFT for NFT Exchange"}
                    </h4>
                  </div>

                  {/* KAS Amount Input */}
                  <div className="space-y-2">
                    <Label className="text-teal-700 font-medium">
                      {exchangeType === "nft-kas" ? "NFT Sale Price (KAS)" : "Your Offer Amount (KAS)"}
                    </Label>
                    <Input
                      id="kaspaAmount"
                      type="number"
                      step="0.00000001"
                      value={kaspaAmount}
                      onChange={(e) => setKaspaAmount(e.target.value)}
                      placeholder="0.00"
                      className="border-teal-200 focus-visible:ring-teal-500"
                      required
                    />
                    <p className="text-xs text-teal-600 mt-1">
                      Enter the amount of KAS you want {exchangeType === "nft-kas" ? "for your NFT" : "to offer"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="text-teal-600">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={isProcessing || !kaspaAmount || isNaN(Number(kaspaAmount)) || Number(kaspaAmount) <= 0}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Deal...
                      </>
                    ) : (
                      "Create Deal"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Deal Created - Show Deal ID */}
          {currentDeal && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-medium text-teal-800 mb-2">Deal Created Successfully!</h3>
                <p className="text-sm text-teal-600">
                  {dealCreationStep === 1
                    ? "Share this deal ID with the other party to complete the exchange"
                    : "Send your NFT to the middleman wallet to proceed with the exchange"}
                </p>
              </div>

              {dealCreationStep === 1 ? (
                /* Step 1: Share Deal ID */
                <div className="bg-white border border-teal-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    <h4 className="font-medium text-teal-700">Step 1: Share Deal ID</h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-teal-700">Your Deal ID</Label>
                      <div
                        className="flex items-center justify-between gap-2 mt-2 bg-white p-3 rounded-md border border-teal-100 cursor-pointer hover:bg-teal-50 transition-colors"
                        onClick={() => copyToClipboard(currentDeal.id, "newDealId")}
                      >
                        <code className="text-sm break-all text-teal-700">{currentDeal.id}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            copyToClipboard(currentDeal.id, "newDealId")
                          }}
                          className="shrink-0 text-teal-600 hover:text-teal-700"
                        >
                          {copiedText === "newDealId" ? (
                            <CheckCircle2 className="h-4 w-4 text-teal-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-50 border border-teal-100 rounded-md">
                      <p className="text-sm text-teal-700 font-medium flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        Share this Deal ID with the other party
                      </p>
                      <p className="text-xs text-teal-600 mt-1">
                        The other party must use this Deal ID to view and complete the transaction.
                      </p>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const shareLink = getShareableLink()
                          copyToClipboard(shareLink, "shareLink")
                        }}
                        className="text-xs flex items-center gap-1 text-teal-600 border-teal-200"
                      >
                        {copiedText === "shareLink" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        Copy Link
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setDealCreationStep(2)}
                        className="text-xs bg-teal-600 hover:bg-teal-700"
                      >
                        Next Step
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Send NFT to Middleman */
                <div className="bg-white border border-teal-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-teal-600" />
                    <h4 className="font-medium text-teal-700">Step 2: Send Your NFT</h4>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-teal-600">
                      Send your NFT to this middleman wallet address to complete the first part of the exchange:
                    </p>

                    <div className="flex items-center justify-between bg-white p-3 rounded-md border border-teal-200">
                      <code className="text-sm break-all text-teal-700">{MIDDLEMAN_WALLET}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(MIDDLEMAN_WALLET, "middlemanStep3")}
                        className="ml-2 shrink-0 text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                      >
                        {copiedText === "middlemanStep3" ? (
                          <CheckCircle2 className="h-4 w-4 text-teal-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-700 font-medium">Important:</p>
                      <p className="text-xs text-amber-700 mt-1">
                        After sending your NFT to the middleman wallet, the other party will need to complete their part
                        of the exchange.
                      </p>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDealCreationStep(1)}
                        className="text-xs flex items-center gap-1 text-teal-600 border-teal-200"
                      >
                        Back
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setMode("view")}
                        className="text-xs bg-teal-600 hover:bg-teal-700"
                      >
                        View Deal Status
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* View Deal Status */}
      {mode === "view" && currentDeal && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-teal-800">Deal Status</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMode(null)
                setCurrentDeal(null)
                setDealId("")
                setNft1(null)
                setNft2(null)
                setKaspaAmount("")
                setCurrentStep(1)
                const url = new URL(window.location.href)
                url.searchParams.delete("dealId")
                window.history.pushState({}, "", url.toString())
              }}
              className="text-teal-600"
            >
              Back
            </Button>
          </div>

          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            {/* Deal Header */}
            <div className="bg-teal-50 border-b border-teal-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-teal-800">Deal #{currentDeal.id.substring(0, 8)}...</h4>
                  <p className="text-xs text-teal-600">Created {new Date(currentDeal.createdAt).toLocaleString()}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshDealStatus}
                  disabled={isRefreshing}
                  className="text-teal-600"
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Status
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Deal Content */}
            <div className="p-4 space-y-6">
              {/* Deal Confirmation */}
              <div className="bg-teal-50 border border-teal-100 rounded-md p-4 mb-4">
                <h5 className="font-medium text-teal-800 mb-2">Confirm Deal Details</h5>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-teal-700">Deal Type:</span>
                    <span className="text-sm font-medium text-teal-800">
                      {currentDeal.exchangeType === "nft-kas" ? "NFT for KAS" : "NFT for NFT"}
                    </span>
                  </div>
                  {currentDeal.exchangeType === "nft-kas" ? (
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-700">Amount:</span>
                      <span className="text-sm font-medium text-teal-800">{currentDeal.kaspaAmount} KAS</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-sm text-teal-700">NFT Exchange:</span>
                      <span className="text-sm font-medium text-teal-800">
                        {currentDeal.nft1Name} ↔ {currentDeal.nft2Name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-teal-700">Created:</span>
                    <span className="text-sm font-medium text-teal-800">
                      {new Date(currentDeal.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-700 font-medium">Next Step:</p>
                      <p className="text-xs text-amber-700">
                        You need to send your part of the exchange to the middleman wallet address.
                        {currentDeal.exchangeType === "nft-kas"
                          ? " If you're the NFT owner, send your NFT. If you're the buyer, send the KAS amount."
                          : " Each party needs to send their NFT to the middleman wallet."}
                      </p>
                      <p className="text-xs text-amber-700 mt-2">
                        The middleman wallet acts as a secure escrow service. Once both parties have sent their assets,
                        the exchange will complete automatically.
                      </p>
                      <div className="mt-3 flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs flex items-center gap-1 text-teal-600 border-teal-200"
                          onClick={() => {
                            document.getElementById("middleman-wallet-section")?.scrollIntoView({ behavior: "smooth" })
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Get Middleman Wallet Address
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deal ID */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-sm font-medium text-teal-700">Deal ID</Label>
                  <div className="relative group">
                    <Info className="h-3.5 w-3.5 text-teal-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-teal-800 text-white text-xs p-2 rounded w-48 z-10">
                      Share this Deal ID with the other party
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded-md border border-teal-200">
                  <code className="text-xs break-all text-teal-700">{currentDeal.id}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(currentDeal.id, "dealId")}
                    className="ml-2 shrink-0 text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                  >
                    {copiedText === "dealId" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Deal Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-teal-700">Status</Label>
                <div className="bg-white p-3 rounded-md border border-teal-200">
                  <div className="flex items-center gap-2">
                    {currentDeal.status === "awaiting_deposits" && (
                      <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
                    )}
                    {currentDeal.status === "processing" && (
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                    )}
                    {currentDeal.status === "completed" && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
                    {currentDeal.status === "failed" && <div className="w-3 h-3 rounded-full bg-red-500"></div>}
                    <span className="text-sm capitalize">{currentDeal.status.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-4 py-2">
                <Label className="text-sm font-medium text-teal-700">Progress</Label>
                <div className="space-y-4">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-4 top-0 w-0.5 h-full bg-gray-200"></div>

                    {/* Step 1: Deal Created */}
                    <div className="relative flex items-start gap-3 pb-6">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="pt-1">
                        <h5 className="font-medium text-green-700">Deal Created</h5>
                        <p className="text-xs text-green-600">{new Date(currentDeal.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Step 2: Awaiting Deposits */}
                    <div className="relative flex items-start gap-3 pb-6">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          currentDeal.party1Deposited && currentDeal.party2Deposited ? "bg-green-100" : "bg-amber-100"
                        }`}
                      >
                        {currentDeal.party1Deposited && currentDeal.party2Deposited ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="h-5 w-5 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      <div className="pt-1">
                        <h5
                          className={`font-medium ${
                            currentDeal.party1Deposited && currentDeal.party2Deposited
                              ? "text-green-700"
                              : "text-amber-700"
                          }`}
                        >
                          Awaiting Deposits
                        </h5>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="space-y-1">
                            <div className="text-xs font-medium">Your Deposit</div>
                            <div className="flex items-center gap-1 text-xs">
                              {currentDeal.party1Deposited ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Deposited
                                  {currentDeal.party1DepositTxHash && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-4 p-0 text-xs text-green-600"
                                      onClick={() => viewTransactionOnExplorer(currentDeal.party1DepositTxHash || "")}
                                    >
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <AlertCircle className="h-3 w-3" />
                                  Awaiting
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs font-medium">Trading Partner</div>
                            <div className="flex items-center gap-1 text-xs">
                              {currentDeal.party2Deposited ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Deposited
                                  {currentDeal.party2DepositTxHash && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-4 p-0 text-xs text-green-600"
                                      onClick={() => viewTransactionOnExplorer(currentDeal.party2DepositTxHash || "")}
                                    >
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  )}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <AlertCircle className="h-3 w-3" />
                                  Awaiting
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Processing Exchange */}
                    <div className="relative flex items-start gap-3 pb-6">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          currentDeal.status === "processing"
                            ? "bg-blue-100"
                            : currentDeal.status === "completed"
                              ? "bg-green-100"
                              : "bg-gray-100"
                        }`}
                      >
                        {currentDeal.status === "processing" ? (
                          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                        ) : currentDeal.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="h-5 w-5 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                        )}
                      </div>
                      <div className="pt-1">
                        <h5
                          className={`font-medium ${
                            currentDeal.status === "processing"
                              ? "text-blue-700"
                              : currentDeal.status === "completed"
                                ? "text-green-700"
                                : "text-gray-500"
                          }`}
                        >
                          Processing Exchange
                        </h5>
                        <p className="text-xs text-gray-500">
                          {currentDeal.status === "processing"
                            ? "Exchange is being processed..."
                            : currentDeal.status === "completed"
                              ? "Exchange processed successfully"
                              : "Waiting for deposits to complete"}
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Exchange Complete */}
                    <div className="relative flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          currentDeal.status === "completed" ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        {currentDeal.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="h-5 w-5 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                        )}
                      </div>
                      <div className="pt-1">
                        <h5
                          className={`font-medium ${
                            currentDeal.status === "completed" ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          Exchange Complete
                        </h5>
                        <p className="text-xs text-gray-500">
                          {currentDeal.status === "completed"
                            ? "Exchange has been completed successfully"
                            : "Waiting for processing to complete"}
                        </p>

                        {currentDeal.status === "completed" && currentDeal.completionTxIds && (
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex items-center gap-1 text-green-600">
                              <span>Party 1 Transfer:</span>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-4 p-0 text-xs text-green-600"
                                onClick={() =>
                                  viewTransactionOnExplorer(currentDeal.completionTxIds?.party1Transfer || "")
                                }
                              >
                                View <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1 text-green-600">
                              <span>Party 2 Transfer:</span>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-4 p-0 text-xs text-green-600"
                                onClick={() =>
                                  viewTransactionOnExplorer(currentDeal.completionTxIds?.party2Transfer || "")
                                }
                              >
                                View <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1 text-green-600">
                              <span>Fee Transaction:</span>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-4 p-0 text-xs text-green-600"
                                onClick={() => viewTransactionOnExplorer(currentDeal.completionTxIds?.feeTx || "")}
                              >
                                View <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middleman Wallet Address */}
              <div id="middleman-wallet-section" className="space-y-2 pt-2">
                <div className="flex items-center gap-1">
                  <Label className="text-sm font-medium text-teal-700">Middleman Wallet Address</Label>
                  <div className="relative group">
                    <Info className="h-3.5 w-3.5 text-teal-400 cursor-help" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-teal-800 text-white text-xs p-2 rounded w-48 z-10">
                      Both parties need to send their assets to this address
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded-md border border-teal-200">
                  <code className="text-xs break-all text-teal-700">{MIDDLEMAN_WALLET}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(MIDDLEMAN_WALLET, "middleman")}
                    className="ml-2 shrink-0 text-teal-600 hover:text-teal-800 hover:bg-teal-50"
                  >
                    {copiedText === "middleman" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add a button to manually verify on explorer */}
      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => verifyOnExplorer(MIDDLEMAN_WALLET)}
          className="text-xs flex items-center gap-1 text-teal-600 border-teal-200"
        >
          <ExternalLink className="h-3 w-3" />
          Verify on Explorer
        </Button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

