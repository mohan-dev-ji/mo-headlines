"use client"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DarkDropdown } from "@/components/ui/dark-dropdown"
import { Search } from "lucide-react"

export type SortOption = string

export type ActionItem = {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: "destructive" | "default"
  icon?: React.ReactNode
}

interface ArticleFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  sortOptions: { value: SortOption; label: string }[]
  isLoading?: boolean

  // selection state
  selectedCount: number
  totalCount: number
  onSelectAll: (isSelected: boolean) => void

  // bulk actions definitions
  actionItems?: ActionItem[]

  // result/info
  resultCount?: number
}

export function ArticleFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOptions,
  isLoading = false,
  selectedCount,
  totalCount,
  onSelectAll,
  actionItems = [],
  resultCount,
}: ArticleFiltersProps) {
  const isAllSelected = totalCount > 0 && selectedCount === totalCount
  const hasSelection = selectedCount > 0

  const bulkActionItems = [
    {
      label: isAllSelected ? "Deselect All" : `Select All (${totalCount})`,
      onClick: () => onSelectAll(!isAllSelected),
      disabled: isLoading || totalCount === 0,
    },
    ...actionItems.map((it) => ({ ...it, disabled: isLoading || it.disabled })),
  ]

  return (
    <div className="flex flex-col md:flex-row items-start sm:items-center gap-4">
      {/* Search */}
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

      {/* Sort */}
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

      {/* Bulk actions */}
      <DarkDropdown
        mode="action"
        trigger="Bulk Actions"
        items={bulkActionItems}
        disabled={isLoading || (actionItems.length === 0 && totalCount === 0)}
        width="w-full md:w-[180px]"
        align="right"
      />

      {/* Result count */}
      {searchTerm.trim() && (
        <Badge variant="outline" className="shrink-0">
          {resultCount ?? 0} results found
        </Badge>
      )}

      {/* Selection count */}
      {hasSelection && (
        <Badge variant="secondary" className="shrink-0 bg-blue-600/20 text-blue-400 border-blue-600/30">
          {selectedCount} selected
        </Badge>
      )}
    </div>
  )
}


