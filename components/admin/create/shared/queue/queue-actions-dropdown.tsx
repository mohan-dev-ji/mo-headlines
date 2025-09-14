"use client"

import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown"
import { MoreVertical, Play, Trash2 } from "lucide-react"

interface QueueActionsDropdownProps {
  queueItem: {
    _id: string
    title: string
  }
  onProcessNow?: () => void
  onDelete?: () => void
  isProcessing?: boolean
}

export function QueueActionsDropdown({ 
  queueItem, 
  onProcessNow, 
  onDelete,
  isProcessing = false 
}: QueueActionsDropdownProps) {
  
  const dropdownItems: DropdownItem[] = [
    {
      label: isProcessing ? "Processing..." : "Process Now",
      onClick: () => {
        if (!isProcessing) {
          onProcessNow?.()
        }
      },
      icon: <Play className="h-4 w-4" />,
      disabled: isProcessing
    },
    {
      label: "Delete",
      onClick: () => {
        console.log('Delete queue item:', queueItem.title)
        onDelete?.()
      },
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive"
    }
  ]

  const trigger = (
    <div
      className="h-8 w-8 p-0 text-body-secondary hover:text-headline-primary hover:bg-zinc-700/50 inline-flex items-center justify-center rounded-md cursor-pointer transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // CustomDropdown will handle the click
        }
      }}
    >
      <MoreVertical className="h-4 w-4" />
    </div>
  )

  return (
    <CustomDropdown 
      trigger={trigger}
      items={dropdownItems}
      align="right"
    />
  )
}