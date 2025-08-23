"use client"

import { Button } from "@/components/ui/button"
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown"
import { MoreVertical, Edit, Plus, Trash2 } from "lucide-react"

interface ResearchActionsDropdownProps {
  source: {
    _id: string
    title: string
  }
  onEdit?: () => void
  onAddToQueue?: () => void
  onDelete?: () => void
}

export function ResearchActionsDropdown({ 
  source, 
  onEdit, 
  onAddToQueue, 
  onDelete
}: ResearchActionsDropdownProps) {
  
  const dropdownItems: DropdownItem[] = [
    {
      label: "Edit",
      onClick: () => {
        console.log('Edit research source:', source.title)
        onEdit?.()
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: "Add to Queue",
      onClick: () => {
        console.log('Add research to queue:', source.title)
        onAddToQueue?.()
      },
      icon: <Plus className="h-4 w-4" />
    },
    {
      label: "Delete",
      onClick: () => {
        console.log('Delete research source:', source.title)
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