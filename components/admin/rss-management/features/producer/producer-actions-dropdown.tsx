"use client"

import { Button } from "@/components/ui/button"
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown"
import { MoreVertical, Edit, Play, Trash2, Power } from "lucide-react"

interface ProducerActionsDropdownProps {
  producer: {
    _id: string
    name: string
    isActive: boolean
  }
  onEdit?: () => void
  onRunNow?: () => void
  onDelete?: () => void
  onToggleStatus?: () => void
}

export function ProducerActionsDropdown({ 
  producer, 
  onEdit, 
  onRunNow, 
  onDelete, 
  onToggleStatus 
}: ProducerActionsDropdownProps) {
  
  const dropdownItems: DropdownItem[] = [
    {
      label: "Edit",
      onClick: () => {
        console.log('Edit producer:', producer.name)
        onEdit?.()
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: "Run Now",
      onClick: () => {
        console.log('Run now:', producer.name)
        onRunNow?.()
      },
      icon: <Play className="h-4 w-4" />
    },
    {
      label: "Delete",
      onClick: () => {
        console.log('Delete producer:', producer.name)
        onDelete?.()
      },
      icon: <Trash2 className="h-4 w-4" />,
      variant: "destructive"
    },
    {
      label: producer.isActive ? 'Disable' : 'Enable',
      onClick: () => {
        console.log('Toggle status:', producer.name, 'Current:', producer.isActive)
        onToggleStatus?.()
      },
      icon: <Power className="h-4 w-4" />
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