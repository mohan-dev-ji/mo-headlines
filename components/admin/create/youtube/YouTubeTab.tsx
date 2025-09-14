"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus } from "lucide-react"
import { CreateYouTubeModal } from "./CreateYouTubeModal"
import { EditYouTubeModal } from "./EditYouTubeModal"
import { YouTubeSourceCard } from "./YouTubeSourceCard"
import { useQuery, useMutation } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { LoadingAnimation } from "@/components/ui/loading-animation"

export function YouTubeTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sourceToDelete, setSourceToDelete] = useState<any>(null)
  const sources = useQuery(api.createYoutube.listYouTubeSources, {})
  const deleteSource = useMutation(api.createYoutube.deleteYouTubeSource)
  const addToQueue = useMutation(api.createYoutube.addYouTubeToQueue)

  const handleEditSource = (sourceId: string) => {
    if (!sources || !Array.isArray(sources)) return
    const source = sources.find(s => s._id === sourceId)
    if (source) {
      setEditingSource(source)
      setIsEditModalOpen(true)
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingSource(null)
    
    setTimeout(() => {
      console.log('🔄 Edit modal closed - Convex should have refetched with new updatedAt')
      console.log('📊 Current YouTube sources updatedAt timestamps:', 
        Array.isArray(sources) ? sources.map(s => ({ title: s.videoTitle, updatedAt: s.updatedAt })) : []
      )
    }, 200)
  }

  const handleDeleteSource = (sourceId: string) => {
    if (!sources || !Array.isArray(sources)) return
    const source = sources.find(s => s._id === sourceId)
    if (!source) return

    setSourceToDelete(source)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteSource = async () => {
    if (!sourceToDelete) return

    try {
      const result = await deleteSource({ youtubeId: sourceToDelete._id as Id<"create_youtube"> })
      
      if (result.success) {
        console.log('YouTube source deleted successfully')
        toast.success(`Deleted YouTube source "${sourceToDelete.videoTitle || 'Video'}"`)
      } else {
        toast.error(result.error || 'Failed to delete YouTube source')
      }
      
      setIsDeleteDialogOpen(false)
      setSourceToDelete(null)
    } catch (error) {
      console.error('Failed to delete YouTube source:', error)
      toast.error('Failed to delete YouTube source. Please try again.')
    }
  }

  const handleAddToQueue = async (sourceId: string) => {
    if (!sources || !Array.isArray(sources)) return
    const source = sources.find(s => s._id === sourceId)
    if (!source) return

    try {
      console.log('Adding YouTube to queue:', source.videoTitle || source.videoUrl)
      const result = await addToQueue({ youtubeId: sourceId as Id<"create_youtube"> })
      
      if (result.success) {
        console.log(`✅ Added YouTube to queue: ${source.videoTitle || source.videoUrl}`)
        toast.success(`Added "${source.videoTitle || 'YouTube video'}" to queue`)
      } else {
        console.log(`⚠️ Failed to add to queue`)
        toast.error('Failed to add YouTube video to queue')
      }
    } catch (error) {
      console.error('Failed to add YouTube to queue:', error)
      toast.error('Failed to add YouTube video to queue. Please try again.')
    }
  }

  return (
    <div className="h-full min-h-0 overflow-auto bg-brand-card-dark p-[var(--padding-md)] rounded-[var(--radius)]">
      <div className="flex justify-center mb-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create New YouTube Source
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Loading State */}
        {sources === undefined && (
          <div className="flex justify-center py-8">
            <LoadingAnimation />
          </div>
        )}

        {/* Empty State */}
        {sources && Array.isArray(sources) && sources.length === 0 && (
          <Card className="bg-brand-card border-brand-line">
            <CardHeader className="text-center py-12">
              <CardTitle className="text-headline-primary">No YouTube Sources Yet</CardTitle>
              <CardDescription className="text-body-secondary">
                Add your first YouTube video to extract transcripts and generate content from specific segments.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* YouTube Source Cards */}
        {sources && Array.isArray(sources) && sources.length > 0 && (
          <div className="grid gap-4">
            {sources.map((source) => {
              return (
                <YouTubeSourceCard
                  key={`${source._id}-${source.videoTitle}-${source.updatedAt}`}
                  source={source}
                  onEdit={handleEditSource}
                  onDelete={handleDeleteSource}
                  onAddToQueue={handleAddToQueue}
                />
              )
            })}
          </div>
        )}
      </div>
      
      <CreateYouTubeModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      <EditYouTubeModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        source={editingSource}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-brand-card border-brand-line">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-headline-primary">
              Delete YouTube Source
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-primary">
              Are you sure you want to delete "{sourceToDelete?.videoTitle || 'this YouTube video'}"? 
              This action cannot be undone and will remove the extracted transcript data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSource}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete YouTube Source
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}