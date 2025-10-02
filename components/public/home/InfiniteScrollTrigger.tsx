"use client";

import { useEffect, useRef } from "react";
import { LoadingAnimation } from "@/components/ui/loading-animation";

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export function InfiniteScrollTrigger({
  onLoadMore,
  hasMore,
  isLoading = false
}: InfiniteScrollTriggerProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const currentObserver = observerRef.current;
    if (!currentObserver || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        // Trigger load when sentinel is visible and we're not already loading
        if (entry.isIntersecting && !loadingRef.current) {
          loadingRef.current = true;
          onLoadMore();

          // Reset loading flag after a short delay to prevent rapid consecutive loads
          setTimeout(() => {
            loadingRef.current = false;
          }, 500);
        }
      },
      {
        // Trigger when sentinel is 200px from entering viewport
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(currentObserver);

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [onLoadMore, hasMore]);

  if (!hasMore) return null;

  return (
    <div ref={observerRef} className="mt-12 flex justify-center py-8">
      <LoadingAnimation size={60} />
    </div>
  );
}
