"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// Dynamically import the public article page component
const PublicArticlePage = dynamic(() => import("@/app/(public)/article/[id]/page"), {
  loading: () => <LoadingAnimation size={60} className="py-8" />,
  ssr: false
})

interface ArticlePreviewPageProps {
  params: Promise<{ id: string }>
}

export function ArticlePreviewPage({ params }: ArticlePreviewPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  
  const article = useQuery(api.articles.getArticle, { id: resolvedParams.id as Id<"articles"> })
  const updateArticleStatus = useMutation(api.articles.updateArticleStatus)

  const handleStatusChange = async (newStatus: "approved" | "rejected" | "draft") => {
    if (isUpdating || !article) return
    
    setIsUpdating(true)
    try {
      await updateArticleStatus({
        id: article._id,
        status: newStatus
      })
      
      const statusLabels = {
        approved: "approved",
        rejected: "rejected", 
        draft: "saved as draft"
      }
      
      toast.success(`Article ${statusLabels[newStatus]} successfully`)
      
      // Navigate back to review page with appropriate tab
      const tabMap = { approved: "approved", rejected: "rejected", draft: "drafts" }
      router.push(`/admin/review?tab=${tabMap[newStatus]}`)
    } catch (error) {
      toast.error(`Failed to update article status: ${error}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEdit = () => {
    if (!article) return
    router.push(`/admin/review/edit/${article._id}`)
  }


  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingAnimation size={60} className="py-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background p-[var(--padding-md)] space-y-[var(--padding-md)]">
      {/* Action Buttons Section - Top */}
      <div className="bg-brand-card-dark rounded-md p-[var(--padding-md)]">
        <div className="flex gap-3">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="bg-white hover:bg-gray-50 text-gray-900 border-gray-300 flex-1"
          >
            Edit
          </Button>

          <Button
            onClick={() => handleStatusChange("approved")}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
          >
            {isUpdating ? "Updating..." : "Approve"}
          </Button>

          <Button
            onClick={() => handleStatusChange("draft")}
            disabled={isUpdating}
            className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
          >
            {isUpdating ? "Updating..." : "Save to Drafts"}
          </Button>

          <Button
            onClick={() => handleStatusChange("rejected")}
            disabled={isUpdating}
            className="bg-red-600 hover:bg-red-700 text-white flex-1"
          >
            {isUpdating ? "Updating..." : "Reject"}
          </Button>
        </div>
      </div>

      {/* Article Content Section - Bottom */}
      <div className="bg-brand-card rounded-md p-[var(--padding-md)]">
        <div className="bg-white rounded-md">
          <PublicArticlePage
            params={Promise.resolve({ id: resolvedParams.id })}
          />
        </div>
      </div>
    </div>
  )
}