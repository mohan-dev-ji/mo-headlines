"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QueueItemCard } from "./queue-item-card"

export function QueueTab() {
  const queueItems = useQuery(api.rssQueue.getUnprocessedQueueWithProducers)
  const queueStats = useQuery(api.rssQueue.getQueueStats)

  const isLoading = queueItems === undefined || queueStats === undefined

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Article Queue</h2>
            <p className="text-muted-foreground">
              Monitor pending articles awaiting AI processing and fact-checking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Loading...</Badge>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Article Queue</h2>
          <p className="text-muted-foreground">
            Monitor pending articles awaiting AI processing and fact-checking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {queueStats.unprocessed} articles pending
          </Badge>
          <Badge variant="outline">
            {queueStats.processed} processed
          </Badge>
        </div>
      </div>

      {queueItems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Articles in Queue</CardTitle>
            <CardDescription>
              There are currently no articles waiting for processing. 
              Articles will appear here when RSS producers add new content.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {queueItems.map((item) => (
            <QueueItemCard key={item._id} queueItem={item} />
          ))}
        </div>
      )}
    </div>
  )
}