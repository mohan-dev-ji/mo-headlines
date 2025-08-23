"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RssTab } from "./rss/RssTab"
import { QueueProvider } from "./shared/queue/QueueProvider"
import { QueueFiltersPane } from "./shared/queue/QueueFiltersPane"
import { QueueItemsPane } from "./shared/queue/QueueItemsPane"

export function CreateLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentTab = searchParams.get("tab") || "rss"
  
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <QueueProvider>
      <div className="container mx-auto p-[var(--padding-md)]">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="rss">RSS Sources</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
          </TabsList>
          
          {/* RSS, Research, YouTube tabs - only show wrapper when one of these is active */}
          {(currentTab === "rss" || currentTab === "research" || currentTab === "youtube") && (
            <div className="mt-[var(--space-between-items)] flex flex-col h-[calc(100vh-145px)]">
              <TabsContent value="rss" className="p-0 flex-1 min-h-0 overflow-hidden">
                <RssTab />
              </TabsContent>
              
              <TabsContent value="research" className="p-0 flex-1 min-h-0 overflow-hidden">
                <div className="h-full flex justify-center items-center">
                  <div className="text-body-secondary">Research workflow coming soon...</div>
                </div>
              </TabsContent>
              
              <TabsContent value="youtube" className="p-0 flex-1 min-h-0 overflow-hidden">
                <div className="h-full flex justify-center items-center">
                  <div className="text-body-secondary">YouTube workflow coming soon...</div>
                </div>
              </TabsContent>
            </div>
          )}
          
          {/* Queue split panes - only show wrapper when queue is active */}
          {currentTab === "queue" && (
            <div className="mt-[var(--space-between-items)] flex flex-col h-[calc(100vh-145px)]">
              <TabsContent value="queue" className="p-0 h-auto overflow-visible shrink-0">
                <QueueFiltersPane />
              </TabsContent>
              <TabsContent value="queue" className="p-0 mt-[var(--space-between-items)] flex-1 min-h-0 h-auto overflow-hidden">
                <QueueItemsPane />
              </TabsContent>
            </div>
          )}
        </Tabs>
      </div>
    </QueueProvider>
  )
}