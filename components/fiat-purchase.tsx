"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowDownUp, CheckCircle2, Loader2, InfoIcon, ChevronDown, CreditCard } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { isValidKaspaAddress, normalizeKaspaAddress } from "@/lib/address-utils"
import { SUPPORTED_FIAT, SUPPORTED_CRYPTO } from "@/lib/fiat-exchange-api"
import { getFiatToKaspaEstimate, createFiatToCryptoTransaction } from "@/app/actions/fiat-actions"
import Image from "next/image"

// Types
type PurchaseStatus = "idle" | "estimating" | "creating" | "redirecting" | "success" | "error"

interface EstimateData {
  estimatedAmount: string
  rate: string
  networkFee: string
  minAmount?: string
  maxAmount?: string
}

interface TransactionData {
  id: string
  paymentUrl: string
  status: string
  createdAt: string
  validUntil: string
}

// Fee configuration
const FEE_ADDRESS = "kaspa:qzqp7lkqwe06hnnywhdsem4jap6zqdtlya9jrdkc97294v2xju8rx3jm9tf6m"
const FEE_PERCENTAGE = 0.001 // 0.1%

export function FiatPurchase() {
  // State
  const [fromCurrency, setFromCurrency] = useState("usd")
  const [toCurrency, setToCurrency] = useState("kas")
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [addressError, setAddressError] = useState("")
  const [status, setStatus] = useState<PurchaseStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [estimateData, setEstimateData] = useState<EstimateData | null>(null)
  const [showFiatDropdown, setShowFiatDropdown] = useState(false)
  const [showCryptoDropdown, setShowCryptoDropdown] = useState(false)
  const [minAmount, setMinAmount] = useState<string | null>(null)
  const [maxAmount, setMaxAmount] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [feeAmount, setFeeAmount] = useState<string>("0")
  const [showFeeInfo, setShowFeeInfo] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [transaction, setTransaction] = useState<TransactionData | null>(null)

  // Get the selected currencies
  const selectedFiat = SUPPORTED_FIAT.find((c) => c.symbol === fromCurrency) || SUPPORTED_FIAT[0]
  const selectedCrypto = SUPPORTED_CRYPTO.find((c) => c.symbol === toCurrency) || SUPPORTED_CRYPTO[0]

  // Validate recipient address when it changes
  useEffect(() => {
    if (recipientAddress) {
      if (toCurrency === "kas") {
        const isValid = isValidKaspaAddress(recipientAddress)
        setAddressError(isValid ? "" : "Invalid Kaspa address format")
      } else {
        // For other cryptocurrencies, we'd need specific validation
        // For now, just check if it's not empty
        setAddressError(recipientAddress.trim() ? "" : "Address is required")
      }
    } else {
      setAddressError("")
    }
  }, [recipientAddress, toCurrency])

  // Calculate fee when toAmount changes
  useEffect(() => {
    if (toAmount && !isNaN(Number(toAmount))) {
      const calculatedFee = (Number(toAmount) * FEE_PERCENTAGE).toFixed(8)
      setFeeAmount(calculatedFee)
    } else {
      setFeeAmount("0")
    }
  }, [toAmount])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".fiat-dropdown") && !target.closest(".fiat-selector")) {
        setShowFiatDropdown(false)
      }
      if (!target.closest(".crypto-dropdown") && !target.closest(".crypto-selector")) {
        setShowCryptoDropdown(false)
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
      // Call the server action to get the estimate
      const result = await getFiatToKaspaEstimate(fromCurrency, toCurrency, fromAmount)

      if (result.success && result.data) {
        setEstimateData(result.data)
        setToAmount(result.data.estimatedAmount)
        setMinAmount(result.data.minAmount || null)
        setMaxAmount(result.data.maxAmount || null)
        setErrorMessage("")
        setStatus("idle")
      } else {
        setErrorMessage(result.error || "Failed to get exchange estimate")
        if (result.minAmount) {
          setMinAmount(result.minAmount)
        }
        if (result.maxAmount) {
          setMaxAmount(result.maxAmount)
        }
        setStatus("error")
      }
    } catch (error: any) {
      console.error("Estimate error:", error)
      setErrorMessage(error.message || "Failed to get exchange estimate")
      setStatus("error")
    }
  }, [fromAmount, fromCurrency, toCurrency])

  // Debounce the estimate fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount) {
        fetchEstimate()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [fromAmount, fromCurrency, toCurrency, fetchEstimate])

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Validate form
  const validateForm = () => {
    if (!fromAmount || isNaN(Number(fromAmount)) || Number(fromAmount) <= 0) {
      setErrorMessage("Please enter a valid amount")
      return false
    }

    if (minAmount && Number(fromAmount) < Number(minAmount)) {
      setErrorMessage(`Minimum amount is ${minAmount} ${fromCurrency.toUpperCase()}`)
      return false
    }

    if (maxAmount && Number(fromAmount) > Number(maxAmount)) {
      setErrorMessage(`Maximum amount is ${maxAmount} ${fromCurrency.toUpperCase()}`)
      return false
    }

    if (!recipientAddress) {
      setErrorMessage("Recipient address is required")
      return false
    }

    if (toCurrency === "kas") {
      // Normalize and validate the address for Kaspa
      const normalizedAddress = normalizeKaspaAddress(recipientAddress)
      if (!isValidKaspaAddress(normalizedAddress)) {
        setErrorMessage("Invalid Kaspa address format. Please check the address and try again.")
        return false
      }
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setAddressError("")

    if (!validateForm()) {
      setStatus("error")
      return
    }

    try {
      setStatus("creating")

      // Generate a return URL based on the current URL
      const returnUrl = window.location.origin + window.location.pathname + "?tab=buy&status=success"

      // Call the server action to create a transaction
      const result = await createFiatToCryptoTransaction(
        fromCurrency,
        toCurrency,
        fromAmount,
        recipientAddress,
        returnUrl,
      )

      if (result.success && result.data) {
        setTransaction(result.data)
        setStatus("redirecting")
        setShowPaymentDialog(true)
      } else {
        setStatus("error")
        setErrorMessage(result.error || "Failed to create transaction")
      }
    } catch (error: any) {
      console.error("Purchase error:", error)
      setStatus("error")
      setErrorMessage(error.message || "Failed to create transaction. Please try again.")
    }
  }

  // Reset the form
  const resetForm = () => {
    setFromAmount("")
    setToAmount("")
    setStatus("idle")
    setErrorMessage("")
    setAddressError("")
    setEstimateData(null)
    setFeeAmount("0")
    setShowPaymentDialog(false)
    setTransaction(null)
  }

  // Handle currency selection
  const handleFiatSelect = (symbol: string) => {
    setFromCurrency(symbol)
    setFromAmount("")
    setToAmount("")
    setEstimateData(null)
    setMinAmount(null)
    setMaxAmount(null)
    setShowFiatDropdown(false)
  }

  const handleCryptoSelect = (symbol: string) => {
    setToCurrency(symbol)
    setFromAmount("")
    setToAmount("")
    setEstimateData(null)
    setShowCryptoDropdown(false)

    // Clear address if changing from/to Kaspa
    if (symbol !== "kas" && toCurrency === "kas") {
      setRecipientAddress("")
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

  // Check URL parameters for status
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("tab") === "buy" && params.get("status") === "success") {
        setStatus("success")
      }
    }
  }, [])

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {status === "success" && (
          <div className="bg-green-100 text-green-800 font-medium p-3 rounded-md mb-4 text-center">
            <CheckCircle2 className="h-5 w-5 inline-block mr-2 text-green-600" />
            Purchase Completed Successfully!
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fromFiat" className="text-teal-700 dark:text-teal-300">
            From Fiat Currency
          </Label>

          {/* Fiat Currency Selector */}
          <div className="flex gap-2">
            <div className="relative w-1/3">
              <button
                type="button"
                className="fiat-selector flex items-center justify-between w-full h-10 px-3 py-2 text-sm border border-teal-200 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                onClick={() => setShowFiatDropdown(!showFiatDropdown)}
                disabled={status !== "idle"}
              >
                <div className="flex items-center">
                  <span className="mr-1">{selectedFiat.sign}</span>
                  <span>{selectedFiat.symbol.toUpperCase()}</span>
                </div>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {/* Dropdown */}
              {showFiatDropdown && (
                <div className="fiat-dropdown absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-teal-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {SUPPORTED_FIAT.map((currency) => (
                    <button
                      key={currency.symbol}
                      type="button"
                      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-gray-700 ${
                        currency.symbol === fromCurrency ? "bg-teal-100 dark:bg-gray-600" : ""
                      }`}
                      onClick={() => handleFiatSelect(currency.symbol)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {currency.sign} {currency.symbol.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{currency.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input
              id="fromAmount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="border-teal-200 dark:border-gray-600 focus-visible:ring-teal-500 w-2/3 dark:bg-gray-700 dark:text-white"
              disabled={status !== "idle"}
              required
            />
          </div>

          {minAmount && (
            <div className="text-xs text-amber-600 dark:text-amber-400">
              Minimum amount: {minAmount} {fromCurrency.toUpperCase()}
            </div>
          )}

          {maxAmount && (
            <div className="text-xs text-amber-600 dark:text-amber-400">
              Maximum amount: {maxAmount} {fromCurrency.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex justify-center my-2">
          <div className="bg-teal-100 dark:bg-teal-800 rounded-full p-2">
            <ArrowDownUp className="h-5 w-5 text-teal-600 dark:text-teal-300" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toCrypto" className="text-teal-700 dark:text-teal-300">
            To Cryptocurrency
          </Label>

          {/* Crypto Currency Selector */}
          <div className="flex gap-2">
            <div className="relative w-1/3">
              <button
                type="button"
                className="crypto-selector flex items-center justify-between w-full h-10 px-3 py-2 text-sm border border-teal-200 dark:border-gray-600 rounded-md bg-background dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                disabled={status !== "idle"}
              >
                <div className="flex items-center">
                  {selectedCrypto.logoUrl && (
                    <div className="w-5 h-5 mr-2 overflow-hidden rounded-full">
                      <Image
                        src={selectedCrypto.logoUrl || "/placeholder.svg"}
                        alt={selectedCrypto.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span>{selectedCrypto.symbol.toUpperCase()}</span>
                </div>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              {/* Dropdown */}
              {showCryptoDropdown && (
                <div className="crypto-dropdown absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-teal-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                  {SUPPORTED_CRYPTO.map((currency) => (
                    <button
                      key={currency.symbol}
                      type="button"
                      className={`flex items-center w-full px-3 py-2 text-sm hover:bg-teal-50 dark:hover:bg-gray-700 ${
                        currency.symbol === toCurrency ? "bg-teal-100 dark:bg-gray-600" : ""
                      }`}
                      onClick={() => handleCryptoSelect(currency.symbol)}
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
                        <span className="text-xs text-gray-500 dark:text-gray-400">{currency.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Input
              id="toAmount"
              type="text"
              placeholder="0.00"
              value={toAmount}
              className="border-teal-200 dark:border-gray-600 focus-visible:ring-teal-500 w-2/3 dark:bg-gray-700 dark:text-white"
              disabled={true}
            />
          </div>

          {status === "estimating" && (
            <div className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Calculating exchange rate...
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="recipientAddress" className="text-teal-700 dark:text-teal-300">
              Recipient {toCurrency.toUpperCase()} Address
            </Label>
          </div>
          <Input
            id="recipientAddress"
            placeholder={toCurrency === "kas" ? "kaspa:qr..." : `${toCurrency.toUpperCase()} address...`}
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className={`border-teal-200 dark:border-gray-600 focus-visible:ring-teal-500 ${addressError ? "border-red-300" : ""}`}
            disabled={status !== "idle"}
            required
          />
          {addressError ? <div className="text-xs text-red-500">{addressError}</div> : null}
        </div>

        {estimateData && (
          <div className="bg-teal-50 dark:bg-gray-700 border border-teal-100 dark:border-gray-600 rounded-md p-3 text-sm text-teal-700 dark:text-gray-300">
            <p className="font-medium">Purchase Details:</p>
            <p>
              Rate: 1 {fromCurrency.toUpperCase()} ≈ {Number(estimateData.rate).toFixed(4)} {toCurrency.toUpperCase()}
            </p>
            <p>
              Network Fee: {estimateData.networkFee || "0"} {fromCurrency.toUpperCase()}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <p className="font-medium">ꓘaspaBOX Fee (0.1%):</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-teal-600 dark:text-teal-400"
                onClick={() => setShowFeeInfo(!showFeeInfo)}
              >
                <InfoIcon className="h-4 w-4" />
              </Button>
            </div>
            {showFeeInfo && (
              <div className="mt-1 text-xs bg-teal-100 dark:bg-gray-600 p-2 rounded">
                <p>A 0.1% fee will be sent to support ꓘaspaBOX development when the purchase completes.</p>
                <p>This fee is taken from the received {toCurrency.toUpperCase()} amount.</p>
              </div>
            )}
            <div className="flex justify-between mt-1">
              <span>Fee Amount:</span>
              <span>
                {feeAmount} {toCurrency.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between font-medium border-t border-teal-200 dark:border-gray-600 mt-2 pt-2">
              <span>You Receive:</span>
              <span>
                {getAmountAfterFee()} {toCurrency.toUpperCase()}
              </span>
            </div>
            <p className="text-xs mt-1">
              Rates are provided by ChangeNOW and may fluctuate. The final amount may vary slightly.
            </p>
          </div>
        )}

        {status === "error" && (
          <Alert className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-800 dark:text-red-300">Error</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              {errorMessage || "An error occurred during the purchase process."}
              {status === "error" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/50"
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
              Creating Purchase...
            </span>
          ) : status === "estimating" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Calculating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              Buy with {fromCurrency.toUpperCase()}
            </span>
          )}
        </Button>

        <p className="text-xs text-center text-teal-700 dark:text-teal-400">
          Exchange rates are updated in real-time. Actual received amount may vary slightly.
        </p>
      </form>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              You'll be redirected to ChangeNOW's secure payment page to complete your purchase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {transaction && (
              <div className="bg-teal-50 dark:bg-gray-700 border border-teal-100 dark:border-gray-600 rounded-md p-4">
                <h3 className="font-medium text-teal-800 dark:text-teal-300 mb-2">Purchase Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-teal-700 dark:text-teal-400">Amount:</span>
                    <span className="font-medium text-teal-800 dark:text-teal-300">
                      {selectedFiat.sign}
                      {fromAmount} {fromCurrency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-700 dark:text-teal-400">Receiving:</span>
                    <span className="font-medium text-teal-800 dark:text-teal-300">
                      ~{getAmountAfterFee()} {toCurrency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-700 dark:text-teal-400">To Address:</span>
                    <span className="font-medium text-teal-800 dark:text-teal-300 truncate max-w-[200px]">
                      {recipientAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-700 dark:text-teal-400">Transaction ID:</span>
                    <span className="font-medium text-teal-800 dark:text-teal-300 truncate max-w-[200px]">
                      {transaction.id}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You will be redirected to ChangeNOW's secure payment page. Complete the payment process there to
                finalize your purchase.
              </p>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="border-teal-200 dark:border-gray-600 text-teal-700 dark:text-teal-400"
              >
                Cancel
              </Button>
              {transaction && (
                <Button
                  onClick={() => {
                    window.open(transaction.paymentUrl, "_blank")
                    // Don't set success immediately, it should come from the redirect
                    setTimeout(() => {
                      setShowPaymentDialog(false)
                    }, 1000)
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Proceed to Payment
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

