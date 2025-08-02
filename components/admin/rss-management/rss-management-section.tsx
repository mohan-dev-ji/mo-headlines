"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProducerTab } from "./features/producer/producer-tab"
import { QueueTab } from "./features/queue/queue-tab"
import { ConsumerTab } from "./features/consumer/consumer-tab"

export function RSSManagementSection() {
  return (
    <div className="container mx-auto p-[var(--padding-md)]">
      <Tabs defaultValue="producer" className="w-full">
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