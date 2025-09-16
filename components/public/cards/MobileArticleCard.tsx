import Link from "next/link";
import { Heart } from "lucide-react";

interface MobileArticleCardProps {
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

export function MobileArticleCard({ article, className = "" }: MobileArticleCardProps) {
  // Format publication date
  const publishedDate = new Date(article.publishedAt || article._creationTime || 0);
  const timeAgo = formatTimeAgo(publishedDate);

  // Get source count
  const sourceCount = article.sourceUrls?.length || 0;

  return (
    <Link href={`/article/${article._id}`}>
      <div className={`group bg-brand-card rounded-lg overflow-hidden border border-brand-card hover:bg-brand-card-dark transition-colors duration-200 ${className}`}>
        {/* Image - 16:9 aspect ratio for mobile */}
        <div className="aspect-video relative p-padding-md pb-0" >
          {article.imageUrl ? (
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-zinc-700 flex items-center justify-center rounded-lg">
              <span className="text-zinc-500 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--padding-md)' }}>
          <h3 className="font-abhaya-libre font-medium text-3xl leading-tight text-headline-primary mb-3 group-hover:text-brand-primary transition-colors">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-body-primary text-base leading-relaxed mb-4 line-clamp-2">
              {article.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-body-secondary">
              <span>{timeAgo}</span>
              {sourceCount > 0 && (
                <span>{sourceCount} Sources</span>
              )}
            </div>
            <button className="p-2 hover:bg-zinc-700 rounded-full transition-colors">
              <Heart className="w-4 h-4 text-body-secondary hover:text-brand-primary" />
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