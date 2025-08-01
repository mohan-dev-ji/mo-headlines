"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <div className="w-full bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)]">
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "!flex !w-auto !h-auto !bg-transparent !p-0 !gap-2 !justify-start [&>*]:!flex-none [&>*]:!w-auto",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "flex items-center px-2 py-3 w-auto h-auto flex-shrink-0 text-body-primary border-0 data-[state=active]:!bg-[var(--brand-secondary-button)] data-[state=active]:!text-[var(--button-white)] data-[state=active]:!border-0 rounded-md font-medium text-sm transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)] h-[calc(100vh-145px)] overflow-auto outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
