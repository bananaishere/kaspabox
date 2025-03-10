"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Bug, ChevronDown, ChevronUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DebugPanelProps {
  apiKey?: string
}

export function DebugPanel({ apiKey }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApiConnection = async () => {
    setIsLoading(true)
    setError(null)
    setTestResult(null)

    try {
      // Test the minimum amount endpoint as it's simple
      const apiKey = process.env.NEXT_PUBLIC_CHANGENOW_API_KEY
      const response = await fetch(`https://api.changenow.io/v1/min-amount/btc_kas?api_key=${apiKey}`)

      const data = await response.json()

      if (response.ok) {
        setTestResult(JSON.stringify(data, null, 2))
      } else {
        setError(`API Error: ${data.message || "Unknown error"}`)
      }
    } catch (err: any) {
      setError(`Connection Error: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="bg-gray-100 p-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-gray-700">
          <Bug className="h-4 w-4" />
          <span className="font-medium">Debug Tools</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>

      {isOpen && (
        <div className="p-3 space-y-3">
          <div className="text-sm">
            <p>
              <strong>API Key Status:</strong> {apiKey ? "Configured" : "Not Configured"}
            </p>
            {apiKey && (
              <p>
                <strong>API Key:</strong> {apiKey.substring(0, 6)}...{apiKey.substring(apiKey.length - 4)}
              </p>
            )}
          </div>

          <Button size="sm" variant="outline" onClick={testApiConnection} disabled={isLoading}>
            {isLoading ? "Testing..." : "Test API Connection"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {testResult && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">API Response:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">{testResult}</pre>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-2">
            <p>If you're experiencing issues with the exchange functionality:</p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Verify your API key is correct</li>
              <li>Check that the ChangeNOW API is operational</li>
              <li>Ensure your browser allows the API requests</li>
              <li>Try with different cryptocurrency pairs</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

