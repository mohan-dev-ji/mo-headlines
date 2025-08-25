"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ExpandableTextProps {
  text: string
  maxLines?: number
  className?: string
  readMoreClassName?: string
  readLessClassName?: string
}

export function ExpandableText({ 
  text, 
  maxLines = 2, 
  className = "",
  readMoreClassName = "",
  readLessClassName = ""
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Check if text is long enough to need truncation
  // Simple heuristic: roughly 100 characters per line
  const approximateCharactersPerLine = 100
  const shouldTruncate = text.length > (approximateCharactersPerLine * maxLines)
  
  if (!shouldTruncate) {
    return (
      <p className={cn("text-body-primary text-sm leading-relaxed", className)}>
        {text}
      </p>
    )
  }

  return (
    <div className="space-y-1">
      <p 
        className={cn(
          "text-body-primary text-sm leading-relaxed",
          !isExpanded && `line-clamp-${maxLines}`,
          className
        )}
      >
        {text}
      </p>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "text-xs text-blue-400 hover:text-blue-300 underline transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded",
          isExpanded ? readLessClassName : readMoreClassName
        )}
      >
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </div>
  )
}