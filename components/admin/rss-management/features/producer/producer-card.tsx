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

interface RunResult {
  success: boolean
  feedStatus: 'live' | 'not_live'
  categoryStatus: 'found' | 'not_found' | null
  articlesFound: number
  articlesQueued: number
  articles: Array<{
    title: string
    url: string
    publishedAt: string
    excerpt: string
  }>
  lastRun: number
  error?: string
}

interface ProducerCardProps {
  producer: Producer
  category?: Category
  onEdit: (producerId: string) => void
  onDelete: (producerId: string) => void
  onToggleStatus: (producerId: string) => void
  onRunNow: (producerId: string) => void
  countdown?: number
  runResult?: RunResult
  isRunning?: boolean
}

export function ProducerCard({ producer, category, onEdit, onDelete, onToggleStatus, onRunNow, countdown, runResult, isRunning }: ProducerCardProps) {
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
            {category?.keywords && category.keywords.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-headline-primary font-medium">Keywords:</span>
                <span className="text-body-primary">{category.keywords.slice(0, 3).join(', ')}{category.keywords.length > 3 && '...'}</span>
              </div>
            )}
          </div>
          
          {/* Run Results */}
          <div className="space-y-2">
            <h4 className="text-headline-primary text-sm font-medium">Run Results</h4>
            <div className="flex flex-col md:flex-row gap-2 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-headline-primary font-medium">Last Run:</span>
                <span className="text-body-primary">
                  {isRunning ? (
                    <span className="text-blue-400">Running...</span>
                  ) : runResult?.lastRun ? (
                    new Date(runResult.lastRun).toLocaleString()
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
                  ) : runResult?.feedStatus === 'live' ? (
                    <span className="text-green-400">🟢 Live</span>
                  ) : runResult?.feedStatus === 'not_live' ? (
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
                  ) : runResult?.categoryStatus === 'found' ? (
                    <span className="text-green-400">📰 Articles Found</span>
                  ) : runResult?.categoryStatus === 'not_found' ? (
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
                  ) : runResult?.articlesFound !== undefined ? (
                    runResult.articlesFound
                  ) : (
                    <span className="text-body-greyed-out">-</span>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          {/* Additional Run Results (Articles & Errors) */}
          {runResult?.articles && runResult.articles.length > 0 && (
            <div className="text-xs">
              <span className="text-headline-primary font-medium">Recent Articles:</span>
              <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                {runResult.articles.slice(0, 3).map((article, index) => (
                  <div key={index} className="text-body-primary">
                    • <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 underline"
                      >
                        {article.title.substring(0, 40)}...
                      </a>
                  </div>
                ))}
                {runResult.articles.length > 3 && (
                  <div className="text-body-greyed-out">
                    +{runResult.articles.length - 3} more articles
                  </div>
                )}
              </div>
            </div>
          )}
          
          {runResult?.error && (
            <div className="text-xs text-red-400">
              <span className="text-headline-primary font-medium">Error:</span> {runResult.error}
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-1">
            <span className="text-body-primary text-sm">
              {producer.isActive ? '🟢 Active' : '🔴 Inactive'}
              {producer.isActive && countdown !== undefined && (
                <span className="ml-2 text-blue-400 font-mono">
                  {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}