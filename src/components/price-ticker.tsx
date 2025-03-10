"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

interface PriceData {
  price: string
  change24h: string
  isPositive: boolean
  low24h: string
  high24h: string
  lastUpdated: string
}

export function PriceTicker() {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPriceData = async () => {
    setLoading(true)
    try {
      // In a production app, you would use a server-side API route to fetch this data
      // to avoid exposing API keys. This is a simplified implementation.

      // For demo purposes, we're using mock data based on the screenshot
      // In a real app, you would fetch from an API like CoinGecko or CoinMarketCap
      const mockData: PriceData = {
        price: "$0.07475",
        change24h: "0.08%",
        isPositive: true,
        low24h: "$0.07395",
        high24h: "$0.07686",
        lastUpdated: new Date().toLocaleTimeString(),
      }

      setPriceData(mockData)
      setError(null)
    } catch (err) {
      console.error("Error fetching price data:", err)
      setError("Failed to load price data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch on component mount
  useEffect(() => {
    fetchPriceData()

    // Set up hourly refresh
    const intervalId = setInterval(fetchPriceData, 60 * 60 * 1000) // 1 hour in milliseconds

    return () => clearInterval(intervalId)
  }, [])

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-2 rounded-md text-sm">{error}</div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-4 transition-colors duration-300">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-color-a6gTLOtFUkyTfto7nuemX26goOL0VS.png"
            alt="Kaspa Logo"
            className="w-4 h-4"
          />
          <span className="font-medium text-gray-700 dark:text-gray-300">Kaspa (KAS)</span>
        </div>

        {loading && !priceData ? (
          <div className="flex items-center">
            <div className="animate-spin h-3 w-3 border-2 border-teal-500 border-t-transparent rounded-full mr-2"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Loading...</span>
          </div>
        ) : priceData ? (
          <>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 dark:text-gray-200">{priceData.price}</span>
              <div
                className={`flex items-center ${priceData.isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"} text-xs`}
              >
                {priceData.isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {priceData.change24h}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 w-full md:w-auto">
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">24h Low:</span>
                <span className="font-medium text-gray-800 dark:text-gray-300">{priceData.low24h}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 dark:text-gray-400">24h High:</span>
                <span className="font-medium text-gray-800 dark:text-gray-300">{priceData.high24h}</span>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-gray-500 dark:text-gray-400">Updated: {priceData.lastUpdated}</span>
                <button
                  onClick={fetchPriceData}
                  className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
                  aria-label="Refresh price data"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

