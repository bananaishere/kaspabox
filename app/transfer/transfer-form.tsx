"use client"

import type React from "react"

import { useState } from "react"
import { initializeNftTransfer } from "../actions/middleman-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function TransferNftForm() {
  const [nftId, setNftId] = useState("")
  const [fromAddress, setFromAddress] = useState("")
  const [toAddress, setToAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    transferId?: string
    middlemanAddress?: string
    error?: string
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await initializeNftTransfer(nftId, fromAddress, toAddress)

      if (response.success) {
        setResult({
          success: true,
          transferId: response.transferId,
        })

        // Reset form on success
        setNftId("")
        setFromAddress("")
        setToAddress("")
      } else {
        setResult({
          success: false,
          error: response.error,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Transfer NFT</CardTitle>
        <CardDescription>Use our secure middleman service to transfer your Kaspa NFTs</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nftId">NFT ID</Label>
            <Input
              id="nftId"
              value={nftId}
              onChange={(e) => setNftId(e.target.value)}
              placeholder="Enter the NFT ID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromAddress">From Address</Label>
            <Input
              id="fromAddress"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="Your Kaspa address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="toAddress">To Address</Label>
            <Input
              id="toAddress"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="Recipient's Kaspa address"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Initializing..." : "Initialize Transfer"}
          </Button>
        </form>
      </CardContent>

      {result && (
        <CardFooter>
          {result.success ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Transfer Initialized</AlertTitle>
              <AlertDescription className="text-green-700">
                Transfer ID: {result.transferId}
                <p className="mt-2">
                  Please send your NFT to the middleman wallet. Once received, we will transfer it to the recipient.
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{result.error}</AlertDescription>
            </Alert>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

