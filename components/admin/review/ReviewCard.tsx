"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExpandableText } from "@/components/ui/expandable-text"
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

interface ReviewCardProps {
  article: {
    _id: Id<"articles">
    title: string
    excerpt?: string
    createSource: string
    sourceUrls: string[] | Array<{url: string, domain: string, title: string}>
    status: "draft" | "pending" | "approved" | "rejected"
    _creationTime: number
    categoryId: Id<"categories">
    slug: string
  }
  categoryName?: string
  onClick?: () => void
}

export function ReviewCard({ article, categoryName, onClick }: ReviewCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusBadge = () => {
    switch (article.status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-[var(--indicator-pending)]/20 text-[var(--indicator-pending)] border-[var(--indicator-pending)]/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-600/20 text-red-400 border-red-600/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case "draft":
      default:
        return (
          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
            <FileText className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        )
    }
  }

  const getBorderClass = () => {
    switch (article.status) {
      case "pending":
        return "border-[var(--indicator-pending)] hover:border-[var(--indicator-pending)]"
      case "approved":
        return "border-green-600/30 hover:border-green-600/50"
      case "rejected":
        return "border-red-600/30 hover:border-red-600/50"
      case "draft":
        return "border-blue-600/30 hover:border-blue-600/50"
      default:
        return "border-brand-line hover:border-brand-line-hover"
    }
  }

  return (
    <Card 
      className={`bg-brand-card-dark ${getBorderClass()} cursor-pointer transition-all hover:bg-brand-card`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h3 className="text-headline-primary text-base lg:text-lg font-semibold leading-tight">
              {article.title}
            </h3>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <div>
              <ExpandableText 
                text={article.excerpt}
                maxLines={2}
                className="text-body-primary text-sm leading-relaxed"
              />
            </div>
          )}

          {/* Source Info, Category, Created */}
          <div className="flex flex-col md:flex-row gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Source:</span>
              <span className="text-body-primary">{article.createSource}</span>
            </div>
            {categoryName && (
              <div className="flex items-center gap-1">
                <span className="text-headline-primary font-medium">Category:</span>
                <span className="text-body-primary">{categoryName}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="text-headline-primary font-medium">Created:</span>
              <span className="text-body-primary">{formatDate(article._creationTime)} at {formatTime(article._creationTime)}</span>
            </div>
          </div>

          {/* Source URLs */}
          {article.sourceUrls.length > 0 && (
            <div className="space-y-2">
              <span className="text-headline-primary font-medium text-sm">Sources:</span>
              <div className="space-y-1">
                {article.sourceUrls.map((source, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-body-secondary text-sm mt-0.5 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <a 
                        href={typeof source === 'string' ? source : source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm underline transition-colors block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {typeof source === 'string' ? source : source.title}
                      </a>
                      {typeof source !== 'string' && (
                        <p className="text-body-secondary text-xs mt-0.5">{source.domain}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Badge */}
          <div className="flex justify-between items-center">
            {getStatusBadge()}
            <span className="text-xs text-body-secondary">
              Click to review
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}