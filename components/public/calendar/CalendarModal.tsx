"use client";

import { ArticleCalendar } from "./ArticleCalendar";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
      onClick={onClose} // Close when clicking backdrop
    >
      {/* Calendar - Click won't bubble up to backdrop */}
      <div onClick={(e) => e.stopPropagation()}>
        <ArticleCalendar />
      </div>
    </div>
  );
}