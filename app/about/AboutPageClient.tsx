"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AboutPageClient() {
  return (
    <div className="min-h-screen bg-teal-500 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <header className="mb-6 md:mb-8 flex justify-between items-center">
          <Link href="/" className="inline-flex items-center text-white hover:text-teal-100">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
          <ThemeToggle />
        </header>

        <main>
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-300">
            <div className="relative w-full h-[150px] sm:h-[200px] md:h-[300px]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Banner%20BananaBOX-iW4EwTFWXwu1jmerzRBuNvpfoqIcJF.png"
                alt="BananaBOX Banner"
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="p-4 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-teal-800 dark:text-teal-300 mb-4 md:mb-6">
                About ꓘaspaBOX
              </h1>

              <div className="prose prose-teal dark:prose-invert max-w-none">
                <p className="text-base md:text-lg mb-4 dark:text-gray-300">
                  ꓘaspaBOX is a comprehensive platform designed to make interacting with Kaspa tokens easy, secure, and
                  versatile. It allows anyone to swap cryptocurrencies to Kaspa, trade NFTs securely with our trusted
                  middleman service, and access information about various Kaspa wallet options.
                </p>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 dark:text-teal-300 mt-5 md:mt-6 mb-2 md:mb-3">
                  Project Goals
                </h2>
                <p className="dark:text-gray-300">
                  The main goal of ꓘaspaBOX is to provide essential tools for Kaspa users. Whether you want to swap
                  other cryptocurrencies for Kaspa, trade NFTs securely with other users, or learn about different Kaspa
                  wallet options, ꓘaspaBOX provides intuitive interfaces that make transactions quick and hassle-free.
                </p>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 dark:text-teal-300 mt-5 md:mt-6 mb-2 md:mb-3">
                  Cryptocurrency Swap
                </h2>
                <p className="dark:text-gray-300">
                  ꓘaspaBOX includes a cryptocurrency swap feature that allows you to exchange other cryptocurrencies for
                  Kaspa. This feature is powered by ChangeNOW, a reliable cryptocurrency exchange service.
                </p>
                <p className="mt-2 dark:text-gray-300">With the swap feature, you can:</p>
                <ul className="list-disc pl-5 space-y-1 md:space-y-2 mt-2 dark:text-gray-300">
                  <li>Exchange popular cryptocurrencies like Bitcoin, Ethereum, and USDT for Kaspa</li>
                  <li>Get real-time exchange rates</li>
                  <li>Track your exchange transactions</li>
                  <li>Receive Kaspa directly to your wallet address</li>
                </ul>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 dark:text-teal-300 mt-5 md:mt-6 mb-2 md:mb-3">
                  NFT Middleman Service - New & Improved
                </h2>
                <p className="dark:text-gray-300">
                  Our NFT Middleman service provides a secure way to trade NFTs for Kaspa tokens or other NFTs without
                  having to trust the other party. It acts as an escrow service, ensuring both parties fulfill their
                  part of the deal.
                </p>
                <div className="bg-teal-50 dark:bg-gray-700 p-4 rounded-md border border-teal-100 dark:border-gray-600 my-3">
                  <h3 className="font-medium text-teal-700 dark:text-teal-300 mb-2">New Features:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-teal-700 dark:text-gray-300">
                    <li>
                      <strong>NFT-to-NFT Exchange</strong> - Now supporting direct NFT-to-NFT trades without requiring
                      KAS tokens
                    </li>
                    <li>
                      <strong>Kaspa NFT Marketplace Integration</strong> - Direct integration with the Kaspa NFT
                      marketplace for NFT images and metadata
                    </li>
                    <li>
                      <strong>Improved Deal Sharing</strong> - Easily share deal IDs and links with the other party
                    </li>
                    <li>
                      <strong>Enhanced User Experience</strong> - Clearer instructions and improved workflow for both
                      parties
                    </li>
                    <li>
                      <strong>Real Transaction Support</strong> - Designed for real NFT transactions on the Kaspa
                      blockchain
                    </li>
                  </ul>
                </div>
                <p className="mt-2 dark:text-gray-300">How the NFT Middleman works:</p>
                <ol className="list-decimal pl-5 space-y-1 md:space-y-2 mt-2 dark:text-gray-300">
                  <li>Buyer and seller agree on terms and create a deal (now supporting NFT-to-NFT exchanges)</li>
                  <li>The deal creator shares the unique deal ID with the other party</li>
                  <li>Both parties send their assets (NFTs or KAS) to the middleman wallet</li>
                  <li>Once both are received, the middleman automatically completes the exchange</li>
                  <li>The assets are sent to their respective new owners</li>
                </ol>
                <p className="mt-2 dark:text-gray-300">
                  This service eliminates the risk of scams and ensures a fair exchange for both parties. The middleman
                  wallet address is transparent and all transactions can be verified on the blockchain.
                </p>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 dark:text-teal-300 mt-5 md:mt-6 mb-2 md:mb-3">
                  Kaspa Wallets - New Section
                </h2>
                <p className="dark:text-gray-300">
                  Our new Kaspa Wallets section provides comprehensive information about various wallet options for
                  storing and managing your Kaspa tokens. This section helps users make informed decisions about which
                  wallet best suits their needs.
                </p>
                <p className="mt-2 dark:text-gray-300">Featured wallets include:</p>
                <ul className="list-disc pl-5 space-y-1 md:space-y-2 mt-2 dark:text-gray-300">
                  <li>
                    <strong>Kasware Wallet</strong> - A browser extension wallet for desktop users
                  </li>
                  <li>
                    <strong>KSPR Bot</strong> - A Telegram-based wallet for managing Kaspa tokens and NFTs
                  </li>
                  <li>
                    <strong>Kaspium Wallet</strong> - A dedicated mobile app wallet for iOS and Android
                  </li>
                  <li>
                    <strong>Tangem Wallet</strong> - A hardware wallet solution for maximum security
                  </li>
                </ul>
                <p className="mt-2 dark:text-gray-300">
                  Each wallet option includes detailed information about its features, security aspects, and links to
                  official websites, helping users choose the right wallet for their needs.
                </p>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 dark:text-teal-300 mt-5 md:mt-6 mb-2 md:mb-3">
                  Features
                </h2>
                <ul className="list-disc pl-5 space-y-1 md:space-y-2 dark:text-gray-300">
                  <li>Simple and intuitive user interface</li>
                  <li>Secure transaction processing</li>
                  <li>Cryptocurrency swap functionality</li>
                  <li>NFT trading with escrow protection</li>
                  <li>NFT-to-NFT exchange capability</li>
                  <li>Kaspa NFT marketplace integration</li>
                  <li>Deal sharing between parties</li>
                  <li>Comprehensive Kaspa wallet information</li>
                  <li>Kaspa blockchain visualization</li>
                  <li>Mobile-friendly design</li>
                </ul>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 dark:text-teal-300 mt-5 md:mt-6 mb-2 md:mb-3">
                  About Kaspa
                </h2>
                <p className="dark:text-gray-300">
                  Kaspa is a proof-of-work cryptocurrency that implements the GHOSTDAG protocol, a generalization of the
                  Nakamoto consensus. It's designed to be fast, secure, and scalable, with block times of just 1 second.
                </p>
                <p className="mt-2 dark:text-gray-300">
                  To learn more about Kaspa, visit the{" "}
                  <a
                    href="https://kaspa.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800 underline dark:text-teal-300"
                  >
                    official Kaspa website
                  </a>
                  .
                </p>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 dark:text-teal-300 mt-5 md:mt-6 mb-2 md:mb-3">
                  Contact & Support
                </h2>
                <p className="dark:text-gray-300">
                  If you have any questions, suggestions, or need help with ꓘaspaBOX, feel free to reach out through the
                  following channels:
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <a
                    href="https://t.me/hereisbanana"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 bg-teal-600 text-white px-3 py-1.5 rounded-md hover:bg-teal-700 transition-colors text-sm no-underline"
                  >
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/telegram%20white-C8yXyan2zlbDkWPwhaMyHKXyXgXx5q.png"
                      alt="Telegram"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                    <span className="font-medium">Telegram Support</span>
                  </a>
                  <a
                    href="https://discord.gg/DRjDD7nAfP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 bg-teal-600 text-white px-3 py-1.5 rounded-md hover:bg-teal-700 transition-colors text-sm no-underline"
                  >
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/discord-QGFD4SxAtVSX7U8496UN894OFj2bXV.png"
                      alt="Discord"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                    <span className="font-medium">Discord Community</span>
                  </a>
                </div>

                <h2 className="text-lg md:text-xl font-semibold text-teal-700 dark:text-teal-300 mt-5 md:mt-6 mb-2 md:mb-3">
                  Disclaimer
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ꓘaspaBOX is an independent project and is not officially affiliated with Kaspa. Always verify
                  transaction details before sending funds. The developer is not responsible for any loss of funds due
                  to user error or technical issues beyond our control.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-8 md:mt-12 text-center">
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

