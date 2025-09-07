"use client";

interface FilterBadgeProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function FilterBadge({ label, isActive, onClick, className = "" }: FilterBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer
        ${isActive 
          ? "bg-brand-badge-background text-brand-primary" 
          : "bg-brand-card text-body-secondary"
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
}