"use client"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"

const reviewTabs = [
  {
    value: "pending",
    label: "Pending",
    color: "text-yellow-600"
  },
  {
    value: "approved", 
    label: "Approved",
    color: "text-green-600"
  },
  {
    value: "rejected",
    label: "Rejected", 
    color: "text-red-600"
  },
  {
    value: "drafts",
    label: "Drafts",
    color: "text-blue-600"
  },
  {
    value: "create",
    label: "Create",
    color: "text-purple-600"
  }
]

export function ReviewTabSystem() {
  return (
    <TabsList className="grid w-full grid-cols-5">
      {reviewTabs.map((tab) => (
        <TabsTrigger 
          key={tab.value} 
          value={tab.value}
          className="data-[state=active]:bg-brand-card"
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  )
}