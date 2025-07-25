"use client"

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import TimeAgo from "react-timeago";

interface Article {
  _id: Id<"articles">;
  title: string;
  body: string;
  category: string;
  tags: string[];
  authorId: string;
  createdAt: number;
  imageUrl: string | null;
}

export function FeaturedArticle() {
  const articles = useQuery(api.articles.getAllArticles);

  if (!articles || articles.length === 0) {
    return null;
  }

  const featuredArticle = articles[0];

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/article/${featuredArticle._id}`}
          className="block relative w-full h-[400px] rounded-lg overflow-hidden group"
        >
          {featuredArticle.imageUrl ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${featuredArticle.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-200" />
          )}
          <div className="absolute bottom-0 left-0 p-6 text-left">
            <h1 className="text-4xl font-bold text-white mb-2">
              {featuredArticle.title}
            </h1>
            <p className="text-white/80">
              {Date.now() - featuredArticle.createdAt < 24 * 60 * 60 * 1000 ? (
                <TimeAgo date={featuredArticle.createdAt} />
              ) : (
                new Date(featuredArticle.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              )}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
} 