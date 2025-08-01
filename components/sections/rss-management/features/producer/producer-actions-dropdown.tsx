"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
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
  const handleEdit = () => {
    onEdit?.()
  }

  const handleRunNow = () => {
    console.log('Run now:', producer.name)
    onRunNow?.()
  }

  const handleDelete = () => {
    console.log('Delete producer:', producer.name)
    onDelete?.()
  }

  const handleToggleStatus = () => {
    console.log('Toggle status:', producer.name, 'Current:', producer.isActive)
    onToggleStatus?.()
  }

  return (
    <DropdownMenu key={`dropdown-${producer._id}-${producer.name}-${Date.now()}`}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 text-body-secondary hover:text-headline-primary hover:bg-zinc-700/50"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white border-zinc-200 shadow-lg"
      >
        <DropdownMenuItem 
          onClick={handleEdit}
          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 cursor-pointer"
        >
          <Edit className="h-4 w-4" />
          Edit
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-zinc-200" />
        
        <DropdownMenuItem 
          onClick={handleRunNow}
          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 cursor-pointer"
        >
          <Play className="h-4 w-4" />
          Run Now
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-zinc-200" />
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-zinc-200" />
        
        <DropdownMenuItem 
          onClick={handleToggleStatus}
          className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 cursor-pointer"
        >
          <Power className="h-4 w-4" />
          {producer.isActive ? 'Disable' : 'Enable'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}