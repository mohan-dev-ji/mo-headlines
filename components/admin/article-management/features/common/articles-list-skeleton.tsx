"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Status = "pending" | "approved" | "rejected"

export function ArticlesListSkeleton({ status = "pending" }: { status?: Status }) {
  const borderClass =
    status === "approved"
      ? "border-green-600/60"
      : status === "rejected"
      ? "border-red-600/60"
      : "border-brand-line"

  const items = Array.from({ length: 8 })

  return (
    <div className="h-full min-h-0 overflow-auto bg-brand-card p-[var(--padding-md)] rounded-[var(--radius)]">
      <div className="space-y-6">
        {items.map((_, idx) => (
          <Card
            key={idx}
            className={cn(
              "bg-brand-card-dark border-2",
              borderClass,
              "p-4 flex items-start gap-4"
            )}
          >
            <div className="h-12 w-12 rounded-md bg-background/20 grid place-items-center text-body-secondary border border-brand-line">
              <span className="text-xs">IMG</span>
            </div>
            <div className="flex-1">
              <div className="h-4 w-48 bg-background/30 rounded mb-2" />
              <div className="h-3 w-80 bg-background/20 rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}


