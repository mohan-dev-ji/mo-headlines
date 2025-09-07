"use client";

import { LandscapeCardLeft } from "./LandscapeCardLeft";
import { LandscapeCardRight } from "./LandscapeCardRight";
import { PortraitCard } from "./PortraitCard";
import { MobileArticleCard } from "./MobileArticleCard";

interface Article {
  _id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string | null;
  sourceUrls?: Array<{url: string, domain: string, title: string}> | string[];
  _creationTime?: number;
  publishedAt?: number;
  slug: string;
}

interface CardLayoutGridProps {
  articles: Article[];
  className?: string;
}

export function CardLayoutGrid({ articles, className = "" }: CardLayoutGridProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-body-secondary text-lg">No articles found for this category.</p>
      </div>
    );
  }

  // Group articles into sets of 5 for the 3-row pattern
  const articleGroups: Article[][] = [];
  for (let i = 0; i < articles.length; i += 5) {
    articleGroups.push(articles.slice(i, i + 5));
  }

  return (
    <div className={className}>
      {/* Desktop Layout */}
      <div className="hidden md:block space-y-5">
        {articleGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Row 1: LandscapeCardLeft (if article exists) */}
            {group[0] && (
              <div className="mb-5">
                <LandscapeCardLeft article={group[0]} />
              </div>
            )}

            {/* Row 2: LandscapeCardRight (if article exists) */}
            {group[1] && (
              <div className="mb-5">
                <LandscapeCardRight article={group[1]} />
              </div>
            )}

            {/* Row 3: Three PortraitCards (if articles exist) */}
            {(group[2] || group[3] || group[4]) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {group[2] && <PortraitCard article={group[2]} />}
                {group[3] && <PortraitCard article={group[3]} />}
                {group[4] && <PortraitCard article={group[4]} />}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {articles.map((article) => (
          <MobileArticleCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
}