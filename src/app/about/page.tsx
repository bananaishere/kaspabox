import type { Metadata } from "next"
import AboutPageClient from "./AboutPageClient"

export const metadata: Metadata = {
  title: "About ꓘaspaBOX",
  description:
    "Learn more about ꓘaspaBOX, a comprehensive platform for swapping cryptocurrencies to Kaspa, trading NFTs with our improved middleman service, and accessing various Kaspa wallet options.",
}

export default function AboutPage() {
  return <AboutPageClient />
}

