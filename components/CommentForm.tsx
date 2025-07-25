"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface CommentFormProps {
  articleId: Id<"articles">;
}

export function CommentForm({ articleId }: CommentFormProps) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const createComment = useMutation(api.comments.createComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !user) return;

    try {
      await createComment({
        articleId,
        userId: user.id,
        username: user.unsafeMetadata?.username as string || "Anonymous",
        avatarUrl: user.imageUrl || "",
        content: content.trim(),
      });
      setContent("");
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="min-h-[100px]"
      />
      <div className="flex justify-end">
        <Button type="submit" className="h-8">
          Post Comment
        </Button>
      </div>
    </form>
  );
} 