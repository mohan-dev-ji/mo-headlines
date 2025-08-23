"use client"

import { Button } from "@/components/ui/button"
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown"
import { MoreVertical, Edit, Plus, Trash2, Power, RefreshCw } from "lucide-react"

interface RssActionsDropdownProps {
  producer: {
    _id: string
    name: string
    isActive: boolean
  }
  onEdit?: () => void
  onAddToQueue?: () => void
  onDelete?: () => void
  onToggleStatus?: () => void
  onRefresh?: () => void
}

export function RssActionsDropdown({ 
  producer, 
  onEdit, 
  onAddToQueue, 
  onDelete, 
  onToggleStatus,
  onRefresh
}: RssActionsDropdownProps) {
  
  const dropdownItems: DropdownItem[] = [
    {
      label: "Edit",
      onClick: () => {
        console.log('Edit RSS source:', producer.name)
        onEdit?.()
      },
      icon: <Edit className="h-4 w-4" />
    },
    {
      label: "Refresh Feed",
      onClick: () => {
        console.log('Refresh RSS feed:', producer.name)
        onRefresh?.()
      },
      icon: <RefreshCw className="h-4 w-4" />
    },
    {
      label: "Add to Queue",
      onClick: () => {
        console.log('Add to queue:', producer.name)
        onAddToQueue?.()
      },
      icon: <Plus className="h-4 w-4" />
    },
    {
      label: "Delete",
      onClick: () => {
        console.log('Delete RSS source:', producer.name)
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