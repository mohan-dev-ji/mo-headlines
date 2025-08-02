"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { QueueActionsDropdown } from "./queue-actions-dropdown"

interface QueueItemProps {
  queueItem: {
    _id: Id<"rss_queue">
    producerId: Id<"rss_producer">
    title: string
    description: string
    url: string
    publishedAt: number
    processed: boolean
    createdAt: number
    producer: {
      _id: Id<"rss_producer">
      name: string
      url: string
      categoryId: Id<"categories">
      isActive: boolean
      pollFrequency: number
      numberOfArticles: number
      lastPolled?: number
      createdAt: number
      updatedAt: number
    } | null
  }
}

export function QueueItemCard({ queueItem }: QueueItemProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <Card className="bg-brand-card-dark border-brand-line">
      <CardContent className="p-6 relative">
        {/* Status and Actions - Top Right */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
          <QueueActionsDropdown 
            queueItem={{
              _id: queueItem._id,
              title: queueItem.title
            }}
            onProcessNow={() => {
              // TODO: Implement process now functionality
              console.log('Process now:', queueItem.title)
            }}
            onDelete={() => {
              // TODO: Implement delete functionality
              console.log('Delete:', queueItem.title)
            }}
          />
        </div>

        {/* Article Content */}
        <div className="space-y-4 pr-32">
          {/* Article Title */}
          <div>
            <h3 className="text-headline-primary text-lg font-semibold leading-tight">
              {queueItem.title}
            </h3>
          </div>

          {/* Source, Published, Added Info */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Source:</span>
              <span className="text-body-primary">{queueItem.producer?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Published:</span>
              <span className="text-body-primary">{formatDate(queueItem.publishedAt)} at {formatTime(queueItem.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Added:</span>
              <span className="text-body-primary">{formatDate(queueItem.createdAt)} at {formatTime(queueItem.createdAt)}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <span className="text-headline-primary block text-sm mb-1">Description</span>
            <p className="text-body-primary text-sm leading-relaxed">
              {queueItem.description}
            </p>
          </div>

          {/* View Article Link */}
          <div>
            <a 
              href={queueItem.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors"
            >
              View Article
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}