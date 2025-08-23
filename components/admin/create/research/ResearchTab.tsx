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
import { CreateResearchModal } from "./CreateResearchModal"
import { EditResearchModal } from "./EditResearchModal"
import { ResearchProducerCard } from "./ResearchProducerCard"
import { useQuery, useMutation } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { LoadingAnimation } from "@/components/ui/loading-animation"

export function ResearchTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sourceToDelete, setSourceToDelete] = useState<any>(null)
  const sources = useQuery(api.createResearch.getResearchSources)
  const deleteSource = useMutation(api.createResearch.deleteResearchSource)
  const addToQueue = useMutation(api.createResearch.addResearchToQueue)

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
      console.log('📊 Current research sources updatedAt timestamps:', 
        Array.isArray(sources) ? sources.map(s => ({ title: s.title, updatedAt: s.updatedAt })) : []
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
      await deleteSource({ id: sourceToDelete._id as Id<"create_research"> })
      console.log('Research source deleted successfully')
      toast.success(`Deleted research source "${sourceToDelete.title}"`)
      setIsDeleteDialogOpen(false)
      setSourceToDelete(null)
    } catch (error) {
      console.error('Failed to delete research source:', error)
      toast.error('Failed to delete research source. Please try again.')
    }
  }

  const handleAddToQueue = async (sourceId: string) => {
    if (!sources || !Array.isArray(sources)) return
    const source = sources.find(s => s._id === sourceId)
    if (!source) return

    try {
      console.log('Adding research to queue:', source.title)
      const result = await addToQueue({ sourceId: sourceId as Id<"create_research"> })
      
      if (result.success) {
        console.log(`✅ Added research to queue: ${source.title}`)
        toast.success(`Added "${source.title}" to queue`)
      } else {
        console.log(`⚠️ ${result.message}`)
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Failed to add research to queue:', error)
      toast.error('Failed to add research to queue. Please try again.')
    }
  }

  return (
    <div className="h-full min-h-0 overflow-auto bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)]">
      <div className="flex justify-center mb-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create New Research Source
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
              <CardTitle className="text-headline-primary">No Research Sources Yet</CardTitle>
              <CardDescription className="text-body-secondary">
                Create your first research source to start investigating topics and generating content.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Research Source Cards */}
        {sources && Array.isArray(sources) && sources.length > 0 && (
          <div className="grid gap-4">
            {sources.map((source) => {
              return (
                <ResearchProducerCard
                  key={`${source._id}-${source.title}-${source.updatedAt}`}
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
      
      <CreateResearchModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      <EditResearchModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        source={editingSource}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-brand-card border-brand-line">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-headline-primary">
              Delete Research Source
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-primary">
              Are you sure you want to delete "{sourceToDelete?.title}"? 
              This action cannot be undone and will also remove all related queue items.
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
              Delete Research Source
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}