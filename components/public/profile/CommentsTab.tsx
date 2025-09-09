"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface CommentCardProps {
  comment: {
    _id: string;
    content: string;
    _creationTime: number;
    articleTitle: string;
    articleSlug: string;
    articleId: string;
  };
}

function CommentCard({ comment }: CommentCardProps) {
  const timeAgo = formatTimeAgo(new Date(comment._creationTime));

  return (
    <div className="bg-brand-card rounded-lg p-6 hover:bg-brand-card/80 transition-colors">
      <div className="space-y-3">
        {/* Article title (linked) */}
        <Link href={`/article/${comment.articleId}`}>
          <h3 className="text-lg font-medium text-headline-primary hover:text-brand-primary transition-colors line-clamp-1">
            {comment.articleTitle}
          </h3>
        </Link>
        
        {/* Comment text */}
        <p className="text-body-primary leading-relaxed">
          {comment.content}
        </p>
        
        {/* Timestamp */}
        <p className="text-xs text-body-secondary">
          {timeAgo}
        </p>
      </div>
    </div>
  );
}

export function CommentsTab() {
  const { user } = useUser();
  const userComments = useQuery(
    api.likes.getUserComments,
    user?.id ? { userId: user.id } : "skip"
  );

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-body-primary">Please sign in to view your comments.</p>
      </div>
    );
  }

  if (userComments === undefined) {
    return (
      <div className="flex justify-center py-8">
        <LoadingAnimation size={40} />
      </div>
    );
  }

  if (userComments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-body-greyed-out mx-auto mb-4" />
        <h3 className="text-lg font-medium text-headline-primary mb-2">No comments yet</h3>
        <p className="text-body-greyed-out">
          Comments you make on articles will appear here. Join the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userComments.map((comment) => (
        <CommentCard key={comment._id} comment={comment} />
      ))}
    </div>
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
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else {
      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    }
  }
}