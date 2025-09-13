"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReviewCard } from "./ReviewCard";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { useRouter } from "next/navigation";

export function ApprovedTab() {
  const router = useRouter();
  const articles = useQuery(api.articles.getArticlesByStatus, { status: "approved" });

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-headline-primary mb-2">No approved articles</h3>
        <p className="text-body-secondary">
          Articles you approve will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 h-full overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-headline-primary">
          Approved Articles ({articles.length})
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