"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface DropdownItem {
  label: string
  onClick: () => void
  variant?: "default" | "destructive"
  icon?: React.ReactNode
  disabled?: boolean
}

interface CustomDropdownProps {
  trigger?: React.ReactNode
  items: DropdownItem[]
  align?: "left" | "right"
  className?: string
}

export function CustomDropdown({ 
  trigger, 
  items, 
  align = "right",
  className 
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick()
      setIsOpen(false)
    }
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={cn(
          "absolute top-8 z-50 min-w-48 bg-white border border-zinc-200 shadow-lg rounded-md py-1",
          align === "right" ? "right-0" : "left-0"
        )}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              className={cn(
                "flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors",
                "hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none",
                item.variant === "destructive" 
                  ? "text-red-600 hover:bg-red-50 focus:bg-red-50" 
                  : "text-zinc-700",
                item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}