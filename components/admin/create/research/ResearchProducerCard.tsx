"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ResearchActionsDropdown } from "./ResearchActionsDropdown"
import { Id } from "@/convex/_generated/dataModel"

interface ResearchSource {
  _id: Id<"create_research">
  title: string
  url?: string
  concept: string
  createdBy: Id<"users">
  updatedAt?: number
}

interface ResearchProducerCardProps {
  source: ResearchSource
  onEdit: (sourceId: string) => void
  onDelete: (sourceId: string) => void
  onAddToQueue: (sourceId: string) => void
}

export function ResearchProducerCard({ source, onEdit, onDelete, onAddToQueue }: ResearchProducerCardProps) {
  return (
    <Card className="bg-brand-card border-brand-line">
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-background-secondary/20 transition-colors [&>svg]:translate-y-0 [&>svg]:self-center [&>svg]:size-5">
              <div className="flex items-center justify-between w-full pr-4">
                <h3 className="text-headline-primary text-base lg:text-lg font-semibold leading-tight">
                  {source.title}
                </h3>
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <ResearchActionsDropdown
                    source={{
                      _id: source._id,
                      title: source.title
                    }}
                    onEdit={() => onEdit(source._id)}
                    onAddToQueue={() => onAddToQueue(source._id)}
                    onDelete={() => onDelete(source._id)}
                  />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {/* URL (if provided) */}
                {source.url && (
                  <div>
                    <p className="text-body-secondary text-sm">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline transition-colors"
                      >
                        {source.url}
                      </a>
                    </p>
                  </div>
                )}

                {/* Research Concept */}
                <div className="space-y-2">
                  <h4 className="text-headline-primary text-sm font-medium">Research Concept</h4>
                  <p className="text-body-primary text-sm leading-relaxed">
                    {source.concept}
                  </p>
                </div>

                {/* Last Updated */}
                {source.updatedAt && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-headline-primary font-medium">Updated:</span>
                    <span className="text-body-secondary">
                      {new Date(source.updatedAt).toLocaleString()}
                    </span>
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