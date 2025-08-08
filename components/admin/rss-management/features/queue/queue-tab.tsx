"use client"

import { useState, useMemo, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QueueItemCard } from "./queue-item-card"
import { QueueFilters } from "./queue-filters"
import { BulkDeleteDialog } from "./bulk-delete-dialog"
import { DeduplicationDialog } from "./deduplication-dialog"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

type SortOption = 'newest' | 'oldest' | 'title' | 'source' | 'published'

export function QueueTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedItems, setSelectedItems] = useState<Set<Id<"rss_queue">>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeduplicationDialog, setShowDeduplicationDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDedupicating, setIsDeduplicating] = useState(false)
  const [articlesToDelete, setArticlesToDelete] = useState<any[]>([])

  // Always fetch all queue items (stable query)
  const allQueueItems = useQuery(api.rssQueue.getUnprocessedQueueWithProducers)
  const queueStats = useQuery(api.rssQueue.getQueueStats)
  
  // Mutations for delete operations
  const bulkDeleteMutation = useMutation(api.rssQueue.bulkDeleteQueueItems)
  const deleteQueueItemMutation = useMutation(api.rssQueue.deleteQueueItem)
  
  // Query for finding duplicates
  const duplicatesQuery = useQuery(
    api.rssQueue.findDuplicatesForDeduplication, 
    selectedItems.size > 0 ? { selectedIds: Array.from(selectedItems) } : "skip"
  )

  // Filter and sort items on frontend
  const sortedAndFilteredQueueItems = useMemo(() => {
    if (!allQueueItems) return []
    
    // First filter by search term
    let items = allQueueItems
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      )
    }

    // Then sort the filtered results
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'newest': 
          return b._creationTime - a._creationTime
        case 'oldest': 
          return a._creationTime - b._creationTime
        case 'title': 
          return a.title.localeCompare(b.title)
        case 'source': 
          return (a.producer?.name || '').localeCompare(b.producer?.name || '')
        case 'published':
          return b.publishedAt - a.publishedAt
        default: 
          return 0
      }
    })
  }, [allQueueItems, searchTerm, sortBy])

  const queueItems = sortedAndFilteredQueueItems

  // Selection management functions
  const handleSelectItem = useCallback((itemId: Id<"rss_queue">, isSelected: boolean) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev)
      if (isSelected) {
        newSelection.add(itemId)
      } else {
        newSelection.delete(itemId)
      }
      return newSelection
    })
  }, [])

  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems(new Set(queueItems.map(item => item._id)))
    } else {
      setSelectedItems(new Set())
    }
  }, [queueItems])

  // Bulk delete handlers
  const handleBulkDeleteClick = useCallback(() => {
    if (selectedItems.size > 0) {
      setShowDeleteDialog(true)
    }
  }, [selectedItems.size])

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (selectedItems.size === 0) return

    setIsDeleting(true)
    try {
      const itemIds = Array.from(selectedItems)
      const result = await bulkDeleteMutation({ itemIds })

      if (result.success) {
        toast.success(`Successfully deleted ${result.successCount} article${result.successCount === 1 ? '' : 's'}`)
        setSelectedItems(new Set()) // Clear selection
      } else {
        // Partial success
        if (result.successCount > 0) {
          toast.success(`Deleted ${result.successCount} articles, but ${result.failedCount} failed`)
          // Remove successfully deleted items from selection
          const newSelection = new Set(result.failedIds)
          setSelectedItems(newSelection)
        } else {
          toast.error(`Failed to delete articles: ${result.errors[0] || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('Failed to delete articles. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }, [selectedItems, bulkDeleteMutation])

  const handleBulkDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false)
  }, [])

  // Deduplication handlers
  const handleBulkDeduplicateClick = useCallback(() => {
    if (selectedItems.size < 2) {
      toast.error('Please select at least 2 articles to deduplicate')
      return
    }

    // Use the duplicates query result to show the dialog
    if (duplicatesQuery?.articlesToDelete) {
      setArticlesToDelete(duplicatesQuery.articlesToDelete)
      setShowDeduplicationDialog(true)
    } else {
      toast.error('Unable to analyze articles for duplicates. Please try again.')
    }
  }, [selectedItems.size, duplicatesQuery])

  const handleDeduplicationConfirm = useCallback(async () => {
    if (articlesToDelete.length === 0) {
      setShowDeduplicationDialog(false)
      return
    }

    setIsDeduplicating(true)
    try {
      const itemIds = articlesToDelete.map(item => item._id)
      const result = await bulkDeleteMutation({ itemIds })

      if (result.success) {
        toast.success(`Successfully removed ${result.successCount} duplicate article${result.successCount === 1 ? '' : 's'}`)
        setSelectedItems(new Set()) // Clear selection
        setArticlesToDelete([])
      } else {
        // Partial success
        if (result.successCount > 0) {
          toast.success(`Removed ${result.successCount} duplicates, but ${result.failedCount} failed`)
          // Remove successfully deleted items from selection and articlesToDelete
          const failedIdSet = new Set(result.failedIds)
          const newSelection = new Set(Array.from(selectedItems).filter(id => failedIdSet.has(id)))
          setSelectedItems(newSelection)
          setArticlesToDelete(articlesToDelete.filter(item => failedIdSet.has(item._id as Id<"rss_queue">)))
        } else {
          toast.error(`Failed to remove duplicates: ${result.errors[0] || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Deduplication error:', error)
      toast.error('Failed to remove duplicates. Please try again.')
    } finally {
      setIsDeduplicating(false)
      setShowDeduplicationDialog(false)
    }
  }, [articlesToDelete, bulkDeleteMutation, selectedItems])

  const handleDeduplicationCancel = useCallback(() => {
    setShowDeduplicationDialog(false)
    setArticlesToDelete([])
  }, [])

  // Individual delete handler
  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      const result = await deleteQueueItemMutation({ itemId: itemId as Id<"rss_queue"> })
      
      if (result.success) {
        toast.success('Article deleted successfully')
        // Remove from selection if it was selected
        setSelectedItems(prev => {
          const newSelection = new Set(prev)
          newSelection.delete(itemId as Id<"rss_queue">)
          return newSelection
        })
      }
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete article')
    }
  }, [deleteQueueItemMutation])

  // Selection state calculations
  const selectedCount = selectedItems.size
  const totalCount = queueItems.length

  const isLoading = queueItems === undefined || queueStats === undefined

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingAnimation size={80} className="py-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <QueueFilters
        searchTerm={searchTerm}
        sortBy={sortBy}
        resultCount={queueItems?.length || 0}
        onSearchChange={setSearchTerm}
        onSortChange={setSortBy}
        isLoading={isLoading || isDeleting || isDedupicating}
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSelectAll={handleSelectAll}
        onBulkDelete={handleBulkDeleteClick}
        onBulkDeduplicate={handleBulkDeduplicateClick}
        onBulkProcess={() => {
          // TODO: Implement bulk process functionality
          console.log('Bulk process:', Array.from(selectedItems))
        }}
        queueCount={queueStats?.unprocessed}
      />

      {queueItems.length === 0 ? (
        <Card className="bg-brand-card-dark border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-primary">
              {searchTerm.trim() ? 'No Search Results' : 'No Articles in Queue'}
            </CardTitle>
            <CardDescription className="text-body-primary">
              {searchTerm.trim() 
                ? `No articles found matching "${searchTerm}". Try a different search term.`
                : 'There are currently no articles waiting for processing. Articles will appear here when RSS producers add new content.'
              }
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {queueItems.map((item) => (
            <QueueItemCard 
              key={item._id} 
              queueItem={item}
              isSelected={selectedItems.has(item._id)}
              onSelectChange={(isSelected) => handleSelectItem(item._id, isSelected)}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <BulkDeleteDialog
        isOpen={showDeleteDialog}
        selectedCount={selectedCount}
        isLoading={isDeleting}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={handleBulkDeleteCancel}
      />

      {/* Deduplication Dialog */}
      <DeduplicationDialog
        isOpen={showDeduplicationDialog}
        articlesToDelete={articlesToDelete}
        isLoading={isDedupicating}
        onConfirm={handleDeduplicationConfirm}
        onCancel={handleDeduplicationCancel}
      />
    </div>
  )
}