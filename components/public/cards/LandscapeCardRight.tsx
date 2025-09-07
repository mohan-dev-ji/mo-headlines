import Link from "next/link";
import { Heart } from "lucide-react";

interface LandscapeCardRightProps {
  article: {
    _id: string;
    title: string;
    excerpt?: string;
    imageUrl?: string | null;
    sourceUrls?: Array<{url: string, domain: string, title: string}> | string[];
    _creationTime?: number;
    publishedAt?: number;
    slug: string;
  };
  className?: string;
}

export function LandscapeCardRight({ article, className = "" }: LandscapeCardRightProps) {
  // Format publication date
  const publishedDate = new Date(article.publishedAt || article._creationTime || 0);
  const timeAgo = formatTimeAgo(publishedDate);

  // Get source count
  const sourceCount = article.sourceUrls?.length || 0;

  return (
    <Link href={`/article/${article._id}`}>
      <div className={`group bg-brand-card rounded-lg overflow-hidden hover:bg-brand-card-dark transition-colors duration-200 ${className}`}>
        <div className="flex h-auto">
          {/* Content - Left side (50% width) */}
          <div className="w-1/2 pl-6 pr-0 py-6 flex flex-col justify-between">
            <div>
              <h2 className="font-abhaya-libre font-medium text-2xl leading-tight text-headline-primary mb-2 group-hover:text-brand-primary transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-body-secondary mb-3">Published {timeAgo}</p>
              {article.excerpt && (
                <p className="text-body-primary text-sm leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4 text-xs text-body-secondary">
                {sourceCount > 0 && (
                  <span>{sourceCount} Sources</span>
                )}
              </div>
              <button className="p-2 hover:bg-zinc-700 rounded-full transition-colors">
                <Heart className="w-4 h-4 text-body-secondary hover:text-brand-primary" />
              </button>
            </div>
          </div>

          {/* Image - Right side (50% width) */}
          <div className="w-1/2 relative p-5">
            {article.imageUrl ? (
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full bg-zinc-700 flex items-center justify-center rounded">
                <span className="text-zinc-500 text-sm">No image</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMilliseconds = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return "Less than an hour ago";
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
}