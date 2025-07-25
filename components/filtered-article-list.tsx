"use client";

import Image from "next/image";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import TimeAgo from "react-timeago";

interface Article {
    _id: Id<"articles">;
    title: string;
    body: string;
    category: {
      _id: Id<"categories">;
      name: string;
      slug: string;
      _creationTime: number;
    } | null;
    authorId: string;
    createdAt: number;
    imageUrl: string | null;
    _creationTime: number;
  }

interface FilteredArticleListProps {
  articles: Article[];
}

const formatDate = (timestamp: number) => {
  if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
    return <TimeAgo date={timestamp} />;
  }
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export function FilteredArticleList({ articles }: FilteredArticleListProps) {
  if (!articles || articles.length === 0) {
    return <div>No articles found</div>;
  }

  return (
    <div className="w-full">
      <div className="max-w-2xl mx-auto">
        {articles.map((article) => (
          <Link
            key={article._id}
            href={`/article/${article._id}`}
            className="flex gap-4 py-4 rounded-lg hover:bg-gray-50 transition-colors w-full border-b-2 border-gray-100 last:border-b-0"
          >
            <div className="relative w-56 h-32 flex-shrink-0">
              {article.imageUrl ? (
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center text-left">
              <h2 className="text-xl font-semibold">{article.title}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="capitalize">{article.category?.name || 'Uncategorized'}</span>
                <span>•</span>
                <span>{formatDate(article.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 