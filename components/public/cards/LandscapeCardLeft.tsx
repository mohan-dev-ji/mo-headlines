import Link from "next/link";
import { Heart } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

interface LandscapeCardLeftProps {
  article: {
    _id: Id<"articles">;
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

export function LandscapeCardLeft({ article, className = "" }: LandscapeCardLeftProps) {
  const { user } = useUser();

  // Format publication date
  const publishedDate = new Date(article.publishedAt || article._creationTime || 0);
  const timeAgo = formatTimeAgo(publishedDate);

  // Get source count
  const sourceCount = article.sourceUrls?.length || 0;

  // Check if article is liked
  const isLiked = useQuery(
    api.likes.isArticleLiked,
    user?.id ? {
      articleId: article._id,
      userId: user.id
    } : "skip"
  );

  const toggleLike = useMutation(api.likes.toggleLike);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!user) {
      // Could redirect to sign in or show a modal
      return;
    }

    try {
      await toggleLike({
        articleId: article._id,
        userId: user.id
      });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <Link href={`/article/${article._id}`}>
      <div className={`group bg-brand-card rounded-lg overflow-hidden border border-brand-card hover:bg-brand-card-dark transition-colors duration-200 ${className}`}>
        <div className="flex h-auto">
          {/* Image - Left side (50% width) */}
          <div className="w-2/5 relative p-4 flex items-center">
            <div className="w-full h-52">
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

          {/* Content - Right side (50% width) */}
          <div className="w-3/5 pl-0 pr-4 py-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="font-abhaya-libre font-medium text-2xl leading-tight text-headline-primary group-hover:text-brand-primary transition-colors">
                {article.title}
              </h2>
              <p className="text-base text-body-secondary">{timeAgo}</p>
              {article.excerpt && (
                <p className="text-body-primary text-sm leading-normal line-clamp-3">
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
              <button
                onClick={handleLike}
                className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
              >
                <Heart className={`w-4 h-4 transition-colors ${
                  isLiked
                    ? "text-red-400 fill-red-400"
                    : "text-body-secondary hover:text-red-400"
                }`} />
              </button>
            </div>
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