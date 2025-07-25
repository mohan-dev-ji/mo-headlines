import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get all comments for an article
export const getComments = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .collect();

    return comments;
  },
});

// Create a new comment
export const createComment = mutation({
  args: {
    articleId: v.id("articles"),
    userId: v.string(),
    username: v.string(),
    avatarUrl: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (identity.subject !== args.userId) {
      throw new Error("Not authorized");
    }

    const commentId = await ctx.db.insert("comments", {
      articleId: args.articleId,
      userId: args.userId,
      username: args.username,
      avatarUrl: args.avatarUrl,
      content: args.content,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    });

    return commentId;
  },
});

// Update a comment
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    await ctx.db.patch(args.commentId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

// Delete a comment (soft delete)
export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    await ctx.db.patch(args.commentId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });
  },
});

// Get a user's comments
export const getUserComments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .collect();

    return comments;
  },
});

// Get a single comment by ID
export const getComment = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.isDeleted) {
      return null;
    }
    return comment;
  },
}); 