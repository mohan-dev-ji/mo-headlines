"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { YouTubeActionsDropdown } from "./YouTubeActionsDropdown"
import { ExpandableText } from "@/components/ui/expandable-text"
import { Id } from "@/convex/_generated/dataModel"
import { displayTimecode } from "@/lib/timecode-utils"

interface YouTubeSource {
  _id: Id<"create_youtube">
  videoUrl: string
  videoTitle?: string
  transcript: string
  categoryId: Id<"categories">
  timecodeStart?: number
  timecodeEnd?: number
  createdBy: Id<"users">
  updatedAt?: number
  categoryName?: string
}

interface YouTubeSourceCardProps {
  source: YouTubeSource
  onEdit: (sourceId: string) => void
  onDelete: (sourceId: string) => void
  onAddToQueue: (sourceId: string) => void
}

export function YouTubeSourceCard({ source, onEdit, onDelete, onAddToQueue }: YouTubeSourceCardProps) {

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^[a-zA-Z0-9_-]{11}$/ // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    return null;
  }

  const videoId = extractVideoId(source.videoUrl);
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

  return (
    <Card className="bg-brand-card-dark border-brand-line">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title with Actions */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-headline-primary text-base lg:text-lg font-semibold leading-tight flex-1">
              {source.videoTitle || "YouTube Video"}
            </h3>
            
            <div className="shrink-0">
              <YouTubeActionsDropdown 
                source={{
                  _id: source._id,
                  videoTitle: source.videoTitle
                }}
                onEdit={() => onEdit(source._id)}
                onAddToQueue={() => onAddToQueue(source._id)}
                onDelete={() => onDelete(source._id)}
              />
            </div>
          </div>

          {/* Video Info Section */}
          <div className="flex gap-4">
            {/* Thumbnail */}
            {thumbnailUrl && (
              <div className="shrink-0">
                <img
                  src={thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-20 h-15 object-cover rounded border border-brand-line"
                />
              </div>
            )}
            
            {/* Video Details */}
            <div className="flex-1 space-y-1">
              <div className="text-xs text-body-secondary">
                <a 
                  href={source.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline transition-colors break-all"
                >
                  {source.videoUrl}
                </a>
              </div>
              
              {/* Timecode Info */}
              <div className="text-xs text-body-secondary">
                <span className="font-medium">Timecodes:</span> {displayTimecode(source.timecodeStart)} - {displayTimecode(source.timecodeEnd)}
              </div>
              
              {/* Category */}
              {source.categoryName && (
                <div className="text-xs text-body-secondary">
                  <span className="font-medium">Category:</span> {source.categoryName}
                </div>
              )}
            </div>
          </div>
          
          {/* Transcript Preview */}
          <div className="space-y-2">
            <h4 className="text-headline-primary text-sm font-medium">Transcript Segment</h4>
            <ExpandableText 
              text={source.transcript}
              maxLines={2}
              className="text-body-primary text-sm leading-relaxed"
            />
            {source.transcript.length > 200 && (
              <p className="text-xs text-body-secondary">
                {source.transcript.split(' ').length} words • {source.transcript.length} characters
              </p>
            )}
          </div>

          {/* Last Updated */}
          {source.updatedAt && (
            <div className="flex items-center gap-1 text-sm pt-2 border-t border-brand-line">
              <span className="text-headline-primary font-medium">Updated:</span>
              <span className="text-body-secondary">
                {new Date(source.updatedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}