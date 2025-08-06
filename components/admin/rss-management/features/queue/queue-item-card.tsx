"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  isSelected: boolean
  onSelectChange: (isSelected: boolean) => void
  onDelete: (itemId: string) => void
}

export function QueueItemCard({ queueItem, isSelected, onSelectChange, onDelete }: QueueItemProps) {
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
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Checkbox and Title with Actions */}
          <div className="flex items-start gap-4">
            {/* Selection Checkbox */}
            <div className="pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectChange(checked === true)}
                id={`select-${queueItem._id}`}
              />
            </div>
            
            {/* Title and Actions */}
            <div className="flex items-start justify-between gap-4 flex-1">
              {/* Title */}
              <h3 className="text-headline-primary text-base lg:text-lg font-semibold leading-tight flex-1">
                {queueItem.title}
              </h3>
              
              {/* Actions Only */}
              <div className="shrink-0">
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
                    onDelete(queueItem._id)
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-body-primary text-sm leading-relaxed">
              {queueItem.description}
            </p>
          </div>

          {/* Source, Published, Added Info */}
          <div className="flex flex-col md:flex-row gap-2 text-sm">
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

          {/* Status Badge */}
          <div>
            <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
              <Clock className="w-3 h-3 mr-1" />
              Pending
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}