"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CreateProducerModal } from "./create-producer-modal"
import { EditProducerModal } from "./edit-producer-modal"
import { ProducerCard } from "./producer-card"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"


export function ProducerTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProducer, setEditingProducer] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [producerToDelete, setProducerToDelete] = useState<any>(null)
  const [runningProducers, setRunningProducers] = useState<Set<string>>(new Set())
  const producers = useQuery(api.rssProducer.getProducers, { includeCategory: true })
  const deleteProducer = useMutation(api.rssProducer.deleteProducer)
  const updateProducer = useMutation(api.rssProducer.updateProducer)
  const runProducerNow = useAction(api.rssProducer.runProducerNow)

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
      await deleteProducer({ id: producerToDelete._id as Id<"rss_producer"> })
      console.log('Producer deleted successfully')
      setIsDeleteDialogOpen(false)
      setProducerToDelete(null)
    } catch (error) {
      console.error('Failed to delete producer:', error)
      alert('Failed to delete producer. Please try again.')
    }
  }

  const handleToggleStatus = async (producerId: string) => {
    if (!producers || !Array.isArray(producers)) return
    const producer = producers.find(p => p._id === producerId)
    if (!producer) return

    try {
      const newStatus = !producer.isActive
      await updateProducer({ 
        id: producerId as Id<"rss_producer">, 
        isActive: newStatus 
      })
      
      console.log(`Producer ${newStatus ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      console.error('Failed to toggle producer status:', error)
      alert('Failed to update producer status. Please try again.')
    }
  }

  const handleRunNow = async (producerId: string) => {
    if (!producers || !Array.isArray(producers)) return
    const producer = producers.find(p => p._id === producerId)
    if (!producer) return

    // Add to running producers set
    setRunningProducers(prev => new Set([...prev, producerId]))

    try {
      console.log('Running producer:', producer.name)
      const result = await runProducerNow({ producerId: producerId as Id<"rss_producer"> })
      
      console.log('Producer run completed:', result)
    } catch (error) {
      console.error('Failed to run producer:', error)
    } finally {
      // Remove from running producers set
      setRunningProducers(prev => {
        const newSet = new Set(prev)
        newSet.delete(producerId)
        return newSet
      })
    }
  }


  return (
    <div className="h-full">
      <div className="flex justify-center mb-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create New Producer
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* Loading State */}
        {producers === undefined && (
          <div className="flex justify-center py-8">
            <div className="text-body-secondary">Loading producers...</div>
          </div>
        )}

        {/* Empty State */}
        {(!producers || (Array.isArray(producers) && producers.length === 0)) && (
          <Card className="bg-brand-card border-brand-line">
            <CardHeader className="text-center py-12">
              <CardTitle className="text-headline-primary">No Producers Yet</CardTitle>
              <CardDescription className="text-body-secondary">
                Create your first RSS producer to start monitoring feeds and generating content.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Producer Cards */}
        {producers && Array.isArray(producers) && producers.length > 0 && (
          <div className="grid gap-4">
            {producers.map((producer) => {
              return (
                <ProducerCard
                  key={`${producer._id}-${producer.name}-${producer.updatedAt}`}
                  producer={producer}
                  category={(producer as any).category}
                  onEdit={handleEditProducer}
                  onDelete={handleDeleteProducer}
                  onToggleStatus={handleToggleStatus}
                  onRunNow={handleRunNow}
                  isRunning={runningProducers.has(producer._id)}
                />
              )
            })}
          </div>
        )}
      </div>
      
      <CreateProducerModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      
      <EditProducerModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        producer={editingProducer}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-brand-card border-brand-line">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-headline-primary">
              Delete RSS Producer
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
              Delete Producer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}