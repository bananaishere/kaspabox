"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Copy, ExternalLink, Info } from "lucide-react"
import Link from "next/link"

export function ApiKeySetup() {
  const [apiKey, setApiKey] = useState("")
  const [copied, setCopied] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 p-4 border border-teal-200 rounded-lg bg-teal-50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-teal-800">ChangeNOW API Setup</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-teal-600 hover:text-teal-800"
        >
          {showInstructions ? "Hide" : "Show"} Instructions
        </Button>
      </div>

      {showInstructions && (
        <div className="space-y-3">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Environment Variable Required</AlertTitle>
            <AlertDescription className="text-blue-700">
              To enable cryptocurrency swaps, you need to add a ChangeNOW API key as an environment variable.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium text-teal-700">Step 1: Get an API Key</h4>
            <p className="text-sm text-teal-600">Visit ChangeNOW to create an account and get your API key:</p>
            <Link
              href="https://changenow.io/api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-teal-700 hover:text-teal-900"
            >
              <ExternalLink className="h-4 w-4" />
              ChangeNOW API Registration
            </Link>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-teal-700">Step 2: Add to Your Project</h4>
            <p className="text-sm text-teal-600">Add the API key to your project as an environment variable:</p>

            <div className="bg-gray-800 text-white p-3 rounded-md text-sm font-mono relative">
              <div>NEXT_PUBLIC_CHANGENOW_API_KEY=your_api_key_here</div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 text-gray-400 hover:text-white"
                onClick={() => copyToClipboard("NEXT_PUBLIC_CHANGENOW_API_KEY=your_api_key_here")}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="space-y-1 text-sm text-teal-600">
              <p>Add this to your:</p>
              <ul className="list-disc list-inside">
                <li>
                  Local development: <span className="font-mono">.env.local</span> file
                </li>
                <li>Vercel deployment: Environment Variables section in project settings</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-teal-700">Step 3: Restart Your Development Server</h4>
            <p className="text-sm text-teal-600">
              After adding the environment variable, restart your development server for the changes to take effect.
            </p>
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-teal-200">
        <Label htmlFor="apiKey" className="text-sm font-medium text-teal-700">
          Enter your ChangeNOW API Key
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Your ChangeNOW API Key"
            className="border-teal-200 focus-visible:ring-teal-500"
          />
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white"
            disabled={!apiKey}
            onClick={() => {
              alert(
                "In a real application, this would save the API key to your environment variables or secure storage. For security reasons, you should manually add it to your .env.local file or Vercel environment variables.",
              )
            }}
          >
            Save
          </Button>
        </div>
        <p className="text-xs text-teal-600 mt-1">
          Note: This is for demonstration purposes. In a real application, you should never input API keys directly in
          the browser.
        </p>
      </div>
    </div>
  )
}

