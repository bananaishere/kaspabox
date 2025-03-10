"use client"

import { CryptoSwap } from "@/components/crypto-swap"
import { ApiKeySetup } from "@/components/api-key-setup"
import { PriceTicker } from "@/components/price-ticker"
import { NFTMiddleman } from "@/components/nft-middleman"
import { BlockDagVisualizer } from "@/components/block-dag-visualizer"
import { KaspaWallets } from "@/components/kaspa-wallets"
import { FiatPurchase } from "@/components/fiat-purchase"
import { ArrowUpRight, Info, Menu, X, Repeat, Shield, Wallet, CreditCard } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { DebugPanel } from "@/components/debug-panel"
import { ThemeToggle } from "@/components/theme-toggle"

type ActiveTab = "swap" | "nft" | "wallets" | "buy"

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    // Check if we're in the browser and have URL params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("tab") === "buy") {
        return "buy"
      }
    }
    return "swap" // Default to swap
  })
  const hasApiKey = !!process.env.NEXT_PUBLIC_CHANGENOW_API_KEY

  return (
    <div className="min-h-screen bg-teal-500 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Desktop Header */}
        <header className="mb-4 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white dark:bg-gray-800 p-1.5">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-color-a6gTLOtFUkyTfto7nuemX26goOL0VS.png"
                alt="Kaspa Logo"
                width={24}
                height={24}
                className="h-6 w-6"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">ꓘaspaBOX</h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Header */}
        <header className="mb-4 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white dark:bg-gray-800 p-1.5">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-color-a6gTLOtFUkyTfto7nuemX26goOL0VS.png"
                  alt="Kaspa Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                  priority
                />
              </div>
              <h1 className="text-xl font-bold text-white">ꓘaspaBOX</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="bg-teal-600 dark:bg-gray-800 rounded-lg mt-2 p-4 shadow-lg">
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/about"
                  className="text-white hover:text-teal-100 flex items-center gap-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Info className="h-5 w-5" />
                  About
                </Link>
                <Link
                  href="https://kaspa.org"
                  target="_blank"
                  className="text-white hover:text-teal-100 flex items-center gap-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ArrowUpRight className="h-5 w-5" />
                  About Kaspa
                </Link>
              </nav>
            </div>
          )}
        </header>

        <main className="flex justify-center">
          <div className="w-full max-w-md">
            {/* BlockDAG Visualizer */}
            <BlockDagVisualizer />

            {/* Price Ticker */}
            <PriceTicker />

            <div className="rounded-xl bg-white dark:bg-gray-800 p-4 md:p-7 shadow-lg transition-colors duration-300">
              {/* Tab Navigation - Updated with smaller teal buttons */}
              <div className="flex justify-center gap-1 mb-6">
                <button
                  className={`flex items-center gap-1 px-2 py-1.5 text-sm font-medium rounded-md ${
                    activeTab === "swap"
                      ? "bg-teal-600 text-white dark:bg-teal-600"
                      : "bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setActiveTab("swap")}
                >
                  <Repeat className="h-4 w-4" />
                  Swap to Kaspa
                </button>
                <button
                  className={`flex items-center gap-1 px-2 py-1.5 text-sm font-medium rounded-md ${
                    activeTab === "buy"
                      ? "bg-teal-600 text-white dark:bg-teal-600"
                      : "bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setActiveTab("buy")}
                >
                  <CreditCard className="h-4 w-4" />
                  Buy with Fiat
                </button>
                <button
                  className={`flex items-center gap-1 px-2 py-1.5 text-sm font-medium rounded-md ${
                    activeTab === "nft"
                      ? "bg-teal-600 text-white dark:bg-teal-600"
                      : "bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setActiveTab("nft")}
                >
                  <Shield className="h-4 w-4" />
                  NFT Middleman
                </button>
                <button
                  className={`flex items-center gap-1 px-2 py-1.5 text-sm font-medium rounded-md ${
                    activeTab === "wallets"
                      ? "bg-teal-600 text-white dark:bg-teal-600"
                      : "bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setActiveTab("wallets")}
                >
                  <Wallet className="h-4 w-4" />
                  Kaspa Wallets
                </button>
              </div>

              {/* Tab Content - Updated for cleaner UI */}
              {activeTab === "swap" ? (
                <>
                  <h2 className="mb-5 text-xl font-bold text-teal-800 dark:text-teal-300">Swap to Kaspa</h2>
                  {!hasApiKey ? <ApiKeySetup /> : null}
                  <CryptoSwap />
                  {process.env.NODE_ENV === "development" && (
                    <DebugPanel apiKey={process.env.NEXT_PUBLIC_CHANGENOW_API_KEY} />
                  )}
                </>
              ) : activeTab === "buy" ? (
                <>
                  <h2 className="mb-5 text-xl font-bold text-teal-800 dark:text-teal-300">Buy with Fiat</h2>
                  {!hasApiKey ? <ApiKeySetup /> : null}
                  <FiatPurchase />
                </>
              ) : activeTab === "nft" ? (
                <>
                  <h2 className="mb-5 text-xl font-bold text-teal-800 dark:text-teal-300">NFT Middleman Service</h2>
                  <NFTMiddleman />
                </>
              ) : activeTab === "wallets" ? (
                <>
                  <h2 className="mb-5 text-xl font-bold text-teal-800 dark:text-teal-300">Kaspa Wallets</h2>
                  <KaspaWallets />
                </>
              ) : null}
            </div>
          </div>
        </main>

        <footer className="mt-8 md:mt-12 text-center">
          <div className="flex justify-center space-x-4 mb-4">
            <a
              href="https://t.me/hereisbanana"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-600 dark:bg-teal-800 p-2 rounded-full hover:bg-teal-700 dark:hover:bg-teal-700 transition-colors"
              aria-label="Telegram Support"
            >
              <div className="h-6 w-6 flex items-center justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/telegram%20white-C8yXyan2zlbDkWPwhaMyHKXyXgXx5q.png"
                  alt="Telegram"
                  width={24}
                  height={24}
                  className="h-5 w-5"
                />
              </div>
            </a>
            <a
              href="https://discord.gg/DRjDD7nAfP"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-600 dark:bg-teal-800 p-2 rounded-full hover:bg-teal-700 dark:hover:bg-teal-700 transition-colors"
              aria-label="Discord Community"
            >
              <div className="h-6 w-6 flex items-center justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/discord-QGFD4SxAtVSX7U8496UN894OFj2bXV.png"
                  alt="Discord"
                  width={24}
                  height={24}
                  className="h-5 w-5"
                />
              </div>
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Link
              href="/about"
              className="flex items-center gap-1 rounded-full bg-teal-600 dark:bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-700"
            >
              <Info className="h-4 w-4" />
              <span>About</span>
            </Link>
            <Link
              href="https://kaspa.org"
              target="_blank"
              className="flex items-center gap-1 rounded-full bg-teal-600 dark:bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-700"
            >
              About Kaspa
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/banana%20logo%20to%20website-EKlariaE9N664fICR1mw5MCGe7oO30.png"
              alt="Banana Logo"
              width={60}
              height={60}
              className="mb-2"
            />
            <p className="text-sm text-teal-100 dark:text-gray-300">
              © {new Date().getFullYear()} ꓘaspaBOX. All rights reserved.
            </p>
            <p className="text-sm text-teal-100 dark:text-gray-300 mt-1">Ⓑⓐⓝⓐⓝⓐ is Here!</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

