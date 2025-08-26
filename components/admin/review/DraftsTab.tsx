"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReviewCard } from "./ReviewCard";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { useRouter } from "next/navigation";

export function DraftsTab() {
  const router = useRouter();
  const articles = useQuery(api.articles.getArticlesByStatus, { status: "draft" });

  if (articles === undefined) {
    return (
      <div className="flex justify-center py-8">
        <LoadingAnimation size={60} />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-body-secondary mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-headline-primary mb-2">No draft articles</h3>
        <p className="text-body-secondary">
          Articles saved as drafts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-headline-primary">
          Draft Articles ({articles.length})
        </h2>
      </div>
      
      <div className="grid gap-4 p-4">
        {articles.map((article) => (
          <ReviewCard 
            key={article._id} 
            article={article}
            onClick={() => router.push(`/admin/review/preview/${article._id}`)}
          />
        ))}
      </div>
    </div>
  );
}