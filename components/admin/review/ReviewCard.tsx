"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown"
import { ExpandableText } from "@/components/ui/expandable-text"
import { Clock, CheckCircle, XCircle, FileText, Eye, Edit, ImageIcon, MoreVertical } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ReviewActionsDropdownProps {
  article: {
    _id: Id<"articles">
    slug: string
  }
}

function ReviewActionsDropdown({ article }: ReviewActionsDropdownProps) {
  const router = useRouter()

  const dropdownItems: DropdownItem[] = [
    {
      label: "Preview",
      onClick: () => {
        router.push(`/admin/review/preview/${article._id}`)
      },
      icon: <Eye className="h-4 w-4" />
    },
    {
      label: "Edit",
      onClick: () => {
        router.push(`/admin/review/edit/${article._id}`)
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: "Add Image",
      onClick: () => {
        router.push(`/admin/images/add?articleId=${article._id}`)
      },
      icon: <ImageIcon className="h-4 w-4" />
    }
  ]

  const trigger = (
    <Button
      variant="ghost"
      className="h-8 w-8 p-0 text-body-secondary hover:text-headline-primary hover:bg-zinc-700/50"
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  )

  return (
    <CustomDropdown
      trigger={trigger}
      items={dropdownItems}
      align="right"
    />
  )
}

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
}

export function ReviewCard({ article, categoryName }: ReviewCardProps) {
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
    <Card className={`bg-brand-card-dark ${getBorderClass()}`}>
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-background-secondary/20 transition-colors [&>svg]:translate-y-0 [&>svg]:self-center [&>svg]:size-5">
              <div className="flex items-center justify-between w-full pr-4">
                {/* Title - Left aligned */}
                <h3 className="text-headline-primary text-base lg:text-lg font-semibold leading-tight flex-1 pr-4">
                  {article.title}
                </h3>

                {/* Right side: Status Badge + Review Button */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="shrink-0">
                    {getStatusBadge()}
                  </div>

                  {/* Actions Dropdown */}
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ReviewActionsDropdown article={article} />
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4">
                {/* Excerpt */}
                {article.excerpt && (
                  <div>
                    <h4 className="text-headline-primary text-sm font-medium mb-2">Excerpt</h4>
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
                    <h4 className="text-headline-primary font-medium text-sm">Sources ({article.sourceUrls.length})</h4>
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}