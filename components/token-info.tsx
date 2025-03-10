"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import * as KsprBotApi from "@/lib/kspr-bot-api"

interface TokenInfoProps {
  tokenAddress: string
  showDetails?: boolean
}

export function TokenInfo({ tokenAddress, showDetails = true }: TokenInfoProps) {
  const [token, setToken] = useState<KsprBotApi.KRC20Token | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      if (!tokenAddress) return

      setIsLoading(true)
      setError(null)

      try {
        const tokenInfo = await KsprBotApi.getTokenInfo(tokenAddress)
        setToken(tokenInfo)
      } catch (err: any) {
        console.error("Error fetching token:", err)
        setError(err.message || "Failed to load token information")
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [tokenAddress])

  const openKsprBot = () => {
    const url = KsprBotApi.getKsprBotTelegramUrl()
    window.open(url, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-teal-500 mr-2" />
        <span className="text-sm text-teal-600">Loading token information...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    )
  }

  if (!token) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-gray-500">No token information available</p>
        <Button variant="link" size="sm" onClick={openKsprBot} className="text-teal-600 mt-2">
          Check on KSPR Bot
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
            {token.symbol.substring(0, 1)}
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{token.name}</h3>
            <p className="text-xs text-gray-500">{token.symbol}</p>
          </div>
        </div>
        {token.balance && (
          <div className="text-right">
            <p className="font-medium text-gray-800">{token.balance}</p>
            <p className="text-xs text-gray-500">Balance</p>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-gray-500">Address:</div>
            <div className="text-gray-800 truncate">{token.address.substring(0, 10)}...</div>

            <div className="text-gray-500">Decimals:</div>
            <div className="text-gray-800">{token.decimals}</div>

            {token.totalSupply && (
              <>
                <div className="text-gray-500">Total Supply:</div>
                <div className="text-gray-800">{token.totalSupply}</div>
              </>
            )}
          </div>

          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={openKsprBot} className="text-xs flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Open in KSPR Bot
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

