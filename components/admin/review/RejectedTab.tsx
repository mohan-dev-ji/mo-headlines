"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReviewCard } from "./ReviewCard";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { useRouter } from "next/navigation";

export function RejectedTab() {
  const router = useRouter();
  const articles = useQuery(api.articles.getArticlesByStatus, { status: "rejected" });

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-headline-primary mb-2">No rejected articles</h3>
        <p className="text-body-secondary">
          Articles you reject will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 h-full overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-p text-body-secondary">
          Rejected Articles ({articles.length})
        </h2>
      </div>
      
      <div className="grid gap-4 p-4">
        {articles.map((article) => (
          <ReviewCard
            key={article._id}
            article={article}
          />
        ))}
      </div>
    </div>
  );
}