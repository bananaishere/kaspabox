"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Copy,
  RefreshCw,
  InfoIcon,
  ChevronDown,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { isValidKaspaAddress, normalizeKaspaAddress } from "@/lib/address-utils"
import { SUPPORTED_CURRENCIES } from "@/lib/exchange-api"
import { getEstimate, createExchange, checkTransactionStatus } from "@/app/actions/exchange-actions"
import Image from "next/image"

// Types
type SwapStatus = "idle" | "estimating" | "creating" | "awaiting_deposit" | "exchanging" | "success" | "error"

interface EstimateData {
  estimatedAmount: string
  rate: string
  fee: string
  minAmount?: string
  maxAmount?: string
}

interface TransactionData {
  id: string
  payinAddress: string
  payoutAddress: string
  fromAmount: string
  toAmount?: string
  status: string
  validUntil: string
  createdAt?: string
}

// Fee configuration
const FEE_ADDRESS = "kaspa:qzqp7lkqwe06hnnywhdsem4jap6zqdtlya9jrdkc97294v2xju8rx3jm9tf6m"
const FEE_PERCENTAGE = 0.001 // 0.1%

export function CryptoSwap() {
  // State
  const [fromCurrency, setFromCurrency] = useState("btc")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [kaspaAddress, setKaspaAddress] = useState("")
  const [addressError, setAddressError] = useState("")
  const [refundAddress, setRefundAddress] = useState("")
  const [status, setStatus] = useState<SwapStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null)
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [showDepositDialog, setShowDepositDialog] = useState(false)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const [minAmount, setMinAmount] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [feeAmount, setFeeAmount] = useState<string>("0")
  const [showFeeInfo, setShowFeeInfo] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null) // Example declaration. Replace with actual wallet logic.
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)

  // Get the selected currency object
  const selectedCurrency = SUPPORTED_CURRENCIES.find((c) => c.symbol === fromCurrency) || SUPPORTED_CURRENCIES[0]

  // Validate Kaspa address when it changes
  useEffect(() => {
    if (kaspaAddress) {
      const isValid = isValidKaspaAddress(kaspaAddress)
      setAddressError(isValid ? "" : "Invalid Kaspa address format")
    } else {
      setAddressError("")
    }
  }, [kaspaAddress])

  // Calculate fee when toAmount changes
  useEffect(() => {
    if (toAmount && !isNaN(Number(toAmount))) {
      const calculatedFee = (Number(toAmount) * FEE_PERCENTAGE).toFixed(8)
      setFeeAmount(calculatedFee)
    } else {
      setFeeAmount("0")
    }
  }, [toAmount])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }
    }
  }, [statusCheckInterval])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".currency-dropdown") && !target.closest(".currency-selector")) {
        setShowCurrencyDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Get exchange estimate when input changes
  const fetchEstimate = useCallback(async () => {
    if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
      setToAmount("")
      setEstimateData(null)
      return
    }

    setStatus("estimating")

    try {
      console.log(`Fetching estimate for ${fromAmount} ${fromCurrency} to KAS`)
      const result = await getEstimate(fromCurrency, "kas", fromAmount)

      console.log("Estimate result:", result)

      if (result.success && result.data) {
        setEstimateData(result.data)
        setToAmount(result.data.estimatedAmount)
        setErrorMessage("")
      } else {
        setErrorMessage(result.error || "Failed to get exchange estimate")
        if (result.minAmount) {
          setMinAmount(result.minAmount)
        }
      }
    } catch (error: any) {
      console.error("Estimate error:", error)
      setErrorMessage(error.message || "Failed to get exchange estimate")
    } finally {
      setStatus("idle")
    }
  }, [fromAmount, fromCurrency])

  // Debounce the estimate fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount) {
        fetchEstimate()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [fromAmount, fromCurrency, fetchEstimate])

  // Check transaction status periodically
  const startStatusCheck = useCallback(
    (txId: string) => {
      // Clear any existing interval
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
      }

      // Set up new interval
      const interval = setInterval(async () => {
        try {
          const result = await checkTransactionStatus(txId)

          if (result.success && result.data) {
            setTransactionData((prev) => ({
              ...prev!,
              status: result.data.status,
              toAmount: result.data.toAmount || prev?.toAmount,
            }))

            // Update status based on transaction status
            if (result.data.status === "finished") {
              setStatus("success")
              clearInterval(interval)

              // Send the fee when the exchange is complete
              if (result.data.toAmount) {
                sendFeeTx(result.data.toAmount)
              } else if (toAmount) {
                sendFeeTx(toAmount)
              }
            } else if (result.data.status === "failed" || result.data.status === "refunded") {
              setStatus("error")
              setErrorMessage(`Exchange ${result.data.status}. Please try again.`)
              clearInterval(interval)
            } else if (result.data.status === "exchanging") {
              setStatus("exchanging")
            }
          }
        } catch (error) {
          console.error("Status check error:", error)
        }
      }, 10000) // Check every 10 seconds

      setStatusCheckInterval(interval)

      return interval
    },
    [statusCheckInterval, toAmount],
  )

  // Send fee transaction - now just logs since wallet is removed
  const sendFeeTx = async (receivedAmount: string) => {
    console.log("Fee would be sent: ", (Number.parseFloat(receivedAmount) * FEE_PERCENTAGE).toFixed(8), " KAS")
    // Fee transaction is now handled server-side
  }

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Validate form
  const validateForm = () => {
    if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
      setErrorMessage("Please enter a valid amount to exchange")
      return false
    }

    if (minAmount && Number(fromAmount) < Number(minAmount)) {
      setErrorMessage(`Minimum amount is ${minAmount} ${fromCurrency.toUpperCase()}`)
      return false
    }

    if (!kaspaAddress) {
      setErrorMessage("Recipient Kaspa address is required")
      return false
    }

    // Normalize and validate the address
    const normalizedAddress = normalizeKaspaAddress(kaspaAddress)
    if (!isValidKaspaAddress(normalizedAddress)) {
      setErrorMessage("Invalid Kaspa address format. Please check the address and try again.")
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setAddressError("")

    // No wallet check needed

    if (!validateForm()) {
      setStatus("error")
      return
    }

    try {
      setStatus("creating")

      // Normalize the address before sending
      const normalizedAddress = normalizeKaspaAddress(kaspaAddress)
      console.log(`Creating exchange: ${fromAmount} ${fromCurrency} to KAS at address ${normalizedAddress}`)

      const result = await createExchange(
        fromCurrency,
        "kas",
        fromAmount,
        normalizedAddress,
        refundAddress ? normalizeKaspaAddress(refundAddress) : undefined,
      )

      console.log("Exchange creation result:", result)

      if (result.success && result.data) {
        // Map the ExchangeTransaction to TransactionData
        setTransactionData({
          id: result.data.id,
          payinAddress: result.data.payinAddress,
          payoutAddress: result.data.payoutAddress,
          fromAmount: result.data.amount, // Use amount as fromAmount
          toAmount: estimateData?.estimatedAmount,
          status: result.data.status,
          validUntil: result.data.validUntil,
          createdAt: new Date().toISOString(),
        })
        setStatus("awaiting_deposit")
        setShowDepositDialog(true)
      } else {
        setStatus("error")
        setErrorMessage(result.error || "Failed to create exchange transaction")
      }
    } catch (error: any) {
      console.error("Exchange error:", error)
      setStatus("error")
      setErrorMessage(error.message || "Exchange failed. Please try again.")
    }
  }

  // Reset the form
  const resetForm = () => {
    setFromAmount("")
    setToAmount("")
    setStatus("idle")
    setErrorMessage("")
    setAddressError("")
    setTransactionData(null)
    setEstimateData(null)
    setFeeAmount("0")
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
      setStatusCheckInterval(null)
    }
  }

  // Use wallet address button handler
  const handleUseWalletAddress = () => {
    if (walletAddress) {
      setKaspaAddress(walletAddress)
      setAddressError("")
    }
  }

  // Calculate the amount after fee
  const getAmountAfterFee = () => {
    if (!toAmount || isNaN(Number(toAmount))) return "0"
    const amount = Number(toAmount)
    const fee = Number(feeAmount)
    return (amount - fee).toFixed(8)
  }

  // Handle currency selection
  const handleCurrencySelect = (symbol: string) => {
    setFromCurrency(symbol)
    setFromAmount("")
    setToAmount("")
    setEstimateData(null)
    setMinAmount(null)
    setShowCurrencyDropdown(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {status === "success" && (
          <div className="bg-green-100 text-green-800 font-medium p-3 rounded-md mb-4 text-center">
            <CheckCircle2 className="h-5 w-5 inline-block mr-2 text-green-600" />
            Exchange Completed Successfully!
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="fromCrypto" className="text-teal-700 dark:text-teal-300">
            From Cryptocurrency
          </Label>

          {/* New Currency Selector */}
          <div className="flex gap-2">
            <div className="relative w-1/3">
              <button
                type="button"
                className="currency-selector flex items-center justify-between w-full h-10 px-3 py-2 text-sm border border-teal-200 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                disabled={status !== "idle"}
              >
                <div className="flex items-center">
                  {selectedCurrency.logoUrl && (
                    <div className="w-5 h-5 mr-2 overflow-hidden rounded-full">
                      <Image
                        src={selectedCurrency.logoUrl || "/placeholder.svg"}
                        alt={selectedCurrency.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span>{selectedCurrency.symbol.toUpperCase()}</span>
                </div>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {/* Dropdown */}
              {showCurrencyDropdown && (
                <div className="currency-dropdown absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-teal-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <button
                      key={currency.symbol}
                      type="button"
                      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-50 ${
                        currency.symbol === fromCurrency ? "bg-teal-100" : ""
                      }`}
                      onClick={() => handleCurrencySelect(currency.symbol)}
                    >
                      {currency.logoUrl && (
                        <div className="w-5 h-5 mr-2 overflow-hidden rounded-full">
                          <Image
                            src={currency.logoUrl || "/placeholder.svg"}
                            alt={currency.name}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{currency.symbol.toUpperCase()}</span>
                        <span className="text-xs text-gray-500">{currency.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input
              id="fromAmount"
              type="number"
              step="0.00000001"
              min="0.00000001"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="border-teal-200 dark:border-gray-600 focus-visible:ring-teal-500 w-2/3 dark:bg-gray-700 dark:text-white"
              disabled={status !== "idle"}
              required
            />
          </div>

          {minAmount && (
            <div className="text-xs text-amber-600">
              Minimum amount: {minAmount} {fromCurrency.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex justify-center my-2">
          <div className="bg-teal-100 rounded-full p-2">
            <ArrowDownUp className="h-5 w-5 text-teal-600" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toAmount" className="text-teal-700 dark:text-teal-300">
            To Kaspa (KAS)
          </Label>
          <div className="relative">
            <Input
              id="toAmount"
              type="text"
              placeholder="0.00"
              value={toAmount}
              className="border-teal-200 focus-visible:ring-teal-500 pr-12"
              disabled={true}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-medium text-teal-600">
              KAS
            </div>
          </div>
          {status === "estimating" && (
            <div className="text-xs text-teal-600 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Calculating exchange rate...
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="kaspaAddress" className="text-teal-700 dark:text-teal-300">
              Recipient Kaspa Address
            </Label>
          </div>
          <Input
            id="kaspaAddress"
            placeholder="kaspa:qr..."
            value={kaspaAddress}
            onChange={(e) => setKaspaAddress(e.target.value)}
            className={`border-teal-200 dark:border-gray-600 focus-visible:ring-teal-500 ${addressError ? "border-red-300" : ""}`}
            disabled={status !== "idle"}
            required
          />
          {addressError ? <div className="text-xs text-red-500">{addressError}</div> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="refundAddress" className="text-teal-700 dark:text-teal-300">
            Refund Address (Optional)
          </Label>
          <Input
            id="refundAddress"
            placeholder={`${fromCurrency} refund address...`}
            value={refundAddress}
            onChange={(e) => setRefundAddress(e.target.value)}
            className="border-teal-200 dark:border-gray-600 focus-visible:ring-teal-500"
            disabled={status !== "idle"}
          />
          <div className="text-xs text-teal-600">
            Address to receive refunds in case the exchange fails. Should be a valid {fromCurrency.toUpperCase()}{" "}
            address.
          </div>
        </div>

        {estimateData && (
          <div className="bg-teal-50 dark:bg-gray-700 border border-teal-100 dark:border-gray-600 rounded-md p-3 text-sm text-teal-700 dark:text-gray-300">
            <p className="font-medium">Exchange Details:</p>
            <p>
              Rate: 1 {fromCurrency.toUpperCase()} ≈ {(() => {
                // Get the rate from estimateData
                const rateValue = estimateData.rate

                // Try to parse it as a number
                let numRate = 0
                try {
                  numRate = typeof rateValue === "string" ? Number(rateValue) : rateValue
                } catch (e) {
                  console.error("Error parsing rate:", e)
                }

                // If we have a valid number and it's not too small, display it
                if (!isNaN(numRate) && numRate > 0) {
                  return numRate.toFixed(4)
                }

                // If the rate is invalid or zero, try to calculate it from the amounts
                if (fromAmount && estimateData.estimatedAmount) {
                  const fromNum = Number(fromAmount)
                  const toNum = Number(estimateData.estimatedAmount)
                  if (fromNum > 0 && toNum > 0) {
                    return (toNum / fromNum).toFixed(4)
                  }
                }

                // Fallback to mock data for SOL if we're dealing with SOL
                if (fromCurrency.toLowerCase() === "sol") {
                  return "350.0000"
                }

                // Last resort fallback
                return "0.0000"
              })()} KAS
            </p>
            <p>
              Network Fee:{" "}
              {isNaN(Number.parseFloat(estimateData.fee))
                ? "0.00000000"
                : Number.parseFloat(estimateData.fee).toFixed(8)}{" "}
              KAS
            </p>
            <div className="flex items-center gap-1 mt-2">
              <p className="font-medium">ꓘaspaBOX Fee (0.1%):</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-teal-600"
                onClick={() => setShowFeeInfo(!showFeeInfo)}
              >
                <InfoIcon className="h-4 w-4" />
              </Button>
            </div>
            {showFeeInfo && (
              <div className="mt-1 text-xs bg-teal-100 p-2 rounded">
                <p>A 0.1% fee will be sent to support ꓘaspaBOX development when the exchange completes.</p>
                <p>This fee is taken from the received KAS amount.</p>
              </div>
            )}
            <div className="flex justify-between mt-1">
              <span>Fee Amount:</span>
              <span>{feeAmount} KAS</span>
            </div>
            <div className="flex justify-between font-medium border-t border-teal-200 mt-2 pt-2">
              <span>You Receive:</span>
              <span>{getAmountAfterFee()} KAS</span>
            </div>
            <p className="text-xs mt-1">
              Rates are provided by ChangeNOW and may fluctuate. The final amount may vary slightly.
            </p>
          </div>
        )}

        {status === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Exchange Successful!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your exchange has been processed successfully.
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-green-700 border-green-300 hover:bg-green-100"
                onClick={resetForm}
              >
                Start New Exchange
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {errorMessage || "An error occurred during the exchange process."}
              {status === "error" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
                  onClick={resetForm}
                >
                  Try Again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base font-medium"
          disabled={status !== "idle" || !fromAmount || !toAmount || !!addressError}
        >
          {status === "creating" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Exchange...
            </span>
          ) : status === "estimating" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Calculating...
            </span>
          ) : (
            "Exchange to Kaspa"
          )}
        </Button>

        <p className="text-xs text-center text-teal-700">
          Exchange rates are updated in real-time. Actual received amount may vary slightly.
        </p>
      </form>

      {/* Deposit Dialog */}
      <Dialog
        open={showDepositDialog}
        onOpenChange={(open) => {
          // Only allow closing if not in awaiting_deposit or exchanging state
          if (!open && status !== "awaiting_deposit" && status !== "exchanging") {
            setShowDepositDialog(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {status === "awaiting_deposit"
                ? "Deposit Funds to Complete Exchange"
                : status === "exchanging"
                  ? "Exchange in Progress"
                  : status === "success"
                    ? "Exchange Completed"
                    : "Exchange Status"}
            </DialogTitle>
            <DialogDescription>
              {status === "awaiting_deposit"
                ? "Please send the exact amount to the address below to complete your exchange."
                : status === "exchanging"
                  ? "Your exchange is being processed. This may take a few minutes."
                  : status === "success"
                    ? "Your exchange has been completed successfully!"
                    : "Current status of your exchange transaction."}
            </DialogDescription>
          </DialogHeader>

          {transactionData && (
            <div className="space-y-4 py-4">
              {status === "awaiting_deposit" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Send Exactly</Label>
                    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
                      <div className="flex items-center">
                        {selectedCurrency.logoUrl && (
                          <div className="w-5 h-5 mr-2 overflow-hidden rounded-full">
                            <Image
                              src={selectedCurrency.logoUrl || "/placeholder.svg"}
                              alt={selectedCurrency.name}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span className="font-mono text-lg">
                          {transactionData.fromAmount} {fromCurrency.toUpperCase()}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transactionData.fromAmount, "amount")}
                        className="h-8 px-2"
                      >
                        {copiedText === "amount" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">To This Address</Label>
                    <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
                      <span className="font-mono text-sm break-all">{transactionData.payinAddress}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transactionData.payinAddress, "address")}
                        className="h-8 px-2 ml-2 flex-shrink-0"
                      >
                        {copiedText === "address" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700 text-sm">
                      Send exactly the specified amount. Sending less may result in a failed exchange. Sending more will
                      exchange the entire amount.
                    </AlertDescription>
                  </Alert>

                  <div className="text-sm text-gray-500">
                    <p>Expected to receive: ~{getAmountAfterFee()} KAS (after 0.1% fee)</p>
                    <p>Valid until: {new Date(transactionData.validUntil).toLocaleString()}</p>
                  </div>
                </>
              )}

              {status === "exchanging" && (
                <>
                  <div className="flex justify-center py-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RefreshCw className="h-8 w-8 text-teal-500 animate-spin" />
                      </div>
                      <div className="h-24 w-24 rounded-full border-4 border-teal-200 border-t-teal-500 animate-spin"></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-medium text-teal-700">Exchange in Progress</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your {fromCurrency.toUpperCase()} is being exchanged to KAS. This process typically takes 5-30
                      minutes.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p>
                      <span className="font-medium">Transaction ID:</span> {transactionData.id}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {transactionData.status}
                    </p>
                    <p className="flex items-center">
                      <span className="font-medium mr-1">Amount:</span>
                      <div className="flex items-center">
                        {selectedCurrency.logoUrl && (
                          <div className="w-4 h-4 mr-1 overflow-hidden rounded-full">
                            <Image
                              src={selectedCurrency.logoUrl || "/placeholder.svg"}
                              alt={selectedCurrency.name}
                              width={16}
                              height={16}
                              className="object-contain"
                            />
                          </div>
                        )}
                        <span>
                          {transactionData.fromAmount} {fromCurrency.toUpperCase()} → {toAmount} KAS
                        </span>
                      </div>
                    </p>
                    <p>
                      <span className="font-medium">After Fee:</span> {getAmountAfterFee()} KAS (0.1% fee applied)
                    </p>
                  </div>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="flex justify-center py-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-medium text-green-700">Exchange Completed</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Your {fromCurrency.toUpperCase()} has been successfully exchanged to KAS.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="flex justify-between">
            {status === "awaiting_deposit" && (
              <Button
                variant="outline"
                onClick={() => window.open(`https://changenow.io/exchange/txs/${transactionData?.id}`, "_blank")}
                className="flex items-center gap-1"
              >
                View on ChangeNOW <ExternalLink className="h-4 w-4" />
              </Button>
            )}

            {(status === "success" || status === "error") && (
              <Button
                onClick={() => {
                  setShowDepositDialog(false)
                  resetForm()
                }}
              >
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

