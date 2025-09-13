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
import { CreateRssModal } from "./CreateRssModal"
import { EditRssModal } from "./EditRssModal"
import { RssProducerCard } from "./RssProducerCard"
import { useQuery, useMutation, useAction } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { LoadingAnimation } from "@/components/ui/loading-animation"


export function RssTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProducer, setEditingProducer] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [producerToDelete, setProducerToDelete] = useState<any>(null)
  const [runningProducers] = useState<Set<string>>(new Set())
  const producers = useQuery(api.createRss.getRssSources, { includeCategory: true })
  const deleteProducer = useMutation(api.createRss.deleteRssSource)
  const updateProducer = useMutation(api.createRss.updateRssSource)
  const addToQueue = useMutation(api.createRss.addRssMatchesToQueue)
  const refreshFeed = useAction(api.createRss.testAndUpdateRssSource)
  

  const handleEditProducer = (producerId: string) => {
    if (!producers || !Array.isArray(producers)) return
    const producer = producers.find(p => p._id === producerId)
    if (producer) {
      setEditingProducer(producer)
      setIsEditModalOpen(true)
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingProducer(null)
    
    // Force a delay to ensure Convex reactive query picks up the DB changes
    // This should trigger a re-render with the new updatedAt timestamp
    setTimeout(() => {
      console.log('🔄 Edit modal closed - Convex should have refetched with new updatedAt')
      console.log('📊 Current producers updatedAt timestamps:', 
        Array.isArray(producers) ? producers.map(p => ({ name: p.name, updatedAt: p.updatedAt })) : []
      )
    }, 200) // Increased delay to ensure DB write + query refetch completes
  }

  const handleDeleteProducer = (producerId: string) => {
    if (!producers || !Array.isArray(producers)) return
    const producer = producers.find(p => p._id === producerId)
    if (!producer) return

    setProducerToDelete(producer)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteProducer = async () => {
    if (!producerToDelete) return

    try {
      await deleteProducer({ id: producerToDelete._id as Id<"create_rss"> })
      console.log('RSS source deleted successfully')
      setIsDeleteDialogOpen(false)
      setProducerToDelete(null)
    } catch (error) {
      console.error('Failed to delete RSS source:', error)
      alert('Failed to delete RSS source. Please try again.')
    }
  }

  const handleToggleStatus = async (producerId: string) => {
    if (!producers || !Array.isArray(producers)) return
    const producer = producers.find(p => p._id === producerId)
    if (!producer) return

    try {
      const newStatus = !producer.isActive
      await updateProducer({ 
        id: producerId as Id<"create_rss">, 
        isActive: newStatus
      })
      
      console.log(`RSS source ${newStatus ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      console.error('Failed to toggle RSS source status:', error)
      alert('Failed to update RSS source status. Please try again.')
    }
  }

  const handleAddToQueue = async (producerId: string, selectedArticles: Array<{title: string, url: string, description: string, pubDate: string}>) => {
    if (!producers || !Array.isArray(producers)) return
    const producer = producers.find(p => p._id === producerId)
    if (!producer) return

    try {
      const selectionText = selectedArticles.length > 0 ? `${selectedArticles.length} selected` : 'all matched'
      console.log(`Adding ${selectionText} RSS articles to queue:`, producer.name)

      const result = await addToQueue({
        sourceId: producerId as Id<"create_rss">,
        selectedArticles: selectedArticles.length > 0 ? selectedArticles : undefined
      })

      if (result.success) {
        console.log(`✅ Added ${result.count} articles to queue from ${producer.name}`)
        toast.success(`Added ${result.count} article${result.count === 1 ? '' : 's'} to queue from "${producer.name}"`)
      } else {
        console.log(`⚠️ ${result.message}`)
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Failed to add RSS matches to queue:', error)
      toast.error('Failed to add articles to queue. Please try again.')
    }
  }

  const handleRefresh = async (producerId: string) => {
    if (!producers || !Array.isArray(producers)) return
    const producer = producers.find(p => p._id === producerId)
    if (!producer) return

    try {
      console.log('Refreshing RSS feed:', producer.name)
      toast.loading('Refreshing feed...', { id: `refresh-${producerId}` })
      
      await refreshFeed({
        sourceId: producerId as Id<"create_rss">,
        feedUrl: producer.feedUrl || producer.url || "",
        maxArticles: 10,
      })
      
      console.log(`✅ Refreshed feed: ${producer.name}`)
      toast.success(`Refreshed feed "${producer.name}"`, { id: `refresh-${producerId}` })
    } catch (error) {
      console.error('Failed to refresh RSS feed:', error)
      toast.error('Failed to refresh feed. Please try again.', { id: `refresh-${producerId}` })
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
          Create New RSS Source
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Loading State */}
        {producers === undefined && (
          <div className="flex justify-center py-8">
            <LoadingAnimation />
          </div>
        )}

        {/* Empty State */}
        {producers && Array.isArray(producers) && producers.length === 0 && (
          <Card className="bg-brand-card border-brand-line">
            <CardHeader className="text-center py-12">
              <CardTitle className="text-headline-primary">No RSS Sources Yet</CardTitle>
              <CardDescription className="text-body-secondary">
                Create your first RSS source to start monitoring feeds and generating content.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* RSS Producer Cards */}
        {producers && Array.isArray(producers) && producers.length > 0 && (
          <div className="grid gap-4">
            {producers.map((producer) => {
              return (
                <RssProducerCard
                  key={`${producer._id}-${producer.name}-${producer.updatedAt}`}
                  producer={producer}
                  category={(producer as any).category}
                  onEdit={handleEditProducer}
                  onDelete={handleDeleteProducer}
                  onToggleStatus={handleToggleStatus}
                  onAddToQueue={handleAddToQueue}
                  onRefresh={handleRefresh}
                  isRunning={runningProducers.has(producer._id)}
                />
              )
            })}
          </div>
        )}
      </div>
      
      <CreateRssModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      <EditRssModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        producer={editingProducer}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-brand-card border-brand-line">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-headline-primary">
              Delete RSS Source
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-primary">
              Are you sure you want to delete "{producerToDelete?.name}"? 
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
              onClick={confirmDeleteProducer}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete RSS Source
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}