"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FilteredArticleList } from "@/components/public/filtered-article-list";
import { use } from "react";

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  // Convert slug back to topic name (reverse of slug creation)
  const topicName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  const articles = useQuery(api.articles.getArticlesByTopic, { topicName });

  if (!articles || articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Topic: {topicName}</h1>
        <p>No articles found for this topic.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Articles about {topicName}</h1>
      {articles && <FilteredArticleList articles={articles} />}
    </div>
  );
} 