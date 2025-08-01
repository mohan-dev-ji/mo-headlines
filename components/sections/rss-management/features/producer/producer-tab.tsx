"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateProducerModal } from "./create-producer-modal"
import { EditProducerModal } from "./edit-producer-modal"
import { ProducerActionsDropdown } from "./producer-actions-dropdown"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

export function ProducerTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProducer, setEditingProducer] = useState<any>(null)
  const producers = useQuery(api.rssProducer.getAllProducersWithCategories)

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
    // Force a small delay to ensure Convex data has updated
    setTimeout(() => {
      console.log('Edit modal closed, data should be refreshed')
    }, 100)
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
            {producers.map((producer) => (
              <Card key={`${producer._id}-${producer.name}-${producer.updatedAt}`} className="bg-brand-card border-brand-line">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-headline-primary text-lg">
                        {producer.name}
                      </CardTitle>
                      <CardDescription className="text-body-secondary mt-1">
                        {producer.url}
                      </CardDescription>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="text-right">
                        <div className="text-sm text-body-secondary">Category: {producer.category?.name || 'Unknown'}</div>
                        <div className="text-sm text-body-secondary">Every {producer.pollFrequency} minutes</div>
                        {producer.category?.keywords && producer.category.keywords.length > 0 && (
                          <div className="text-xs text-body-greyed-out mt-1">
                            Keywords: {producer.category.keywords.slice(0, 3).join(', ')}
                            {producer.category.keywords.length > 3 && '...'}
                          </div>
                        )}
                      </div>
                      <ProducerActionsDropdown 
                        producer={{
                          _id: producer._id,
                          name: producer.name,
                          isActive: producer.isActive
                        }}
                        onEdit={() => handleEditProducer(producer._id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-sm text-body-secondary">Status: {producer.isActive ? '🟢 Active' : '🔴 Inactive'}</div>
                      <div className="text-sm text-body-secondary">
                        Last checked: {producer.lastPolled ? new Date(producer.lastPolled).toLocaleString() : 'Never'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-body-greyed-out">Feed Status: Not checked</div>
                      <div className="text-sm text-body-greyed-out">Category Status: Not checked</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
    </div>
  )
}