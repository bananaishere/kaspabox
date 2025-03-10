"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Loader2, Search } from "lucide-react"

// Types
export interface NFT {
  id: string
  name: string
  collectionName: string
  contractAddress: string
  description?: string
  image: string
  ownerAddress: string
  attributes?: {
    trait_type: string
    value: string | number
  }[]
}

interface NFTBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelectNFT: (nft: NFT) => void
  excludeIds?: string[]
}

// Mock NFT collections and data (in a real implementation, this would come from an API)
const MOCK_COLLECTIONS = [
  {
    name: "Kaspa Dragons",
    contractAddress: "kaspa:qz0k2kj6rl8nt9xzm7tuf2l0ujd6axm6rsjzfrnldnrjhs8ywjpxcvqvl9t5j",
    totalSupply: 100,
  },
  {
    name: "Kaspa Punks",
    contractAddress: "kaspa:qr3f5xptk8qgtkqan5gqkg95alem9lrt5u4kndq2xuz6qa7qha2rmgnshdaxl",
    totalSupply: 200,
  },
  {
    name: "Kaspa Knights",
    contractAddress: "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj",
    totalSupply: 50,
  },
]

export function NFTBrowser({ isOpen, onClose, onSelectNFT, excludeIds = [] }: NFTBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [nfts, setNfts] = useState<NFT[]>([])

  // Generate mock NFTs for a collection
  const generateMockNFTs = (collectionName: string, contractAddress: string, count: number) => {
    const results: NFT[] = []
    for (let i = 1; i <= count; i++) {
      // Skip if the NFT ID is in the exclude list
      if (excludeIds.includes(`${contractAddress}-${i}`)) continue

      results.push({
        id: `${contractAddress}-${i}`,
        name: `${collectionName} #${i}`,
        collectionName,
        contractAddress,
        description: `A unique ${collectionName} NFT on the Kaspa blockchain`,
        image: `https://picsum.photos/seed/${contractAddress}-${i}/300/300`, // Random image based on ID
        ownerAddress: "kaspa:qrp2dp5xcd39zrfw73uu0mfhdcz0en0cllswcazazff0r4kslhl3cc5gwcjkj",
        attributes: [
          { trait_type: "Rarity", value: Math.random() > 0.8 ? "Rare" : Math.random() > 0.5 ? "Uncommon" : "Common" },
          { trait_type: "Level", value: Math.floor(Math.random() * 10) + 1 },
        ],
      })
    }
    return results
  }

  // Load all NFTs from all collections
  const loadAllNFTs = () => {
    setLoading(true)
    const allNfts: NFT[] = []
    MOCK_COLLECTIONS.forEach((collection) => {
      // Generate 5 NFTs per collection for the browser view
      const collectionNfts = generateMockNFTs(collection.name, collection.contractAddress, 5)
      allNfts.push(...collectionNfts)
    })
    setNfts(allNfts)
    setLoading(false)
  }

  // Load NFTs from a specific collection
  const loadCollectionNFTs = (contractAddress: string) => {
    setLoading(true)
    const collection = MOCK_COLLECTIONS.find((c) => c.contractAddress === contractAddress)
    if (collection) {
      // Generate 10 NFTs for the specific collection view
      const collectionNfts = generateMockNFTs(collection.name, contractAddress, 10)
      setNfts(collectionNfts)
    } else {
      setNfts([])
    }
    setLoading(false)
  }

  // Handle collection selection
  const handleCollectionSelect = (contractAddress: string | null) => {
    setSelectedCollection(contractAddress)
    if (contractAddress) {
      loadCollectionNFTs(contractAddress)
    } else {
      loadAllNFTs()
    }
  }

  // Search NFTs
  const handleSearch = () => {
    setLoading(true)

    // In a real implementation, this would call an API with the search query
    // For now, we'll just filter the mock data
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      const filtered = nfts.filter(
        (nft) =>
          nft.name.toLowerCase().includes(lowerQuery) ||
          nft.description?.toLowerCase().includes(lowerQuery) ||
          nft.id.toLowerCase().includes(lowerQuery),
      )
      setNfts(filtered)
    } else {
      // If search query is empty, reload the current view
      if (selectedCollection) {
        loadCollectionNFTs(selectedCollection)
      } else {
        loadAllNFTs()
      }
    }

    setLoading(false)
  }

  // Load initial NFTs when the component mounts or dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAllNFTs()
    }
  }, [isOpen])

  // Filtered NFTs based on search
  const filteredNFTs = searchQuery.trim()
    ? nfts.filter(
        (nft) =>
          nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nft.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : nfts

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Browse Kaspa NFTs</DialogTitle>
          <DialogDescription>Select an NFT from available collections on the Kaspa blockchain</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search NFTs..."
                  className="pl-8"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Button variant="outline" onClick={handleSearch} disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {/* Collection filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCollection === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleCollectionSelect(null)}
              className="text-xs"
            >
              All Collections
            </Button>
            {MOCK_COLLECTIONS.map((collection) => (
              <Button
                key={collection.contractAddress}
                variant={selectedCollection === collection.contractAddress ? "default" : "outline"}
                size="sm"
                onClick={() => handleCollectionSelect(collection.contractAddress)}
                className="text-xs"
              >
                {collection.name}
              </Button>
            ))}
          </div>

          {/* NFT Grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : filteredNFTs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onSelectNFT(nft)}
                >
                  <div className="relative h-40 w-full">
                    <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-800 truncate">{nft.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{nft.collectionName}</p>
                    {nft.attributes && nft.attributes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {nft.attributes.map((attr, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded truncate max-w-full"
                          >
                            {attr.trait_type}: {attr.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No NFTs found matching your search.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

