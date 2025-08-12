"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PendingTab from "./features/pending/pending-tab"
import ApprovedTab from "./features/approved/approved-tab"

export function ArticleManagementSection() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentTab = searchParams.get("tab") || "approved"
  
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="container mx-auto p-[var(--padding-md)]">
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-[var(--space-between-items)]">
          <PendingTab />
        </TabsContent>
        
        <TabsContent value="approved" className="mt-[var(--space-between-items)]">
          <ApprovedTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}