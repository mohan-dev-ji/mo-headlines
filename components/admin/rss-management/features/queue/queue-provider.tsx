"use client"

import { createContext, useContext, useMemo, useState, useCallback, ReactNode } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"

type SortOption = 'newest' | 'oldest' | 'title' | 'source' | 'published'

type QueueContextValue = {
  // state
  searchTerm: string
  setSearchTerm: (v: string) => void
  sortBy: SortOption
  setSortBy: (v: SortOption) => void
  selectedItems: Set<Id<"rss_queue">>
  setSelectedItems: (v: Set<Id<"rss_queue">>) => void
  showDeleteDialog: boolean
  setShowDeleteDialog: (v: boolean) => void
  showDeduplicationDialog: boolean
  setShowDeduplicationDialog: (v: boolean) => void
  isDeleting: boolean
  isDeduplicating: boolean
  articlesToDelete: any[]
  setArticlesToDelete: (v: any[]) => void

  // data
  queueStats: { total: number; unprocessed: number; processed: number } | undefined
  queueItems: any[]
  isLoading: boolean

  // counts
  selectedCount: number
  totalCount: number

  // actions
  handleSelectItem: (itemId: Id<"rss_queue">, isSelected: boolean) => void
  handleSelectAll: (isSelected: boolean) => void
  handleBulkDeleteClick: () => void
  handleBulkDeleteConfirm: () => Promise<void>
  handleBulkDeleteCancel: () => void
  handleBulkDeduplicateClick: () => void
  handleDeduplicationConfirm: () => Promise<void>
  handleDeduplicationCancel: () => void
  handleDeleteItem: (itemId: string) => Promise<void>
}

const QueueContext = createContext<QueueContextValue | null>(null)

export function useQueue(): QueueContextValue {
  const ctx = useContext(QueueContext)
  if (!ctx) throw new Error("useQueue must be used within QueueProvider")
  return ctx
}

export function QueueProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [selectedItems, setSelectedItems] = useState<Set<Id<"rss_queue">>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeduplicationDialog, setShowDeduplicationDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeduplicating, setIsDeduplicating] = useState(false)
  const [articlesToDelete, setArticlesToDelete] = useState<any[]>([])

  // data
  const allQueueItems = useQuery(api.rssQueue.getUnprocessedQueueWithProducers)
  const queueStats = useQuery(api.rssQueue.getQueueStats)

  const bulkDeleteMutation = useMutation(api.rssQueue.bulkDeleteQueueItems)
  const deleteQueueItemMutation = useMutation(api.rssQueue.deleteQueueItem)

  const duplicatesQuery = useQuery(
    api.rssQueue.findDuplicatesForDeduplication,
    selectedItems.size > 0 ? { selectedIds: Array.from(selectedItems) } : "skip"
  )

  // derived
  const queueItems = useMemo(() => {
    if (!allQueueItems) return []
    let items = allQueueItems
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      )
    }

    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b._creationTime - a._creationTime
        case 'oldest': return a._creationTime - b._creationTime
        case 'title': return a.title.localeCompare(b.title)
        case 'source': return (a.producer?.name || '').localeCompare(b.producer?.name || '')
        case 'published': return b.publishedAt - a.publishedAt
        default: return 0
      }
    })
  }, [allQueueItems, searchTerm, sortBy])

  const isLoading = queueItems === undefined || queueStats === undefined

  const handleSelectItem = useCallback((itemId: Id<"rss_queue">, isSelected: boolean) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (isSelected) next.add(itemId)
      else next.delete(itemId)
      return next
    })
  }, [])

  const handleSelectAll = useCallback((isSelected: boolean) => {
    if (isSelected) setSelectedItems(new Set(queueItems.map(i => i._id)))
    else setSelectedItems(new Set())
  }, [queueItems])

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedItems.size > 0) setShowDeleteDialog(true)
  }, [selectedItems.size])

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (selectedItems.size === 0) return
    setIsDeleting(true)
    try {
      const itemIds = Array.from(selectedItems)
      const result = await bulkDeleteMutation({ itemIds })
      if (result.success) {
        toast.success(`Successfully deleted ${result.successCount} article${result.successCount === 1 ? '' : 's'}`)
        setSelectedItems(new Set())
      } else {
        if (result.successCount > 0) {
          toast.success(`Deleted ${result.successCount} articles, but ${result.failedCount} failed`)
          const newSelection = new Set(result.failedIds)
          setSelectedItems(newSelection)
        } else {
          toast.error(`Failed to delete articles: ${result.errors[0] || 'Unknown error'}`)
        }
      }
    } catch (e) {
      console.error('Bulk delete error:', e)
      toast.error('Failed to delete articles. Please try again.')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }, [selectedItems, bulkDeleteMutation])

  const handleBulkDeleteCancel = useCallback(() => setShowDeleteDialog(false), [])

  const handleBulkDeduplicateClick = useCallback(() => {
    if (selectedItems.size < 2) {
      toast.error('Please select at least 2 articles to deduplicate')
      return
    }
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
        setSelectedItems(new Set())
        setArticlesToDelete([])
      } else {
        if (result.successCount > 0) {
          toast.success(`Removed ${result.successCount} duplicates, but ${result.failedCount} failed`)
          const failedIdSet = new Set(result.failedIds)
          const newSelection = new Set(Array.from(selectedItems).filter(id => failedIdSet.has(id)))
          setSelectedItems(newSelection)
          setArticlesToDelete(articlesToDelete.filter(item => failedIdSet.has(item._id as Id<"rss_queue">)))
        } else {
          toast.error(`Failed to remove duplicates: ${result.errors[0] || 'Unknown error'}`)
        }
      }
    } catch (e) {
      console.error('Deduplication error:', e)
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

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      const result = await deleteQueueItemMutation({ itemId: itemId as Id<"rss_queue"> })
      if (result.success) {
        toast.success('Article deleted successfully')
        setSelectedItems(prev => {
          const newSelection = new Set(prev)
          newSelection.delete(itemId as Id<"rss_queue">)
          return newSelection
        })
      }
    } catch (e) {
      console.error('Delete failed:', e)
      toast.error('Failed to delete article')
    }
  }, [deleteQueueItemMutation])

  const value: QueueContextValue = {
    searchTerm, setSearchTerm,
    sortBy, setSortBy,
    selectedItems, setSelectedItems,
    showDeleteDialog, setShowDeleteDialog,
    showDeduplicationDialog, setShowDeduplicationDialog,
    isDeleting, isDeduplicating,
    articlesToDelete, setArticlesToDelete,
    queueStats,
    queueItems,
    isLoading,
    selectedCount: selectedItems.size,
    totalCount: queueItems.length,
    handleSelectItem,
    handleSelectAll,
    handleBulkDeleteClick,
    handleBulkDeleteConfirm,
    handleBulkDeleteCancel,
    handleBulkDeduplicateClick,
    handleDeduplicationConfirm,
    handleDeduplicationCancel,
    handleDeleteItem,
  }

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
}


