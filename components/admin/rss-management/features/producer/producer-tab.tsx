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

interface RunResult {
  success: boolean
  feedStatus: 'live' | 'not_live'
  categoryStatus: 'found' | 'not_found' | null
  articlesFound: number
  articlesQueued: number
  articles: Array<{
    title: string
    url: string
    publishedAt: string
    excerpt: string
  }>
  lastRun: number
  error?: string
}

export function ProducerTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProducer, setEditingProducer] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [producerToDelete, setProducerToDelete] = useState<any>(null)
  const [countdowns, setCountdowns] = useState<Record<string, number>>({})
  const [runResults, setRunResults] = useState<Record<string, RunResult>>({})
  const [runningProducers, setRunningProducers] = useState<Set<string>>(new Set())
  const producers = useQuery(api.rssProducer.getAllProducers)
  const categories = useQuery(api.categories.getAllCategories)
  const deleteProducer = useMutation(api.rssProducer.deleteProducer)
  const toggleProducerStatus = useMutation(api.rssProducer.toggleProducerStatus)
  const runProducerNow = useAction(api.rssProducer.runProducerNow)

  const handleEditProducer = (producerId: string) => {
    const producer = producers?.find(p => p._id === producerId)
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
        producers?.map(p => ({ name: p.name, updatedAt: p.updatedAt }))
      )
    }, 200) // Increased delay to ensure DB write + query refetch completes
  }

  const handleDeleteProducer = (producerId: string) => {
    const producer = producers?.find(p => p._id === producerId)
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
    const producer = producers?.find(p => p._id === producerId)
    if (!producer) return

    try {
      const newStatus = !producer.isActive
      await toggleProducerStatus({ 
        id: producerId as Id<"rss_producer">, 
        isActive: newStatus 
      })
      
      // If enabling, start countdown from pollFrequency
      // If disabling, remove countdown
      if (newStatus) {
        setCountdowns(prev => ({
          ...prev,
          [producerId]: producer.pollFrequency * 60 // Convert minutes to seconds
        }))
      } else {
        setCountdowns(prev => {
          const newCountdowns = { ...prev }
          delete newCountdowns[producerId]
          return newCountdowns
        })
      }
      
      console.log(`Producer ${newStatus ? 'enabled' : 'disabled'} successfully`)
    } catch (error) {
      console.error('Failed to toggle producer status:', error)
      alert('Failed to update producer status. Please try again.')
    }
  }

  const handleRunNow = async (producerId: string) => {
    const producer = producers?.find(p => p._id === producerId)
    if (!producer) return

    // Add to running producers set
    setRunningProducers(prev => new Set([...prev, producerId]))

    try {
      console.log('Running producer:', producer.name)
      const result = await runProducerNow({ producerId: producerId as Id<"rss_producer"> })
      
      // Store the run result
      setRunResults(prev => ({
        ...prev,
        [producerId]: result as RunResult
      }))

      console.log('Producer run completed:', result)
    } catch (error) {
      console.error('Failed to run producer:', error)
      
      // Store error result
      setRunResults(prev => ({
        ...prev,
        [producerId]: {
          success: false,
          feedStatus: 'not_live',
          categoryStatus: null,
          articlesFound: 0,
          articlesQueued: 0,
          articles: [],
          lastRun: Date.now(),
          error: error instanceof Error ? error.message : 'Failed to run producer'
        }
      }))
    } finally {
      // Remove from running producers set
      setRunningProducers(prev => {
        const newSet = new Set(prev)
        newSet.delete(producerId)
        return newSet
      })
    }
  }

  // Effect to manage countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prev => {
        const newCountdowns = { ...prev }
        let hasChanges = false
        
        Object.keys(newCountdowns).forEach(producerId => {
          if (newCountdowns[producerId] > 0) {
            newCountdowns[producerId] -= 1
            hasChanges = true
          } else {
            // When countdown reaches 0, trigger run and reset countdown
            const producer = producers?.find(p => p._id === producerId)
            if (producer?.isActive && !runningProducers.has(producerId)) {
              // Trigger the run
              handleRunNow(producerId)
              // Reset countdown
              newCountdowns[producerId] = producer.pollFrequency * 60
              hasChanges = true
            }
          }
        })
        
        return hasChanges ? newCountdowns : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [producers, runningProducers])

  // Effect to initialize countdowns for active producers
  useEffect(() => {
    if (producers) {
      const newCountdowns: Record<string, number> = {}
      producers.forEach(producer => {
        if (producer.isActive) {
          // If we don't already have a countdown for this producer, start one
          if (!(producer._id in countdowns)) {
            newCountdowns[producer._id] = producer.pollFrequency * 60
          }
        }
      })
      
      if (Object.keys(newCountdowns).length > 0) {
        setCountdowns(prev => ({
          ...prev,
          ...newCountdowns
        }))
      }
    }
  }, [producers])

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
        {producers?.length === 0 && (
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
        {producers && producers.length > 0 && (
          <div className="grid gap-4">
            {producers.map((producer) => {
              const category = categories?.find(cat => cat._id === producer.categoryId)
              return (
                <ProducerCard
                  key={`${producer._id}-${producer.name}-${producer.updatedAt}`}
                  producer={producer}
                  category={category}
                  onEdit={handleEditProducer}
                  onDelete={handleDeleteProducer}
                  onToggleStatus={handleToggleStatus}
                  onRunNow={handleRunNow}
                  countdown={countdowns[producer._id]}
                  runResult={runResults[producer._id]}
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