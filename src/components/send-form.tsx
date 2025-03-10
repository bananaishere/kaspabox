"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { isValidKaspaAddress, normalizeKaspaAddress } from "@/lib/address-utils"

// Define transaction status types
type TransactionStatus = "idle" | "validating" | "waiting" | "processing" | "success" | "error" | "pending"

// Define wallet type
type WalletType = "kasware" | null

const FEE_ADDRESS = "kaspa:qznc7k7jv06txsjvsjpy2k9jltutkfyjyt57vs2qe43ln0era3m4urhdkkpag"
const FEE_PERCENTAGE = 0.001 // 0.1%

export function SendForm() {
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<TransactionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [txHash, setTxHash] = useState("")
  const [debugInfo, setDebugInfo] = useState<string>("")

  const validateForm = () => {
    if (!address) {
      setErrorMessage("Recipient address is required")
      return false
    }

    // Normalize the address before validation
    const normalizedAddress = normalizeKaspaAddress(address.trim())

    if (!isValidKaspaAddress(normalizedAddress)) {
      setErrorMessage("Invalid Kaspa address format. Please check the address and try again.")
      return false
    }

    if (!amount || Number.parseFloat(amount) <= 0) {
      setErrorMessage("Please enter a valid amount")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setDebugInfo("")

    setStatus("validating")
    if (!validateForm()) {
      setStatus("error")
      return
    }

    try {
      setStatus("waiting")

      // Normalize the address
      const normalizedAddress = normalizeKaspaAddress(address.trim())

      // Parse amount as a number
      const amountValue = Number.parseFloat(amount)

      // Calculate fee amount (0.1%)
      const feeAmount = amountValue * FEE_PERCENTAGE

      // Log transaction details for debugging
      console.log("Transaction details:", {
        to: normalizedAddress,
        amount: amountValue,
        message: message.trim() || undefined,
        fee: feeAmount,
      })

      setDebugInfo(`Preparing to send ${amountValue} KAS to ${normalizedAddress}`)

      setStatus("processing")

      // Simulate API call for transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setTxHash("simulated_tx_hash_12345")
      setStatus("success")
      setDebugInfo(`Transaction successful! Hash: simulated_tx_hash_12345`)

      // Reset form after success but keep success message visible longer
      setTimeout(() => {
        setAddress("")
        setAmount("")
        setMessage("")
        setTxHash("")
        setDebugInfo("")
      }, 5000)

      // Clear success status after 8 seconds
      setTimeout(() => {
        setStatus("idle")
      }, 8000)
    } catch (error: any) {
      console.error("Error:", error)
      setStatus("error")
      setErrorMessage(error.message || "Transaction failed. Please try again.")
      setDebugInfo(`Error details: ${error.message}
Stack: ${error.stack || "No stack trace available"}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "success" && (
        <div className="bg-green-100 text-green-800 font-medium p-3 rounded-md mb-4 text-center">
          <CheckCircle2 className="h-5 w-5 inline-block mr-2 text-green-600" />
          Sent Successfully!
        </div>
      )}

      {/* Simple address input form instead of wallet connection */}
      <div className="bg-teal-50 border border-teal-200 rounded-md p-3 mb-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <h3 className="text-base font-medium text-teal-700">Enter Sender Address</h3>
          <p className="text-sm text-teal-600 text-center mb-2">Please enter your Kaspa address to continue.</p>
          <Input
            type="text"
            placeholder="kaspa:qr..."
            className="w-full max-w-xs"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-teal-700">
          Recipient Address
        </Label>
        <Input
          id="address"
          placeholder="kaspa:qr..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="border-teal-200 focus-visible:ring-teal-500"
          disabled={status === "processing" || status === "waiting"}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount" className="text-teal-700">
          Amount (KAS)
        </Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            step="0.00000001"
            min="0.00000001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border-teal-200 focus-visible:ring-teal-500 pr-12"
            disabled={status === "processing" || status === "waiting"}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-medium text-teal-600">KAS</div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-teal-700">
          Message (Optional)
        </Label>
        <Textarea
          id="message"
          placeholder="Add a message to the recipient..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-teal-200 focus-visible:ring-teal-500 resize-none"
          disabled={status === "processing" || status === "waiting"}
          rows={3}
        />
      </div>

      {status === "success" && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Transaction Successful!</AlertTitle>
          <AlertDescription className="text-green-700">Your Kaspa tokens have been sent successfully.</AlertDescription>
        </Alert>
      )}

      {status === "pending" && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <CheckCircle2 className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Transaction Submitted</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your transaction may have been submitted. Please check your wallet for confirmation.
            {txHash && (
              <div className="mt-2">
                <span className="text-xs font-medium">Status:</span>
                <code className="block mt-1 text-xs bg-yellow-100 p-1 rounded overflow-x-auto">{txHash}</code>
              </div>
            )}
            {debugInfo && <div className="mt-2 text-xs text-yellow-600">{debugInfo}</div>}
          </AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {errorMessage || "Please check the recipient address and amount."}
            {debugInfo && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">Technical Details</summary>
                <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {debugInfo}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      {(status === "processing" || status === "waiting") && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertTitle className="text-blue-800">
            {status === "waiting" ? "Waiting for confirmation..." : "Processing transaction..."}
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            {status === "waiting"
              ? "Please confirm the transaction in your wallet."
              : "Your transaction is being processed. Please wait..."}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-teal-700 bg-teal-50 p-2 rounded border border-teal-100">
        <p>A 0.1% fee ({FEE_PERCENTAGE * 100}%) will be sent to support ꓘaspaBOX development.</p>
        <p>
          Amount:{" "}
          {amount
            ? `${Number.parseFloat(amount)} KAS + ${(Number.parseFloat(amount) * FEE_PERCENTAGE).toFixed(8)} KAS fee`
            : "0 KAS"}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-base font-medium"
        disabled={status === "processing" || status === "waiting"}
      >
        {status === "processing" || status === "waiting" ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {status === "waiting" ? "Awaiting Confirmation" : "Processing..."}
          </span>
        ) : (
          "Send Kaspa"
        )}
      </Button>

      <p className="text-xs text-center text-teal-700">
        Transaction fees are calculated automatically based on network conditions.
      </p>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-4 border-t pt-4 border-dashed border-teal-200">
          <details className="text-xs text-teal-700">
            <summary className="cursor-pointer font-medium">Developer Debug Tools</summary>
            <div className="mt-2 space-y-2">
              <div className="bg-teal-50 p-2 rounded">
                <p>These tools are only visible in development mode.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const { testKaswareConnection } = require("@/lib/test-utils")
                  }}
                >
                  Test Wallet Connection
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={async () => {
                    if (!address) {
                      alert("Please enter a recipient address first")
                      return
                    }
                    try {
                      const { testKaswareTransaction } = require("@/lib/test-utils")
                      await testKaswareTransaction(address)
                      alert("Test transaction sent! Check console for details.")
                    } catch (error: any) {
                      alert(`Test failed: ${error.message || "Unknown error"}`)
                    }
                  }}
                >
                  Test Minimal Transaction
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    if (!address) {
                      alert("Please enter a recipient address first")
                      return
                    }
                    const { validateKaspaAddress } = require("@/lib/test-utils")
                    validateKaspaAddress(address)
                    alert("Address validation details logged to console")
                  }}
                >
                  Validate Address
                </Button>
              </div>
              <div className="bg-gray-100 p-2 rounded">
                <p className="font-medium">Wallet Status:</p>
                <p>Connected: No</p>
                <p>Wallet Type: None</p>
              </div>
            </div>
          </details>
        </div>
      )}
    </form>
  )
}

