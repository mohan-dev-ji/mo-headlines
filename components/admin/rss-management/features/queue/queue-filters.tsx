"use client"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DarkDropdown } from "@/components/ui/dark-dropdown"
import { Search, Trash2, Play, CheckSquare } from "lucide-react"

type SortOption = 'newest' | 'oldest' | 'title' | 'source' | 'published'

interface QueueFiltersProps {
  searchTerm: string
  sortBy: SortOption
  resultCount: number
  onSearchChange: (term: string) => void
  onSortChange: (sort: SortOption) => void
  isLoading?: boolean
  // Selection props (simplified)
  selectedCount: number
  totalCount: number
  onSelectAll: (isSelected: boolean) => void
  // Bulk action handlers
  onBulkDelete?: () => void
  onBulkProcess?: () => void
  // Queue count
  queueCount?: number
}

export function QueueFilters({ 
  searchTerm, 
  sortBy, 
  resultCount,
  onSearchChange, 
  onSortChange, 
  isLoading = false,
  selectedCount,
  totalCount,
  onSelectAll,
  onBulkDelete,
  onBulkProcess,
  queueCount
}: QueueFiltersProps) {
  // Calculate selection state locally
  const isAllSelected = totalCount > 0 && selectedCount === totalCount
  const hasSelection = selectedCount > 0

  // Sort options for select mode
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'source', label: 'Source' },
    { value: 'published', label: 'Published' }
  ]

  // Build action items for bulk actions
  const bulkActionItems = [
    {
      label: isAllSelected ? 'Deselect All' : `Select All (${totalCount})`,
      onClick: () => onSelectAll(!isAllSelected),
      disabled: isLoading || totalCount === 0,
      icon: <CheckSquare className="h-4 w-4" />
    },
    ...(onBulkProcess ? [{
      label: `Process Selected ${hasSelection ? `(${selectedCount})` : ''}`,
      onClick: onBulkProcess,
      disabled: !hasSelection || isLoading,
      icon: <Play className="h-4 w-4" />
    }] : []),
    ...(onBulkDelete ? [{
      label: `Delete Selected ${hasSelection ? `(${selectedCount})` : ''}`,
      onClick: onBulkDelete,
      disabled: !hasSelection || isLoading,
      variant: "destructive" as const,
      icon: <Trash2 className="h-4 w-4" />
    }] : [])
  ]
  return (
    <div className="flex flex-col md:flex-row items-start sm:items-center gap-4">
      {/* Search Input */}
      <div className="relative w-full md:w-[180px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-body-greyed-out h-4 w-4" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={isLoading}
          className="pl-10 bg-brand-card-dark border-brand-line-dark text-headline-primary placeholder:text-body-greyed-out"
        />
      </div>
      
      {/* Sort Dropdown */}
      <DarkDropdown
        mode="select"
        trigger="Sort by"
        value={sortBy}
        onValueChange={(value) => onSortChange(value as SortOption)}
        options={sortOptions}
        disabled={isLoading}
        width="w-full md:w-[180px]"
        align="left"
      />

      {/* Bulk Actions Dropdown */}
      <DarkDropdown
        mode="action"
        trigger="Bulk Actions"
        items={bulkActionItems}
        disabled={isLoading}
        width="w-full md:w-[180px]"
        align="right"
      />

      {/* Results Count Badge */}
      {searchTerm.trim() && (
        <Badge variant="outline" className="shrink-0">
          {resultCount} results found
        </Badge>
      )}
      
      {/* Selection Count Badge */}
      {hasSelection && (
        <Badge variant="secondary" className="shrink-0 bg-blue-600/20 text-blue-400 border-blue-600/30">
          {selectedCount} selected
        </Badge>
      )}
      
      {/* Queue Count Display */}
      <div className="shrink-0 text-body-greyed-out text-sm">
        {queueCount !== undefined ? (
          `${queueCount} ${queueCount === 1 ? 'item' : 'items'} in queue`
        ) : (
          'Loading...'
        )}
      </div>
    </div>
  )
}