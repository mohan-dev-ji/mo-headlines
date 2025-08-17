"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArticleFilters } from "./features/common/article-filters"
import { ArticlesListSkeleton } from "./features/common/articles-list-skeleton"

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
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>
        
        {/* Pending split panes */}
        <div className="mt-[var(--space-between-items)] flex flex-col h-[calc(100vh-145px)]">
          <TabsContent value="pending" className="p-0 h-auto overflow-visible shrink-0">
            <div className="bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)]">
              <ArticleFilters
                searchTerm={""}
                onSearchChange={() => {}}
                sortBy={"newest"}
                onSortChange={() => {}}
                sortOptions={[
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                  { value: "title", label: "Title A-Z" },
                  { value: "category", label: "Category" },
                ]}
                selectedCount={0}
                totalCount={0}
                onSelectAll={() => {}}
                actionItems={[{ label: "Approve Selected", onClick: () => {} }, { label: "Reject Selected", onClick: () => {} }]}
              />
            </div>
          </TabsContent>
          <TabsContent value="pending" className="p-0 mt-[var(--space-between-items)] flex-1 min-h-0 h-auto overflow-hidden">
            <ArticlesListSkeleton status="pending" />
          </TabsContent>
        </div>

        {/* Approved split panes */}
        <div className="mt-[var(--space-between-items)] flex flex-col h-[calc(100vh-145px)]">
          <TabsContent value="approved" className="p-0 h-auto overflow-visible shrink-0">
            <div className="bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)]">
              <ArticleFilters
                searchTerm={""}
                onSearchChange={() => {}}
                sortBy={"newest"}
                onSortChange={() => {}}
                sortOptions={[
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                  { value: "title", label: "Title A-Z" },
                  { value: "category", label: "Category" },
                ]}
                selectedCount={0}
                totalCount={0}
                onSelectAll={() => {}}
                actionItems={[{ label: "Unapprove", onClick: () => {} }, { label: "Delete", onClick: () => {} }]}
              />
            </div>
          </TabsContent>
          <TabsContent value="approved" className="p-0 mt-[var(--space-between-items)] flex-1 min-h-0 h-auto overflow-hidden">
            <ArticlesListSkeleton status="approved" />
          </TabsContent>
        </div>

        {/* Rejected split panes */}
        <div className="mt-[var(--space-between-items)] flex flex-col h-[calc(100vh-145px)]">
          <TabsContent value="rejected" className="p-0 h-auto overflow-visible shrink-0">
            <div className="bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)]">
              <ArticleFilters
                searchTerm={""}
                onSearchChange={() => {}}
                sortBy={"newest"}
                onSortChange={() => {}}
                sortOptions={[
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" },
                  { value: "title", label: "Title A-Z" },
                  { value: "category", label: "Category" },
                ]}
                selectedCount={0}
                totalCount={0}
                onSelectAll={() => {}}
                actionItems={[{ label: "Restore to Pending", onClick: () => {} }, { label: "Delete", onClick: () => {} }]}
              />
            </div>
          </TabsContent>
          <TabsContent value="rejected" className="p-0 mt-[var(--space-between-items)] flex-1 min-h-0 h-auto overflow-hidden">
            <ArticlesListSkeleton status="rejected" />
          </TabsContent>
        </div>

        {/* Create tab placeholder */}
        <TabsContent value="create" className="mt-[var(--space-between-items)]">
          <div className="bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)]">
            <p className="text-body-primary">Create form skeleton will go here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}