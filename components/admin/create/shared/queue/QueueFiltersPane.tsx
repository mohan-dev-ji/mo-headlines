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
    handleBulkProcessClick,
    isBulkProcessing,
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
        isLoading={isLoading || isBulkProcessing}
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSelectAll={handleSelectAll}
        onBulkDelete={handleBulkDeleteClick}
        onBulkDeduplicate={handleBulkDeduplicateClick}
        onBulkProcess={handleBulkProcessClick}
        queueCount={queueStats?.pending}
      />
    </div>
  )
}


