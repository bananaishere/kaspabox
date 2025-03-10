import { getPendingTransfers, completeNftTransfer } from "@/app/actions/middleman-actions"
import { getMiddlemanAddress } from "@/lib/kaspa-utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function TransfersPage() {
  const pendingTransfers = await getPendingTransfers()
  const middlemanAddress = getMiddlemanAddress()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">NFT Middleman Transfers</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Middleman Wallet</h2>
        <div className="p-4 bg-muted rounded-lg">
          <p className="font-mono break-all">{middlemanAddress}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Pending Transfers ({pendingTransfers.length})</h2>

        {pendingTransfers.length === 0 ? (
          <p className="text-muted-foreground">No pending transfers</p>
        ) : (
          <div className="grid gap-4">
            {pendingTransfers.map((transfer) => (
              <TransferCard key={transfer.id} transfer={transfer} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TransferCard({ transfer }: { transfer: any }) {
  const statusColors = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Transfer #{transfer.id.split("_")[1]}</CardTitle>
            <CardDescription>NFT ID: {transfer.nftId}</CardDescription>
          </div>
          <Badge className={statusColors[transfer.status as keyof typeof statusColors]}>
            {transfer.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-mono text-sm break-all">{transfer.fromAddress}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">To</p>
            <p className="font-mono text-sm break-all">{transfer.toAddress}</p>
          </div>

          {transfer.txId && (
            <div>
              <p className="text-sm text-muted-foreground">Receipt Transaction</p>
              <p className="font-mono text-sm break-all">{transfer.txId}</p>
            </div>
          )}

          {transfer.completionTxId && (
            <div>
              <p className="text-sm text-muted-foreground">Completion Transaction</p>
              <p className="font-mono text-sm break-all">{transfer.completionTxId}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p>{new Date(transfer.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter>{transfer.status === "confirmed" && <CompleteTransferButton transferId={transfer.id} />}</CardFooter>
    </Card>
  )
}

function CompleteTransferButton({ transferId }: { transferId: string }) {
  return (
    <form
      action={async () => {
        "use server"
        await completeNftTransfer(transferId)
      }}
    >
      <Button type="submit">Complete Transfer</Button>
    </form>
  )
}

