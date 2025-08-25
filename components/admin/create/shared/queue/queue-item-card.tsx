"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ExpandableText } from "@/components/ui/expandable-text"
import { Clock, Zap, CheckCircle, XCircle } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { QueueActionsDropdown } from "./queue-actions-dropdown"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"

interface QueueItemProps {
  queueItem: {
    _id: Id<"create_queue">
    title: string
    url: string
    concept: string
    category: string
    createSource: string
    status: "pending" | "processing" | "complete"
    queuedAt: number
    processedAt?: number
    isProcessing: boolean
    processed: boolean
    _creationTime: number
    generatedArticleId?: Id<"articles">
    errorMessage?: string
  }
  isSelected: boolean
  onSelectChange: (isSelected: boolean) => void
  onDelete: (itemId: string) => void
}

export function QueueItemCard({ queueItem, isSelected, onSelectChange, onDelete }: QueueItemProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const processQueueItem = useAction(api.createQueue.processQueueItem)

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const handleProcessNow = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      await processQueueItem({ queueItemId: queueItem._id })
      console.log('Successfully processed:', queueItem.title)
    } catch (error) {
      console.error('Processing failed:', error)
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = () => {
    // Show processing state immediately when user clicks process
    if (isProcessing) {
      return (
        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
          <Zap className="w-3 h-3 mr-1" />
          Processing...
        </Badge>
      )
    }

    // Show error state first if there's an error message
    if (queueItem.errorMessage) {
      return (
        <Badge variant="secondary" className="bg-red-600/20 text-red-400 border-red-600/30">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      )
    }

    // Show actual database status
    switch (queueItem.status) {
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
            <Zap className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        )
      case "complete":
        return (
          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        )
      case "pending":
      default:
        return (
          <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
    }
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
                  onProcessNow={handleProcessNow}
                  onDelete={() => {
                    onDelete(queueItem._id as string)
                  }}
                  isProcessing={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Concept/Description */}
          <div>
            <ExpandableText 
              text={queueItem.concept}
              maxLines={2}
              className="text-body-primary text-sm leading-relaxed"
            />
          </div>

          {/* Source, Category, Added Info */}
          <div className="flex flex-col md:flex-row gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Source:</span>
              <span className="text-body-primary">{queueItem.createSource}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Category:</span>
              <span className="text-body-primary">{queueItem.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Added:</span>
              <span className="text-body-primary">{formatDate(queueItem.queuedAt)} at {formatTime(queueItem.queuedAt)}</span>
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
            {getStatusBadge()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}