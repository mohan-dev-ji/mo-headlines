"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { ArrowLeft } from "lucide-react"
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

  const handleBack = () => {
    router.push("/admin/review?tab=pending")
  }

  const handleCancel = () => {
    // Navigate back to the appropriate tab based on current article status
    const tabMap = {
      pending: "pending",
      approved: "approved", 
      rejected: "rejected",
      draft: "drafts"
    }
    const targetTab = article ? tabMap[article.status] || "pending" : "pending"
    router.push(`/admin/review?tab=${targetTab}`)
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingAnimation size={60} className="py-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background">
      {/* Editorial Header - Fixed at top */}
      <div className="sticky top-0 z-50 bg-brand-card border-b border-brand-line">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Review
              </Button>
              <div className="h-6 w-px bg-brand-line"></div>
              <h2 className="text-lg font-semibold text-headline-primary">Article Preview</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-body-secondary">Status:</span>
              <span className="capitalize text-sm font-medium text-headline-primary">{article.status}</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Live Article Preview */}
      <div className="bg-white">
        <PublicArticlePage 
          params={Promise.resolve({ id: resolvedParams.id })} 
        />
        
      </div>

      {/* Editorial Actions Footer - Full width like header */}
      <div className="bg-brand-card border-t border-brand-line min-h-[100px] flex items-center">
        <div className="max-w-2xl mx-auto px-4 w-full">
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleStatusChange("approved")}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-zinc-100"
            >
              {isUpdating ? "Updating..." : "Approve"}
            </Button>
            
            <Button 
              onClick={handleEdit}
              className="bg-yellow-300 hover:bg-yellow-500 text-headline-secondary"
            >
              Edit
            </Button>
            
            <Button 
              onClick={() => handleStatusChange("rejected")}
              disabled={isUpdating}
              variant="destructive"
            >
              {isUpdating ? "Updating..." : "Reject"}
            </Button>
            
            <Button 
              onClick={() => handleStatusChange("draft")}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-800 text-zinc-100"
            >
              {isUpdating ? "Updating..." : "Save to Drafts"}
            </Button>
            
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="text-headline-secondary border-brand-line hover:bg-zinc-200"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}