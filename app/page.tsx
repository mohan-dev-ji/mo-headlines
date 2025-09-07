"use client";

import { Suspense } from "react";
import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BadgeFilterBar } from "@/components/public/home/BadgeFilterBar";
import { CardLayoutGrid } from "@/components/public/cards/CardLayoutGrid";
import { useArticleFilter } from "@/components/public/home/useArticleFilter";

function HomeContent() {
  const { articles, isLoading } = useArticleFilter();

  return (
    <>
      {/* Badge Filter Bar */}
      <BadgeFilterBar />

      {/* Main Content */}
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-body-secondary">Loading articles...</div>
          </div>
        ) : (
          <CardLayoutGrid articles={articles} />
        )}

        {/* Admin Dashboard Link (for authenticated users) */}
        <SignedIn>
          <div className="mt-12 flex justify-center">
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
