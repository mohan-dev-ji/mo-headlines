"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProducerTab } from "./features/producer/producer-tab"
import { QueueTab } from "./features/queue/queue-tab"
import { QueueProvider } from "./features/queue/queue-provider"
import { QueueFiltersPane } from "./features/queue/queue-filters-pane"
import { QueueItemsPane } from "./features/queue/queue-items-pane"

export function RSSManagementSection() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentTab = searchParams.get("tab") || "producer"
  
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="container mx-auto p-[var(--padding-md)]">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="producer">Producer</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="producer" className="mt-[var(--space-between-items)]">
          <ProducerTab />
        </TabsContent>
        
        {/* Queue split panes: filters and items in separate contents */}
        <div className="mt-[var(--space-between-items)] flex flex-col h-[calc(100vh-145px)]">
          <QueueProvider>
            <TabsContent value="queue" className="p-0 h-auto overflow-visible shrink-0">
              <QueueFiltersPane />
            </TabsContent>
            <TabsContent value="queue" className="p-0 mt-[var(--space-between-items)] flex-1 min-h-0 h-auto overflow-hidden">
              <QueueItemsPane />
            </TabsContent>
          </QueueProvider>
        </div>
      </Tabs>
    </div>
  )
}