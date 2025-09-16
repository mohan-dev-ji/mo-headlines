import Link from "next/link";
import { Heart } from "lucide-react";

interface PortraitCardProps {
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

export function PortraitCard({ article, className = "" }: PortraitCardProps) {
  // Format publication date
  const publishedDate = new Date(article.publishedAt || article._creationTime || 0);
  const timeAgo = formatTimeAgo(publishedDate);

  // Get source count
  const sourceCount = article.sourceUrls?.length || 0;

  return (
    <Link href={`/article/${article._id}`}>
      <div className={`group bg-brand-card rounded-lg overflow-hidden border border-brand-card hover:bg-brand-card-dark transition-colors duration-200 h-auto flex flex-col ${className}`}>
        {/* Image - 50% of height */}
        <div className="h-1/2 relative p-5 pb-0">
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

        {/* Content - 50% of height */}
        <div className="h-1/2 px-4 pb-4 pt-4 flex flex-col justify-between">
          <div>
            <h3 className="font-abhaya-libre font-medium text-2xl leading-tight text-headline-primary mb-1 group-hover:text-brand-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
            <p className="text-base text-body-secondary">{timeAgo}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-xs text-body-secondary">
              {sourceCount > 0 && (
                <span>{sourceCount} Sources</span>
              )}
            </div>
            <button className="p-1.5 hover:bg-zinc-700 rounded-full transition-colors flex-shrink-0">
              <Heart className="w-3.5 h-3.5 text-body-secondary hover:text-brand-primary" />
            </button>
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
    return "Published less than an hour ago";
  } else if (diffInHours < 24) {
    return `Published ${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  } else {
    // After 24 hours, show just the date
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}