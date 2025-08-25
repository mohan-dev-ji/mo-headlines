"use client"

import { Button } from "@/components/ui/button"
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown"
import { MoreVertical, Edit, Plus, Trash2 } from "lucide-react"

interface YouTubeActionsDropdownProps {
  source: {
    _id: string
    videoTitle?: string
  }
  onEdit?: () => void
  onAddToQueue?: () => void
  onDelete?: () => void
}

export function YouTubeActionsDropdown({ 
  source, 
  onEdit, 
  onAddToQueue, 
  onDelete
}: YouTubeActionsDropdownProps) {
  
  const dropdownItems: DropdownItem[] = [
    {
      label: "Edit",
      onClick: () => {
        console.log('Edit YouTube source:', source.videoTitle || source._id)
        onEdit?.()
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: "Add to Queue",
      onClick: () => {
        console.log('Add YouTube to queue:', source.videoTitle || source._id)
        onAddToQueue?.()
      },
      icon: <Plus className="h-4 w-4" />
    },
    {
      label: "Delete",
      onClick: () => {
        console.log('Delete YouTube source:', source.videoTitle || source._id)
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