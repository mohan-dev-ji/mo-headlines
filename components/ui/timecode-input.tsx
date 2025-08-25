"use client"

import { useState, useEffect, forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { formatTimecodeInput, validateTimecode, timecodeToSeconds, secondsToTimecode } from "@/lib/timecode-utils"
import { cn } from "@/lib/utils"

interface TimecodeInputProps {
  value?: string
  onChange?: (value: string) => void
  onSecondsChange?: (seconds: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

export const TimecodeInput = forwardRef<HTMLInputElement, TimecodeInputProps>(
  ({ value = "", onChange, onSecondsChange, placeholder = "00:00:00", className, disabled, id }, ref) => {
    const [displayValue, setDisplayValue] = useState("")
    const [isValid, setIsValid] = useState(true)

    // Initialize display value from props
    useEffect(() => {
      if (value !== displayValue) {
        setDisplayValue(value || "");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Format the input with auto-colons
      const formatted = formatTimecodeInput(inputValue);
      setDisplayValue(formatted);
      
      // Validate the formatted input
      const valid = validateTimecode(formatted);
      setIsValid(valid);
      
      // Call onChange with the formatted value
      onChange?.(formatted);
      
      // Call onSecondsChange with the converted seconds
      if (valid && formatted) {
        const seconds = timecodeToSeconds(formatted);
        onSecondsChange?.(seconds);
      } else if (!formatted) {
        onSecondsChange?.(0);
      }
    };

    const handleBlur = () => {
      // Ensure proper formatting on blur
      if (displayValue && isValid) {
        const seconds = timecodeToSeconds(displayValue);
        const properFormat = secondsToTimecode(seconds);
        setDisplayValue(properFormat);
        onChange?.(properFormat);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter
      if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
          (e.keyCode === 65 && e.ctrlKey === true) ||
          (e.keyCode === 67 && e.ctrlKey === true) ||
          (e.keyCode === 86 && e.ctrlKey === true) ||
          (e.keyCode === 88 && e.ctrlKey === true) ||
          // Allow: home, end, left, right
          (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
      }
      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
    };

    return (
      <Input
        ref={ref}
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "font-mono tracking-wider",
          !isValid && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        maxLength={8} // HH:MM:SS format
      />
    );
  }
);

TimecodeInput.displayName = "TimecodeInput";