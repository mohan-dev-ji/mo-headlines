"use client"

import { useState, useEffect } from "react"
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
  nextRunTime?: number
  updatedAt: number
  // Run result fields from database
  lastRunSuccess?: boolean
  lastRunFeedStatus?: string
  lastRunCategoryStatus?: string
  lastRunArticlesFound?: number
  lastRunArticlesQueued?: number
  lastRunArticles?: Array<{
    title: string
    url: string
    publishedAt: string
    excerpt: string
  }>
  lastRunError?: string
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
  onRunNow: (producerId: string) => void
  isRunning?: boolean
}

export function ProducerCard({ producer, category, onEdit, onDelete, onToggleStatus, onRunNow, isRunning }: ProducerCardProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Update current time every second for countdown display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate remaining time until next run (no database queries)
  const getRemainingTime = () => {
    if (!producer.isActive || !producer.nextRunTime) return null;
    
    const remaining = producer.nextRunTime - currentTime;
    
    if (remaining <= 0) return "Ready to run";
    
    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  return (
    <Card className="bg-brand-card border-brand-line">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title with Actions */}
          <div className="flex items-start justify-between gap-4">
            {/* Title */}
            <h3 className="text-headline-primary text-base lg:text-lg font-semibold leading-tight flex-1">
              {producer.name}
            </h3>
            
            {/* Actions Only */}
            <div className="shrink-0">
              <ProducerActionsDropdown 
                producer={{
                  _id: producer._id,
                  name: producer.name,
                  isActive: producer.isActive
                }}
                onEdit={() => onEdit(producer._id)}
                onRunNow={() => onRunNow(producer._id)}
                onDelete={() => onDelete(producer._id)}
                onToggleStatus={() => onToggleStatus(producer._id)}
              />
            </div>
          </div>

          {/* URL */}
          <div>
            <p className="text-body-secondary text-sm">
              {producer.url}
            </p>
          </div>
          
          {/* Producer Details */}
          <div className="flex flex-col md:flex-row gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Category:</span>
              <span className="text-body-primary">{category?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Frequency:</span>
              <span className="text-body-primary">Every {producer.pollFrequency} minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Last Polled:</span>
              <span className="text-body-primary">{producer.lastPolled ? new Date(producer.lastPolled).toLocaleString() : 'Never'}</span>
            </div>
          </div>

          {/* Keywords Section */}
          {category?.keywords && category.keywords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-headline-primary text-sm font-medium">Keywords ({category.keywords.length})</h4>
              <div className="flex flex-wrap gap-1">
                {category.keywords.map((keyword, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-background-secondary text-body-primary text-xs border border-border-primary"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Run Results */}
          <div className="space-y-2">
            <h4 className="text-headline-primary text-sm font-medium">Run Results</h4>
            <div className="flex flex-col md:flex-row gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-headline-primary font-medium">Last Run:</span>
                <span className="text-body-primary">
                  {isRunning ? (
                    <span className="text-blue-400">Running...</span>
                  ) : producer.lastPolled ? (
                    new Date(producer.lastPolled).toLocaleString()
                  ) : (
                    <span className="text-body-greyed-out">Never</span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-headline-primary font-medium">Feed Status:</span>
                <span className="text-body-primary">
                  {isRunning ? (
                    <span className="text-blue-400">Checking...</span>
                  ) : producer.lastRunFeedStatus === 'live' ? (
                    <span className="text-green-400">🟢 Live</span>
                  ) : producer.lastRunFeedStatus === 'not_live' ? (
                    <span className="text-red-400">🔴 Not Live</span>
                  ) : (
                    <span className="text-body-greyed-out">Not checked</span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-headline-primary font-medium">Category Status:</span>
                <span className="text-body-primary">
                  {isRunning ? (
                    <span className="text-blue-400">Filtering...</span>
                  ) : producer.lastRunCategoryStatus === 'found' ? (
                    <span className="text-green-400">📰 Articles Found</span>
                  ) : producer.lastRunCategoryStatus === 'not_found' ? (
                    <span className="text-yellow-400">📭 No Articles</span>
                  ) : (
                    <span className="text-body-greyed-out">Not checked</span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-headline-primary font-medium">Articles Found:</span>
                <span className="text-body-primary">
                  {isRunning ? (
                    <span className="text-blue-400">Counting...</span>
                  ) : producer.lastRunArticlesFound !== undefined ? (
                    producer.lastRunArticlesFound
                  ) : (
                    <span className="text-body-greyed-out">-</span>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional Run Results (Articles & Errors) */}
          {producer.lastRunArticles && producer.lastRunArticles.length > 0 && (
            <div className="text-xs">
              <span className="text-headline-primary font-medium">Matched Articles ({producer.lastRunArticles.length}):</span>
              <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                {producer.lastRunArticles.map((article, index) => (
                  <div key={index} className="text-body-primary">
                    • <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 underline"
                      >
                        {article.title}
                      </a>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {producer.lastRunError && (
            <div className="text-xs text-red-400">
              <span className="text-headline-primary font-medium">Error:</span> {producer.lastRunError}
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-1">
            <span className="text-body-primary text-sm">
              {producer.isActive ? '🟢 Active' : '🔴 Inactive'}
              {producer.isActive && getRemainingTime() && (
                <span className="ml-2 text-blue-400 font-mono">
                  {getRemainingTime()}
                </span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}