"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Comment } from "./Comment";
import { CommentForm } from "./CommentForm";
import { Button } from "./ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";

interface CommentSectionProps {
  articleId: Id<"articles">;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { user, isLoaded } = useUser();
  const comments = useQuery(api.comments.getComments, { articleId });
  const [editingCommentId, setEditingCommentId] = useState<Id<"comments"> | null>(null);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Comments</h2>
        {!user && (
          <Link href={`/sign-in?redirect_url=${encodeURIComponent(window.location.href + '#comments')}`}>
            <Button variant="outline" className="gap-2">
              <LogIn className="h-4 w-4" />
              Leave a comment
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-4" id="comments">
        {comments?.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            currentUserId={user?.id || null}
            onEdit={() => setEditingCommentId(comment._id)}
            onCancelEdit={() => setEditingCommentId(null)}
          />
        ))}
      </div>

      {user ? (
        <CommentForm articleId={articleId} />
      ) : null}
    </div>
  );
} 