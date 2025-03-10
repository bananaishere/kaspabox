import type { WebSite, WithContext, SoftwareApplication } from "schema-dts"

export function JsonLd() {
  const websiteSchema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ꓘaspaBOX",
    url: "https://kaspabox.vercel.app/",
    description:
      "A comprehensive platform for sending Kaspa tokens, swapping cryptocurrencies, trading NFTs securely, and accessing various Kaspa wallet options. Now with NFT-to-NFT exchange and improved wallet integration.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://kaspabox.vercel.app/search?q={search_term_string}",
      },
    },
  }

  const applicationSchema: WithContext<SoftwareApplication> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ꓘaspaBOX",
    applicationCategory: "FinanceApplication, BlockchainApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Swap cryptocurrencies to Kaspa",
      "Trade NFTs securely with escrow protection",
      "NFT-to-NFT exchange functionality",
      "Kaspa NFT marketplace integration",
      "Direct deal sharing between parties",
      "Real-time transaction verification",
      "Kaspa wallet options and information",
      "Kaspa blockchain visualization",
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }} />
    </>
  )
}

