"use client"

import { Button } from "@/components/ui/button"
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown"
import { MoreVertical, Play, Trash2 } from "lucide-react"

interface QueueActionsDropdownProps {
  queueItem: {
    _id: string
    title: string
  }
  onProcessNow?: () => void
  onDelete?: () => void
}

export function QueueActionsDropdown({ 
  queueItem, 
  onProcessNow, 
  onDelete 
}: QueueActionsDropdownProps) {
  
  const dropdownItems: DropdownItem[] = [
    {
      label: "Process Now",
      onClick: () => {
        console.log('Process now:', queueItem.title)
        onProcessNow?.()
      },
      icon: <Play className="h-4 w-4" />
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
    <Button
      variant="ghost"
      className="h-8 w-8 p-0 text-body-secondary hover:text-headline-primary hover:bg-zinc-700/50"
    >
      <MoreVertical className="h-4 w-4" />
    </Button>
  )

  return (
    <CustomDropdown 
      trigger={trigger}
      items={dropdownItems}
      align="right"
    />
  )
}