"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Pause, Play, Maximize2, Minimize2 } from "lucide-react"

interface Block {
  id: string
  x: number
  y: number
  parents: string[]
  color: string
  size: number
  age: number
}

export function BlockDagVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const blocksRef = useRef<Block[]>([])
  const animationRef = useRef<number>(0)
  const lastBlockTimeRef = useRef<number>(Date.now())

  // Colors for different block types
  const blockColors = [
    "rgba(20, 184, 166, 0.8)", // teal-500
    "rgba(6, 182, 212, 0.8)", // cyan-500
    "rgba(14, 165, 233, 0.8)", // sky-500
    "rgba(59, 130, 246, 0.8)", // blue-500
  ]

  // Initialize the visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = isExpanded ? 300 : 150
    }

    // Initial resize
    resizeCanvas()

    // Add window resize listener
    window.addEventListener("resize", resizeCanvas)

    // Generate initial blocks
    generateInitialBlocks()

    // Start animation
    startAnimation()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isExpanded])

  // Generate initial blocks
  const generateInitialBlocks = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const blocks: Block[] = []
    const width = canvas.width
    const height = canvas.height

    // Create genesis block
    const genesisBlock: Block = {
      id: "0",
      x: 50,
      y: height / 2,
      parents: [],
      color: blockColors[0],
      size: 8,
      age: 0,
    }
    blocks.push(genesisBlock)

    // Create some initial blocks
    for (let i = 1; i < 20; i++) {
      const parentIndices: number[] = []
      // Each block references 1-3 parents
      const numParents = Math.floor(Math.random() * 3) + 1
      for (let j = 0; j < numParents; j++) {
        // Can only reference blocks that came before
        const parentIndex = Math.floor(Math.random() * i)
        if (!parentIndices.includes(parentIndex)) {
          parentIndices.push(parentIndex)
        }
      }

      const block: Block = {
        id: i.toString(),
        x: 50 + i * 30,
        y: height / 2 + (Math.random() * 60 - 30),
        parents: parentIndices.map((index) => blocks[index].id),
        color: blockColors[Math.floor(Math.random() * blockColors.length)],
        size: 6 + Math.random() * 4,
        age: 0,
      }
      blocks.push(block)
    }

    blocksRef.current = blocks
  }

  // Add a new block to the DAG
  const addNewBlock = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const blocks = blocksRef.current
    if (blocks.length === 0) return

    const width = canvas.width
    const height = canvas.height

    // Select 1-3 random parents from the last 10 blocks
    const numParents = Math.floor(Math.random() * 3) + 1
    const parentIndices = new Set<number>()

    const startIdx = Math.max(0, blocks.length - 10)
    while (parentIndices.size < numParents) {
      const idx = startIdx + Math.floor(Math.random() * (blocks.length - startIdx))
      parentIndices.add(idx)
    }

    // Create new block
    const newBlock: Block = {
      id: blocks.length.toString(),
      x: width - 50,
      y: height / 2 + (Math.random() * 60 - 30),
      parents: Array.from(parentIndices).map((idx) => blocks[idx].id),
      color: blockColors[Math.floor(Math.random() * blockColors.length)],
      size: 6 + Math.random() * 4,
      age: 0,
    }

    // Add to blocks array
    blocks.push(newBlock)

    // Remove old blocks that have moved off screen
    while (blocks.length > 100 && blocks[0].x < -50) {
      blocks.shift()
    }
  }

  // Animation loop
  const startAnimation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      if (!isPaused) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Add new blocks occasionally
        const now = Date.now()
        if (now - lastBlockTimeRef.current > 500) {
          addNewBlock()
          lastBlockTimeRef.current = now
        }

        // Move blocks to the left
        const blocks = blocksRef.current
        blocks.forEach((block) => {
          block.x -= 0.5
          block.age += 0.01
        })

        // Draw connections first (so they appear behind blocks)
        ctx.lineWidth = 1
        blocks.forEach((block) => {
          block.parents.forEach((parentId) => {
            const parent = blocks.find((b) => b.id === parentId)
            if (parent) {
              ctx.beginPath()
              ctx.moveTo(block.x, block.y)
              ctx.lineTo(parent.x, parent.y)
              ctx.strokeStyle = `rgba(20, 184, 166, ${Math.max(0, 0.3 - block.age * 0.05)})`
              ctx.stroke()
            }
          })
        })

        // Draw blocks
        blocks.forEach((block) => {
          ctx.beginPath()
          ctx.arc(block.x, block.y, block.size, 0, Math.PI * 2)
          ctx.fillStyle = block.color
          ctx.fill()
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
  }

  return (
    <div className="w-full max-w-md mx-auto mb-4">
      <div
        className={`relative overflow-hidden rounded-xl shadow-lg border border-teal-200 dark:border-gray-600 bg-teal-50 dark:bg-gray-700 transition-all duration-300 ${isExpanded ? "h-[300px]" : "h-[150px]"}`}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-2 right-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        <div className="absolute top-2 left-2 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded text-xs font-medium text-teal-800 dark:text-teal-300">
          Kaspa BlockDAG Visualizer
        </div>
      </div>
    </div>
  )
}

