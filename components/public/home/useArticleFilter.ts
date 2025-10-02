"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export type FilterCategory = "recent" | "tech" | "science" | "finance" | "policies";

export function useArticleFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("recent");
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD format
  const [loadedItems, setLoadedItems] = useState(10); // For pagination

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
    const dateParam = searchParams.get("date"); // YYYY-MM-DD format

    if (categoryParam && ["recent", "tech", "science", "finance", "policies"].includes(categoryParam)) {
      setActiveFilter(categoryParam);
    } else {
      setActiveFilter("recent");
    }

    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      setSelectedDate(dateParam);
    } else {
      setSelectedDate(null);
    }

    // Reset pagination when filters change
    setLoadedItems(10);
  }, [searchParams]);

  // Get categoryId for filtering
  const categoryId = useMemo(() => {
    if (activeFilter === "recent") return undefined;
    return categoryMap.get(activeFilter);
  }, [activeFilter, categoryMap]);

  // Get articles with pagination and combined filtering
  const articleData = useQuery(api.articles.getArticlesWithPagination, {
    categoryId,
    selectedDate: selectedDate || undefined, // Convert null to undefined for Convex
    limit: loadedItems,
    offset: 0,
  });

  // Extract articles and pagination info
  const articles = articleData?.articles || [];
  const pagination = articleData?.pagination;

  // Get date counts for calendar indicators (current month by default)
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const startDateStr = startOfMonth.toISOString().split('T')[0];
  const endDateStr = endOfMonth.toISOString().split('T')[0];

  const dateCounts = useQuery(api.articles.getDateCounts, {
    startDate: startDateStr,
    endDate: endDateStr,
    categoryId, // Include category filter for calendar dots
  });

  // Load more functionality
  const loadMore = useCallback(() => {
    if (pagination?.hasMore) {
      setLoadedItems(prev => prev + 10);
    }
  }, [pagination?.hasMore]);

  // Update URL when category filter changes
  const setFilter = useCallback((category: FilterCategory) => {
    setActiveFilter(category);
    setLoadedItems(10); // Reset pagination

    // Update URL with new filter
    const params = new URLSearchParams(searchParams.toString());

    if (category === "recent") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    // Clear date filter when selecting "Recent" (All filter)
    if (category === "recent") {
      params.delete("date");
      setSelectedDate(null);
    }

    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  // Set date filter
  const setDateFilter = useCallback((date: string | null) => {
    setSelectedDate(date);
    setLoadedItems(10); // Reset pagination

    // Update URL with new date filter
    const params = new URLSearchParams(searchParams.toString());

    if (date) {
      params.set("date", date);
    } else {
      params.delete("date");
    }

    const newUrl = params.toString() ? `/?${params.toString()}` : "/";
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilter("recent");
    setSelectedDate(null);
    setLoadedItems(10);
    router.push("/", { scroll: false });
  }, [router]);

  // Determine if any filters are active
  const hasActiveFilters = activeFilter !== "recent" || selectedDate !== null;

  return {
    // Filter state
    activeFilter,
    selectedDate,
    hasActiveFilters,

    // Filter actions
    setFilter,
    setDateFilter,
    clearAllFilters,

    // Article data
    articles,
    isLoading: !categories || !articleData,

    // Pagination
    pagination,
    loadMore,
    canLoadMore: pagination?.hasMore || false,

    // Calendar data
    dateCounts: dateCounts || {},

    // Category mapping
    categoryMap,
  };
}