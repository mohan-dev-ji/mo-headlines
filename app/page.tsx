"use client";

import { Suspense } from "react";
import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BadgeFilterBar } from "@/components/public/home/BadgeFilterBar";
import { CardLayoutGrid } from "@/components/public/cards/CardLayoutGrid";
import { ArticleCalendar } from "@/components/public/calendar/ArticleCalendar";
import { useArticleFilter } from "@/components/public/home/useArticleFilter";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Button } from "@/components/ui/button";

function HomeContent() {
  const {
    articles,
    isLoading,
    loadMore,
    canLoadMore,
    isLoadingMore
  } = useArticleFilter();

  return (
    <>
      {/* Badge Filter Bar */}
      <BadgeFilterBar />

      {/* Main Content - Desktop 4-Column Layout */}
      <div className="max-w-page mx-auto px-padding-md sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingAnimation size={80} />
          </div>
        ) : (
          <>
            {/* Desktop Layout: True 4-Column Grid */}
            <div className="hidden lg:grid grid-cols-4 gap-5">
              {/* Articles Section - Spans 3 columns */}
              <div className="col-span-3">
                <CardLayoutGrid articles={articles} />

                {/* Load More Section */}
                {canLoadMore && (
                  <div className="mt-12 flex justify-center">
                    {isLoadingMore ? (
                      <LoadingAnimation size={60} />
                    ) : (
                      <button
                        onClick={loadMore}
                        className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-brand-primary bg-brand-card border border-brand-line rounded-full hover:bg-brand-card-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        Load More Articles
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Calendar Section - Spans 1 column (same as portrait card) */}
              <div className="col-span-1">
                <ArticleCalendar />

                {/* Admin Dashboard Button */}
                <SignedIn>
                  <div className="mt-5 w-full">
                    <Link href="/admin" className="block">
                      <Button className="w-full bg-transparent border border-brand-line text-brand-line hover:text-brand-primary">
                        Admin Dashboard
                      </Button>
                    </Link>
                  </div>
                </SignedIn>

                {/* Ad Space Placeholder */}
                <div className="w-full hidden">
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

              {/* Load More Section */}
              {canLoadMore && (
                <div className="mt-12 flex justify-center">
                  {isLoadingMore ? (
                    <LoadingAnimation size={60} />
                  ) : (
                    <button
                      onClick={loadMore}
                      className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-brand-primary bg-brand-card border border-brand-line rounded-full hover:bg-brand-card-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      Load More Articles
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingAnimation size={80} />
        </div>
      }>
        <HomeContent />
      </Suspense>
    </div>
  );
}
