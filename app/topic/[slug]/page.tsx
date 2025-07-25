"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FilteredArticleList } from "@/components/filtered-article-list";
import { use } from "react";

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const topic = useQuery(api.topics.getTopicBySlug, { slug });
  const articles = useQuery(api.articles.getArticlesByTopic, { topicId: topic?._id });

  if (!topic) {
    return <div>Topic not found</div>;
  }

  return (
    <div className="max-w-2xl container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Articles about {topic.name}</h1>
      {articles && <FilteredArticleList articles={articles} />}
    </div>
  );
} 