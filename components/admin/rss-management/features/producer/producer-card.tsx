"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProducerActionsDropdown } from "./producer-actions-dropdown"
import { Id } from "@/convex/_generated/dataModel"

interface Producer {
  _id: Id<"rss_producer">
  name: string
  url: string
  categoryId: Id<"categories">
  pollFrequency: number
  isActive: boolean
  lastPolled?: number
  updatedAt: number
}

interface Category {
  _id: Id<"categories">
  name: string
  slug: string
  keywords?: string[]
}

interface ProducerCardProps {
  producer: Producer
  category?: Category
  onEdit: (producerId: string) => void
  onDelete: (producerId: string) => void
  onToggleStatus: (producerId: string) => void
  countdown?: number
}

export function ProducerCard({ producer, category, onEdit, onDelete, onToggleStatus, countdown }: ProducerCardProps) {
  return (
    <Card className="bg-brand-card border-brand-line">
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-6">
          
          {/* Column 1: Producer Details */}
          <div className="space-y-3">
            <div>
              <CardTitle className="text-headline-primary text-lg mb-1">
                {producer.name}
              </CardTitle>
              <CardDescription className="text-body-secondary text-sm">
                {producer.url}
              </CardDescription>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-headline-primary">Category:</span> <span className="text-body-primary">{category?.name || 'Unknown'}</span>
              </div>
              <div className="text-sm">
                <span className="text-headline-primary">Frequency:</span> <span className="text-body-primary">Every {producer.pollFrequency} minutes</span>
              </div>
              <div className="text-sm">
                <span className="text-headline-primary">Status:</span> 
                <span className="text-body-primary">
                  {producer.isActive ? '🟢 Active' : '🔴 Inactive'}
                  {producer.isActive && countdown !== undefined && (
                    <span className="ml-2 text-blue-400 font-mono">
                      {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-headline-primary">Last Polled:</span> <span className="text-body-primary">{producer.lastPolled ? new Date(producer.lastPolled).toLocaleString() : 'Never'}</span>
              </div>
              {category?.keywords && category.keywords.length > 0 && (
                <div className="text-xs">
                  <span className="text-headline-primary">Keywords:</span> <span className="text-body-primary">{category.keywords.slice(0, 3).join(', ')}{category.keywords.length > 3 && '...'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Run Results (Placeholder for future implementation) */}
          <div className="space-y-3">
            <div>
              <h4 className="text-headline-primary text-sm font-medium mb-2">Run Results</h4>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-body-greyed-out">
                <span className="text-body-greyed-out">Last Run:</span> Never
              </div>
              <div className="text-sm text-body-greyed-out">
                <span className="text-body-greyed-out">Feed Status:</span> Not checked
              </div>
              <div className="text-sm text-body-greyed-out">
                <span className="text-body-greyed-out">Category Status:</span> Not checked
              </div>
              <div className="text-sm text-body-greyed-out">
                <span className="text-body-greyed-out">Articles Found:</span> -
              </div>
              <div className="text-sm text-body-greyed-out">
                <span className="text-body-greyed-out">Current Article:</span> -
              </div>
            </div>
          </div>

          {/* Column 3: Actions */}
          <div className="flex justify-end">
            <ProducerActionsDropdown 
              producer={{
                _id: producer._id,
                name: producer.name,
                isActive: producer.isActive
              }}
              onEdit={() => onEdit(producer._id)}
              onDelete={() => onDelete(producer._id)}
              onToggleStatus={() => onToggleStatus(producer._id)}
            />
          </div>
          
        </div>
      </CardContent>
    </Card>
  )
}