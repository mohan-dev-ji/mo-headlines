"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ReviewTabSystem } from "./ReviewTabSystem"
import { PendingTab } from "./PendingTab"
import { ApprovedTab } from "./ApprovedTab"
import { RejectedTab } from "./RejectedTab"
import { DraftsTab } from "./DraftsTab"

export function ReviewLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentTab = searchParams.get("tab") || "pending"
  
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="container mx-auto">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <ReviewTabSystem />
        
        <div className="mt-[var(--space-between-items)] h-[calc(100vh-145px)] overflow-hidden">
          <TabsContent value="pending" className="p-0 h-full overflow-hidden">
            <PendingTab />
          </TabsContent>
          
          <TabsContent value="approved" className="p-0 h-full overflow-y-auto">
            <ApprovedTab />
          </TabsContent>
          
          <TabsContent value="rejected" className="p-0 h-full overflow-y-auto">
            <RejectedTab />
          </TabsContent>
          
          <TabsContent value="drafts" className="p-0 h-full overflow-y-auto">
            <DraftsTab />
          </TabsContent>
          
          <TabsContent value="create" className="p-0 h-full overflow-hidden">
            <div className="flex items-center justify-center h-full text-body-secondary">
              Create tab - Coming soon
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}