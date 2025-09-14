"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ReviewCard } from "./ReviewCard"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { useRouter } from "next/navigation"

export function PendingTab() {
  const router = useRouter()
  const articles = useQuery(api.articles.getArticlesByStatus, { status: "pending" })

  const handleArticleClick = (articleId: string) => {
    router.push(`/admin/review/preview/${articleId}`)
  }

  if (articles === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingAnimation size={60} />
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-body-secondary">
        <div className="text-center">
          <h3 className="text-lg font-medium text-headline-primary mb-2">No Pending Articles</h3>
          <p>Articles awaiting review will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 h-full overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-p text-body-secondary">
          Pending Articles ({articles.length})
        </h2>
      </div>

    
      <div className="p-4 space-y-4">
        {articles.map((article) => (
          <ReviewCard
            key={article._id}
            article={article}
            categoryName={article.category?.name}
          />
        ))}
      </div>
    </div>
  )
}