"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

// Select mode types
interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectModeProps {
  mode: 'select'
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

// Action mode types
interface ActionItem {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: 'default' | 'destructive'
  disabled?: boolean
}

interface ActionModeProps {
  mode: 'action'
  items: ActionItem[]
}

// Common props
interface CommonProps {
  trigger: string
  width?: string
  disabled?: boolean
  align?: "left" | "right"
  className?: string
}

type DarkDropdownProps = CommonProps & (SelectModeProps | ActionModeProps)

export function DarkDropdown(props: DarkDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { 
    trigger, 
    width = "w-full md:w-[180px]", 
    disabled = false, 
    align = "right",
    className 
  } = props

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

  const handleSelectClick = (value: string) => {
    if (props.mode === 'select') {
      props.onValueChange(value)
      setIsOpen(false)
    }
  }

  const handleActionClick = (item: ActionItem) => {
    if (!item.disabled && props.mode === 'action') {
      item.onClick()
      setIsOpen(false)
    }
  }

  // Get display value for select mode
  const getDisplayValue = () => {
    if (props.mode === 'select') {
      const selectedOption = props.options.find(opt => opt.value === props.value)
      return selectedOption?.label || props.placeholder || trigger
    }
    return trigger
  }

  return (
    <div className={cn("relative", width, className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        className={cn(
          "w-full justify-between font-normal bg-brand-card-dark border-brand-line-dark text-headline-primary hover:bg-brand-card hover:text-headline-primary focus:border-brand-line-dark"
        )}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderColor: 'var(--brand-line-dark)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--brand-line-dark)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--brand-line-dark)'
        }}
      >
        <span>{getDisplayValue()}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className={cn(
          "absolute top-8 z-50 w-full bg-brand-card-dark border border-brand-line-dark shadow-lg rounded-md py-1",
          align === "right" ? "right-0" : "left-0"
        )}>
          {props.mode === 'select' ? (
            // Select Mode - Options
            props.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectClick(option.value)}
                disabled={option.disabled}
                className={cn(
                  "flex items-center justify-between w-full text-left px-3 py-2 text-sm transition-colors",
                  "hover:bg-brand-card focus:bg-brand-card focus:outline-none",
                  option.disabled 
                    ? "opacity-50 cursor-not-allowed text-body-greyed-out" 
                    : "text-body-primary hover:text-headline-primary"
                )}
              >
                <span>{option.label}</span>
                {props.value === option.value && (
                  <Check className="h-4 w-4 text-headline-primary" />
                )}
              </button>
            ))
          ) : (
            // Action Mode - Items
            props.items.map((item, index) => (
              <button
                key={index}
                onClick={() => handleActionClick(item)}
                disabled={item.disabled}
                className={cn(
                  "flex items-center gap-2 w-full text-left px-3 py-2 text-sm transition-colors",
                  "hover:bg-brand-card focus:bg-brand-card focus:outline-none",
                  item.variant === "destructive" 
                    ? "text-red-400 hover:bg-red-600/10 focus:bg-red-600/10" 
                    : "text-headline-primary",
                  item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent text-body-greyed-out"
                )}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}