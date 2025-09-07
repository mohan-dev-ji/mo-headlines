"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export type FilterCategory = "recent" | "tech-science" | "finance" | "policies";

export function useArticleFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial filter from URL params, default to "recent"
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("recent");

  // Get categories for mapping slugs to IDs
  const categories = useQuery(api.categories.getAllCategories);
  
  // Create slug to ID mapping
  const categoryMap = useMemo(() => {
    if (!categories) return new Map();
    return new Map(categories.map((cat: any) => [cat.slug, cat._id]));
  }, [categories]);

  // Update state when URL changes
  useEffect(() => {
    const categoryParam = searchParams.get("category") as FilterCategory;
    if (categoryParam && ["recent", "tech-science", "finance", "policies"].includes(categoryParam)) {
      setActiveFilter(categoryParam);
    } else {
      setActiveFilter("recent");
    }
  }, [searchParams]);

  // Get articles based on active filter
  const allArticles = useQuery(api.articles.getAllArticles);
  
  const categoryId = activeFilter !== "recent" ? categoryMap.get(activeFilter) : undefined;
  const categoryArticles = useQuery(
    api.articles.getArticlesByCategory, 
    categoryId ? { categoryId } : "skip"
  );

  // Return filtered articles based on active filter
  const articles = useMemo(() => {
    if (activeFilter === "recent") {
      // Return all approved articles sorted by newest first
      return allArticles?.filter(article => article.status === "approved") || [];
    } else {
      // Return category-specific approved articles
      return categoryArticles?.filter(article => article.status === "approved") || [];
    }
  }, [activeFilter, allArticles, categoryArticles]);

  // Update URL when filter changes
  const setFilter = useCallback((category: FilterCategory) => {
    setActiveFilter(category);
    
    // Update URL with new filter
    const params = new URLSearchParams(searchParams.toString());
    if (category === "recent") {
      params.delete("category"); // Remove param for default "recent"
    } else {
      params.set("category", category);
    }
    
    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  return {
    activeFilter,
    setFilter,
    articles,
    isLoading: !categories || (activeFilter === "recent" ? !allArticles : !categoryArticles),
  };
}