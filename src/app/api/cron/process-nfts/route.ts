import { type NextRequest, NextResponse } from "next/server"
import { processIncomingNfts } from "@/app/actions/middleman-actions"

export async function GET(request: NextRequest) {
  try {
    // Verify the cron secret to ensure this is called by the cron job
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    try {
      const result = await processIncomingNfts()

      return NextResponse.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Cron job error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to process NFTs",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Cron route error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

