"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import TimeAgo from "react-timeago";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { UserAvatar } from "./UserAvatar";

interface CommentProps {
  comment: {
    _id: Id<"comments">;
    userId: string;
    username: string;
    avatarUrl?: string;
    content: string;
    createdAt: number;
    updatedAt: number;
  };
  currentUserId: string | null;
  onEdit: () => void;
  onCancelEdit: () => void;
}

export function Comment({ comment, currentUserId, onEdit, onCancelEdit }: CommentProps) {
  const deleteComment = useMutation(api.comments.deleteComment);
  const updateComment = useMutation(api.comments.updateComment);
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const handleDelete = async () => {
    try {
      await deleteComment({ commentId: comment._id });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleSave = async () => {
    try {
      await updateComment({
        commentId: comment._id,
        content: editedContent.trim(),
      });
      setIsEditing(false);
      onCancelEdit();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleCancel = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
    onCancelEdit();
  };

  const isAuthor = currentUserId === comment.userId;

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <UserAvatar 
          userId={comment.userId} 
          username={comment.username} 
          avatarUrl={comment.avatarUrl}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.username}</span>
            <span className="text-sm text-muted-foreground">
              <TimeAgo date={comment.createdAt} />
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-sm text-muted-foreground">(edited)</span>
            )}
          </div>
        </div>
        {isAuthor && !isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                onEdit();
              }}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        {isAuthor && isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-8 w-8 p-0"
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[100px]"
        />
      ) : (
        <p className="text-sm">{comment.content}</p>
      )}
    </div>
  );
} 