"use client"

import { Button } from "@/components/ui/button"
import { ArrowUpRight, Smartphone, Bot, Shield, CreditCard } from "lucide-react"

export function KaspaWallets() {
  return (
    <div className="space-y-6">
      <div className="bg-teal-50 border border-teal-100 rounded-md p-4">
        <h3 className="font-medium text-teal-800 mb-2">Choose Your Kaspa Wallet</h3>
        <p className="text-sm text-teal-700 mb-4">
          Kaspa offers several wallet options to securely store and manage your KAS tokens. Select the wallet that best
          fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Kasware Wallet */}
        <a href="https://www.kasware.xyz/" target="_blank" rel="noopener noreferrer" className="block">
          <Button
            variant="outline"
            className="w-full h-auto py-4 px-4 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-teal-600" />
              </div>
              <span className="font-medium text-teal-800 mb-1">Kasware Wallet</span>
              <span className="text-xs text-teal-600 mb-2">Browser Extension</span>
              <div className="flex items-center text-xs text-teal-500">
                <span>Visit Official Site</span>
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </Button>
        </a>

        {/* KSPR Bot */}
        <a href="https://kspr-bot.xyz/" target="_blank" rel="noopener noreferrer" className="block">
          <Button
            variant="outline"
            className="w-full h-auto py-4 px-4 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                <Bot className="h-6 w-6 text-teal-600" />
              </div>
              <span className="font-medium text-teal-800 mb-1">KSPR Bot</span>
              <span className="text-xs text-teal-600 mb-2">Telegram Bot Wallet</span>
              <div className="flex items-center text-xs text-teal-500">
                <span>Visit Official Site</span>
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </Button>
        </a>

        {/* Kaspium Wallet */}
        <a href="https://kaspium.io/" target="_blank" rel="noopener noreferrer" className="block">
          <Button
            variant="outline"
            className="w-full h-auto py-4 px-4 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                <Smartphone className="h-6 w-6 text-teal-600" />
              </div>
              <span className="font-medium text-teal-800 mb-1">Kaspium Wallet</span>
              <span className="text-xs text-teal-600 mb-2">Mobile App</span>
              <div className="flex items-center text-xs text-teal-500">
                <span>Visit Official Site</span>
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </Button>
        </a>

        {/* Tangem Wallet */}
        <a href="https://tangem.com/en/" target="_blank" rel="noopener noreferrer" className="block">
          <Button
            variant="outline"
            className="w-full h-auto py-4 px-4 border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                <CreditCard className="h-6 w-6 text-teal-600" />
              </div>
              <span className="font-medium text-teal-800 mb-1">Tangem Wallet</span>
              <span className="text-xs text-teal-600 mb-2">Hardware Wallet</span>
              <div className="flex items-center text-xs text-teal-500">
                <span>Visit Official Site</span>
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </Button>
        </a>
      </div>

      <div className="bg-teal-50 border border-teal-100 rounded-md p-4 mt-6">
        <h3 className="font-medium text-teal-800 mb-2">About Kaspa Wallets</h3>
        <div className="space-y-3 text-sm text-teal-700">
          <p>
            Kaspa wallets allow you to securely store, send, and receive KAS tokens. Each wallet type offers different
            features and security levels:
          </p>

          <div className="space-y-2">
            <div>
              <p className="font-medium">Kasware Wallet</p>
              <p className="text-xs">
                A browser extension wallet for Chrome and Firefox. Ideal for desktop users who frequently interact with
                Kaspa dApps and websites.
              </p>
            </div>

            <div>
              <p className="font-medium">KSPR Bot</p>
              <p className="text-xs">
                A Telegram-based wallet that allows you to manage Kaspa tokens and NFTs directly through chat commands.
                Great for mobile users who prefer messaging apps.
              </p>
            </div>

            <div>
              <p className="font-medium">Kaspium Wallet</p>
              <p className="text-xs">
                A dedicated mobile app wallet for iOS and Android with advanced features like staking, NFT support, and
                multi-account management.
              </p>
            </div>

            <div>
              <p className="font-medium">Tangem Wallet</p>
              <p className="text-xs">
                A hardware wallet solution that stores your private keys on a physical card with NFC capabilities,
                offering the highest level of security for long-term storage.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-2">
            <p className="text-xs text-amber-700">
              <strong>Important:</strong> When clicking on any wallet option, you will be directed to the official
              website of that wallet provider. Always verify you are on the correct website before downloading any
              wallet software to protect yourself from scams.
            </p>
          </div>

          <p>
            For the best security practices, never share your private keys or recovery phrases with anyone, and always
            back up your wallet information in a secure location.
          </p>
        </div>
      </div>
    </div>
  )
}

