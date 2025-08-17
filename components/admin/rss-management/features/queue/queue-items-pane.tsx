"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { QueueItemCard } from "./queue-item-card"
import { useQueue } from "./queue-provider"

export function QueueItemsPane() {
  const {
    queueItems,
    isLoading,
    selectedItems,
    handleSelectItem,
    handleDeleteItem,
    searchTerm,
  } = useQueue() as any

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingAnimation size={80} />
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 overflow-auto bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)]">
      {queueItems.length === 0 ? (
        <Card className="bg-brand-card-dark border-brand-line">
          <CardHeader>
            <CardTitle className="text-headline-primary">
              {searchTerm?.trim() ? 'No Search Results' : 'No Articles in Queue'}
            </CardTitle>
            <CardDescription className="text-body-primary">
              {searchTerm?.trim()
                ? `No articles found matching "${searchTerm}". Try a different search term.`
                : 'There are currently no articles waiting for processing. Articles will appear here when RSS producers add new content.'}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {queueItems.map((item: any) => (
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
    </div>
  )
}


