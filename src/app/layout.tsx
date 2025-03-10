import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { JsonLd } from "@/components/json-ld"
import { ThemeProvider } from "@/lib/themes"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "ꓘaspaBOX - Swap to Kaspa, Trade NFTs, and Manage Kaspa Wallets",
    template: "%s | ꓘaspaBOX",
  },
  description:
    "A comprehensive platform for sending Kaspa tokens, swapping cryptocurrencies, trading NFTs securely, and accessing various Kaspa wallet options. Now with NFT-to-NFT exchange and improved wallet integration.",
  keywords: [
    "Kaspa",
    "KAS",
    "cryptocurrency",
    "blockchain",
    "token",
    "swap",
    "exchange",
    "NFT",
    "NFT trading",
    "escrow",
    "middleman",
    "NFT marketplace",
    "Kaspa NFT",
    "Kaspa wallets",
    "Kasware",
    "KSPR Bot",
    "Kaspium",
    "Tangem",
    "NFT-to-NFT exchange",
  ],
  authors: [{ name: "BananaBOX", url: "https://github.com/bananaishere" }],
  creator: "BananaBOX",
  publisher: "BananaBOX",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kaspabox.vercel.app/",
    title: "ꓘaspaBOX - Swap to Kaspa, Trade NFTs, and Manage Kaspa Wallets",
    description:
      "A comprehensive platform for sending Kaspa tokens, swapping cryptocurrencies, trading NFTs securely, and accessing various Kaspa wallet options. Now with NFT-to-NFT exchange and improved wallet integration.",
    siteName: "ꓘaspaBOX",
    images: [
      {
        url: "https://kaspabox.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "ꓘaspaBOX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ꓘaspaBOX - Swap to Kaspa, Trade NFTs, and Manage Kaspa Wallets",
    description:
      "A comprehensive platform for sending Kaspa tokens, swapping cryptocurrencies, trading NFTs securely, and accessing various Kaspa wallet options. Now with NFT-to-NFT exchange and improved wallet integration.",
    images: ["https://kaspabox.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <JsonLd />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

