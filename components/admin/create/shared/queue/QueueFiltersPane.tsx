"use client"

import { QueueFilters } from "./queue-filters"
import { useQueue } from "./QueueProvider"

export function QueueFiltersPane() {
  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    isLoading,
    selectedCount,
    totalCount,
    handleSelectAll,
    handleBulkDeleteClick,
    handleBulkDeduplicateClick,
    queueStats,
  } = useQueue()

  return (
    <div className="shrink-0 bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)]">
      <QueueFilters
        searchTerm={searchTerm}
        sortBy={sortBy}
        resultCount={totalCount}
        onSearchChange={setSearchTerm}
        onSortChange={setSortBy}
        isLoading={isLoading}
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSelectAll={handleSelectAll}
        onBulkDelete={handleBulkDeleteClick}
        onBulkDeduplicate={handleBulkDeduplicateClick}
        onBulkProcess={() => {
          // TODO: implement bulk process
          console.log("Bulk process pending")
        }}
        queueCount={queueStats?.pending}
      />
    </div>
  )
}


