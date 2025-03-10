"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface TransactionDetailsProps {
  txHash: string
  label: string
  timestamp?: string
  amount?: string
  currency?: string
}

export function TransactionDetails({ txHash, label, timestamp, amount, currency }: TransactionDetailsProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const viewOnExplorer = () => {
    window.open(`https://explorer.kaspa.org/txs/${txHash}`, "_blank")
  }

  return (
    <div className="bg-teal-50 border border-teal-100 rounded-md p-3 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium text-teal-700">{label}</h4>
          {timestamp && <p className="text-xs text-teal-600">{timestamp}</p>}
          {amount && (
            <p className="text-xs font-medium text-teal-800">
              {amount} {currency || "KAS"}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-teal-600" onClick={copyToClipboard}>
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-teal-600" onClick={viewOnExplorer}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-xs font-mono text-teal-700 mt-1 truncate">{txHash}</p>
    </div>
  )
}

