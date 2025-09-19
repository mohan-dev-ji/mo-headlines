"use client";

import { Suspense } from "react";
import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BadgeFilterBar } from "@/components/public/home/BadgeFilterBar";
import { CardLayoutGrid } from "@/components/public/cards/CardLayoutGrid";
import { ArticleCalendar } from "@/components/public/calendar/ArticleCalendar";
import { useArticleFilter } from "@/components/public/home/useArticleFilter";

function HomeContent() {
  const {
    articles,
    isLoading,
    loadMore,
    canLoadMore
  } = useArticleFilter();

  return (
    <>
      {/* Badge Filter Bar */}
      <BadgeFilterBar />

      {/* Main Content - Desktop 4-Column Layout */}
      <div className="max-w-page mx-auto px-padding-md sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-body-secondary">Loading articles...</div>
          </div>
        ) : (
          <>
            {/* Desktop Layout: True 4-Column Grid */}
            <div className="hidden lg:grid grid-cols-4 gap-5">
              {/* Articles Section - Spans 3 columns */}
              <div className="col-span-3">
                <CardLayoutGrid articles={articles} />

                {/* Load More Button */}
                {canLoadMore && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={loadMore}
                      className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-brand-primary bg-brand-card border border-brand-line rounded-full hover:bg-brand-card-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Load More Articles
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Calendar Section - Spans 1 column (same as portrait card) */}
              <div className="col-span-1">
                <ArticleCalendar />

                {/* Ad Space Placeholder */}
                <div className="w-full">
                  <div className="mt-5 bg-brand-card border border-brand-line rounded-lg p-4 w-full">
                    <div className="text-center text-body-secondary text-sm mb-4">Advertisement</div>
                    <div className="h-32 bg-brand-card-dark rounded border-2 border-dashed border-brand-line flex items-center justify-center">
                      <span className="text-body-greyed-out text-xs">Ad Space</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Layout: Articles only (Calendar in modal) */}
            <div className="lg:hidden">
              <CardLayoutGrid articles={articles} />

              {/* Load More Button */}
              {canLoadMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={loadMore}
                    className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-brand-primary bg-brand-card border border-brand-line rounded-full hover:bg-brand-card-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Load More Articles
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Admin Dashboard Link (for authenticated users) */}
        <SignedIn>
          <div className={`${canLoadMore ? 'mt-8' : 'mt-12'} flex justify-center`}>
            <Link href="/admin">
              <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Admin Dashboard
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900/20 to-gray-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
          </div>
        </SignedIn>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-body-secondary">Loading...</div>
        </div>
      }>
        <HomeContent />
      </Suspense>
    </div>
  );
}
