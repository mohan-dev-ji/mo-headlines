"use client";

import { Calendar } from "@/components/ui/calendar";
import { useArticleFilter } from "@/components/public/home/useArticleFilter";
import { Button } from "@/components/ui/button";
import { DayButton } from "react-day-picker";
import { cn } from "@/lib/utils";
import React from "react";

// Custom day button with publication indicators
function ArticleDayButton({
  className,
  day,
  modifiers,
  dateCounts,
  selectedDate,
  onDateSelect,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  dateCounts: Record<string, number>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}) {
  const dateStr = day.date.toISOString().split('T')[0]; // YYYY-MM-DD format
  const articleCount = dateCounts[dateStr] || 0;
  const isSelected = selectedDate === dateStr;
  const isToday = modifiers.today;

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      className={cn(
        // Base styling - rounded and proper sizing
        "relative flex aspect-square size-auto w-full min-w-8 flex-col items-center justify-center leading-none font-normal text-sm text-body-secondary rounded-md",
        "hover:bg-brand-badge-background hover:text-brand-primary transition-colors",

        // Selected state - solid cyan fill like Figma design!
        isSelected && "!bg-brand-badge-background !text-brand-primary !border !border-brand-primary hover:!bg-brand-badge-background hover:!text-brand-primary font-medium",

        // Today styling - solid background like Figma design
        isToday && !isSelected && "bg-brand-card text-headline-primary font-medium rounded-md border border-headline-primary",

        // Outside month styling
        modifiers.outside && "text-body-greyed-out opacity-50",

        // Disabled styling
        modifiers.disabled && "text-body-secondary cursor-not-allowed",

        className
      )}
      disabled={modifiers.disabled}
      {...props}
    >
      {/* Day number */}
      <span className="text-sm">
        {day.date.getDate()}
      </span>

      {/* Publication indicators - dots below the date */}
      {articleCount > 0 && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
          {/* Show exactly 3 dots maximum with opacity progression for 3+ articles */}
          {Array.from({ length: Math.min(articleCount, 3) }).map((_, i) => {
            // If more than 3 articles, apply decreasing opacity to the 3 dots
            const hasMoreThan3 = articleCount > 3;
            let dotOpacity;

            if (hasMoreThan3) {
              // More than 3 articles: dot 1=100%, dot 2=80%, dot 3=60%
              dotOpacity = i === 0 ? "opacity-100" : i === 1 ? "opacity-80" : "opacity-60";
            } else {
              // 1-3 articles: normal opacity based on selection
              dotOpacity = isSelected ? "opacity-100" : "opacity-60";
            }

            return (
              <div
                key={i}
                className={cn(
                  "w-1 h-1 rounded-full bg-brand-primary",
                  dotOpacity
                )}
              />
            );
          })}
        </div>
      )}
    </Button>
  );
}

export function ArticleCalendar() {
  const { dateCounts, selectedDate, setDateFilter } = useArticleFilter();

  // Handle date selection
  const handleDateSelect = (dateStr: string) => {
    console.log('handleDateSelect called:', { dateStr, selectedDate });
    if (selectedDate === dateStr) {
      // If clicking the same date, clear the filter
      console.log('Clearing date filter');
      setDateFilter(null);
    } else {
      // Set new date filter
      console.log('Setting date filter to:', dateStr);
      setDateFilter(dateStr);
    }
  };

  // Convert selectedDate string back to Date object for calendar
  const selectedDateObj = selectedDate ? new Date(selectedDate) : undefined;

  return (
    <div className="w-full">
      {/* Calendar component */}
      <Calendar
        mode="single"
        selected={selectedDateObj}
        onSelect={(date) => {
          if (date) {
            const dateStr = date.toISOString().split('T')[0];
            handleDateSelect(dateStr);
          }
        }}
        className="bg-brand-card border border-brand-line rounded-lg p-4 w-full"
        classNames={{
          // Override the root w-fit to fill column
          root: "w-full flex flex-col items-center",
          // Calendar grid container
          table: "w-full border-collapse",
          // Month container for better alignment
          month: "flex flex-col gap-4 w-full items-center",
          // Override month/year header styling - perfect alignment
          month_caption: "flex items-center justify-center w-full h-8 text-headline-primary font-medium relative",
          // Navigation buttons - positioned at edges
          nav: "flex justify-between w-full absolute inset-0 pointer-events-none",
          button_previous: "text-body-secondary hover:text-brand-primary hover:bg-brand-card-dark pointer-events-auto h-8 w-8 flex items-center justify-center rounded",
          button_next: "text-body-secondary hover:text-brand-primary hover:bg-brand-card-dark pointer-events-auto h-8 w-8 flex items-center justify-center rounded",
          // Caption label centered
          caption_label: "text-center flex-1",
          // Weekday headers - ensure proper grid alignment and centering
          weekdays: "flex w-full justify-center",
          weekday: "text-body-secondary font-normal text-xs flex-1 text-center py-2",
          // Week rows - maintain grid structure and centering
          week: "flex w-full justify-center",
          // Individual day cells - match weekday width
          day: "flex-1 p-0 text-center",
        }}
        components={{
          DayButton: (props) => (
            <ArticleDayButton
              {...props}
              dateCounts={dateCounts}
              selectedDate={selectedDate}
              onDateSelect={() => {}} // Empty function since we're using Calendar's onSelect
            />
          ),
        }}
        // Disable future dates
        disabled={{ after: new Date() }}
      />

    </div>
  );
}