"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProducerTab } from "./features/producer/producer-tab"
import { QueueTab } from "./features/queue/queue-tab"
import { ConsumerTab } from "./features/consumer/consumer-tab"

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
          <TabsTrigger value="consumer">Consumer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="producer" className="mt-[var(--space-between-items)]">
          <ProducerTab />
        </TabsContent>
        
        <TabsContent value="queue" className="mt-[var(--space-between-items)]">
          <QueueTab />
        </TabsContent>
        
        <TabsContent value="consumer" className="mt-[var(--space-between-items)]">
          <ConsumerTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}