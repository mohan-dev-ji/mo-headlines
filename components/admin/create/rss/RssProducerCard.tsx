"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { RssActionsDropdown } from "./RssActionsDropdown"
import { Id } from "@/convex/_generated/dataModel"

interface Producer {
  _id: Id<"create_rss">
  name: string
  feedUrl?: string
  // Legacy field support
  url?: string
  categoryId: Id<"categories">
  pollFrequency: number
  isActive: boolean
  createdBy: Id<"users">
  articlesInFeed?: number
  matchedArticles?: Array<{
    title: string
    url: string
    description: string
    pubDate: string
  }>
  publishedAt?: string
}

interface Category {
  _id: Id<"categories">
  name: string
  slug: string
  keywords?: string[]
}


interface RssProducerCardProps {
  producer: Producer
  category?: Category
  onEdit: (producerId: string) => void
  onDelete: (producerId: string) => void
  onToggleStatus: (producerId: string) => void
  onAddToQueue: (producerId: string) => void
  onRefresh: (producerId: string) => void
  isRunning?: boolean
}

export function RssProducerCard({ producer, category, onEdit, onDelete, onToggleStatus, onAddToQueue, onRefresh, isRunning }: RssProducerCardProps) {
  return (
    <Card className="bg-brand-card-dark border-brand-line">
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-background-secondary/20 transition-colors">
              <div className="flex items-center justify-between w-full pr-4">
                <h3 className="text-headline-primary text-base lg:text-lg font-semibold leading-tight">
                  {producer.name}
                </h3>
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <RssActionsDropdown
                    producer={{
                      _id: producer._id,
                      name: producer.name,
                      isActive: producer.isActive
                    }}
                    onEdit={() => onEdit(producer._id)}
                    onAddToQueue={() => onAddToQueue(producer._id)}
                    onDelete={() => onDelete(producer._id)}
                    onToggleStatus={() => onToggleStatus(producer._id)}
                    onRefresh={() => onRefresh(producer._id)}
                  />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {/* URL */}
                <div>
                  <p className="text-body-secondary text-sm">
                    {producer.feedUrl || producer.url}
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
                    <span className="text-headline-primary font-medium">Articles in Feed:</span>
                    <span className="text-body-primary">{producer.articlesInFeed || 0}</span>
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

                {/* Status */}
                <div className="space-y-2">
                  <h4 className="text-headline-primary text-sm font-medium">Status</h4>
                  <div className="flex flex-col md:flex-row gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-headline-primary font-medium">Status:</span>
                      <span className="text-body-primary">
                        {isRunning ? (
                          <span className="text-blue-400">Running...</span>
                        ) : (producer.matchedArticles && producer.matchedArticles.length > 0) ? (
                          <span className="text-green-400">Ready</span>
                        ) : (
                          <span className="text-body-greyed-out">No matches</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-headline-primary font-medium">Matched Articles:</span>
                      <span className="text-body-primary">
                        {isRunning ? (
                          <span className="text-blue-400">Checking...</span>
                        ) : (
                          <span className="text-green-400">{producer.matchedArticles?.length || 0}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Matched Articles List */}
                {producer.matchedArticles && producer.matchedArticles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-headline-primary text-sm font-medium">Matched Articles</h4>
                    <div className="space-y-1">
                      {producer.matchedArticles.map((article, index) => (
                        <div key={index} className="text-sm">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline transition-colors"
                          >
                            {article.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}