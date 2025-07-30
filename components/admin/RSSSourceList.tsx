"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { RSSSourceCard } from "./RSSSourceCard";
import { Loader2, Rss } from "lucide-react";

interface RSSSourceListProps {
  sources: Doc<"rss_sources">[];
  isLoading: boolean;
  emptyMessage: string;
  emptyDescription: string;
  onEdit?: (source: Doc<"rss_sources">) => void;
}

export function RSSSourceList({ 
  sources, 
  isLoading, 
  emptyMessage, 
  emptyDescription,
  onEdit 
}: RSSSourceListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary-button mx-auto mb-3" />
          <p className="text-body-md text-body-secondary">Loading RSS sources...</p>
        </div>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <Rss className="h-12 w-12 text-body-greyed-out mx-auto mb-4" />
          <h3 className="text-headline-3 text-headline-primary mb-2">
            {emptyMessage}
          </h3>
          <p className="text-body-md text-body-secondary">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sources.map((source) => (
        <RSSSourceCard 
          key={source._id} 
          source={source} 
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}