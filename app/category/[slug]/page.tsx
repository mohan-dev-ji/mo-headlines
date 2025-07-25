"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FilteredArticleList } from "@/components/filtered-article-list";
import { use } from "react";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const category = useQuery(api.categories.getCategoryBySlug, { slug });
  const articles = useQuery(api.articles.getArticlesByCategory, { categoryId: category?._id });

  if (!category) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Articles in {category.name}</h1>
      {articles && <FilteredArticleList articles={articles} />}
    </div>
  );
} 