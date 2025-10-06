"use client";

import { Suspense } from "react";
import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { BadgeFilterBar } from "@/components/public/home/BadgeFilterBar";
import { CardLayoutGrid } from "@/components/public/cards/CardLayoutGrid";
import { ArticleCalendar } from "@/components/public/calendar/ArticleCalendar";
import { useArticleFilter } from "@/components/public/home/useArticleFilter";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Button } from "@/components/ui/button";
import { InfiniteScrollTrigger } from "@/components/public/home/InfiniteScrollTrigger";

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
            <LoadingAnimation size={80} />
          </div>
        ) : (
          <>
            {/* Desktop Layout: True 4-Column Grid */}
            <div className="hidden lg:grid grid-cols-4 gap-5">
              {/* Articles Section - Spans 3 columns */}
              <div className="col-span-3">
                {articles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-body-secondary text-center">No articles found for this date.</p>
                  </div>
                ) : (
                  <>
                    <CardLayoutGrid articles={articles} />
                    <InfiniteScrollTrigger onLoadMore={loadMore} hasMore={canLoadMore} />
                  </>
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
              {articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-body-secondary text-center">No articles found for this date.</p>
                </div>
              ) : (
                <>
                  <CardLayoutGrid articles={articles} />
                  <InfiniteScrollTrigger onLoadMore={loadMore} hasMore={canLoadMore} />
                </>
              )}
            </div>
          </>
        )}

      </div>
    </>
  );
}

export default function Home() {
  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Headlines",
    "url": "https://theheadlines.io",
    "logo": "https://theheadlines.io/logo.png",
    "description": "Professional news aggregation with fact-checking and source transparency",
    "sameAs": []
  };

  return (
    <div className="min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
