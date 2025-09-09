import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Toggle like/unlike for an article
export const toggleLike = mutation({
  args: { 
    articleId: v.id("articles"),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    // Check if like already exists
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_article", (q) => 
        q.eq("userId", args.userId).eq("articleId", args.articleId)
      )
      .first();

    if (existingLike) {
      // Unlike - delete the existing like
      await ctx.db.delete(existingLike._id);
      return { liked: false };
    } else {
      // Like - create new like
      await ctx.db.insert("likes", {
        userId: args.userId,
        articleId: args.articleId,
      });
      return { liked: true };
    }
  },
});

// Check if user has liked a specific article
export const isArticleLiked = query({
  args: {
    articleId: v.id("articles"),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_article", (q) => 
        q.eq("userId", args.userId).eq("articleId", args.articleId)
      )
      .first();

    return !!like;
  },
});

// Get all articles liked by a user with full article data
export const getUserLikedArticles = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get full article data for each liked article
    const likedArticles = await Promise.all(
      likes.map(async (like) => {
        const article = await ctx.db.get(like.articleId);
        if (!article) return null;

        // Get category info
        const category = await ctx.db.get(article.categoryId);
        
        // Get image info if available
        let imageUrl = null;
        if (article.imageId) {
          const image = await ctx.db.get(article.imageId);
          imageUrl = image?.cloudflareUrl || null;
        }

        return {
          ...article,
          category: category?.name || "Uncategorized",
          imageUrl,
          likedAt: like._creationTime,
        };
      })
    );

    // Filter out null articles and sort by most recently liked
    return likedArticles
      .filter((article) => article !== null)
      .sort((a, b) => b.likedAt - a.likedAt);
  },
});

// Get all comments by a user with article info
export const getUserComments = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .collect();

    // Get article info for each comment
    const commentsWithArticles = await Promise.all(
      comments.map(async (comment) => {
        const article = await ctx.db.get(comment.articleId);
        if (!article) return null;

        return {
          ...comment,
          articleTitle: article.title,
          articleSlug: article.slug,
        };
      })
    );

    // Filter out null comments and sort by most recent
    return commentsWithArticles
      .filter((comment) => comment !== null)
      .sort((a, b) => b._creationTime - a._creationTime);
  },
});