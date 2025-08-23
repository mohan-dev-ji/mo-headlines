import { mutation, query} from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";


export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});


export const createArticle = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    categoryId: v.id("categories"),
    imageStorageId: v.optional(v.id("_storage")),
    excerpt: v.optional(v.string()),
    slug: v.string(),
  },
  handler: async (ctx, args): Promise<{ articleId: Id<"articles"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const articleId = await ctx.db.insert("articles", {
      title: args.title,
      body: args.body,
      categoryId: args.categoryId,
      authorId: identity.subject,
      imageStorageId: args.imageStorageId,
      status: "draft",
      sourceUrls: [],
      excerpt: args.excerpt || "",
      slug: args.slug,
      imageGenPrompts: [],
    });

    return { articleId };
  },
});

export const getArticle = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return null;

    const category = article.categoryId
      ? await ctx.db.get(article.categoryId)
      : null;

    let imageUrl = null;
    if (article.imageStorageId) {
      try {
        imageUrl = await ctx.storage.getUrl(article.imageStorageId);
        // Ensure the URL is absolute
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `https://${imageUrl}`;
        }
      } catch (error) {
        console.error("Error getting image URL:", error);
      }
    }

    return {
      ...article,
      category,
      imageUrl,
    };
  },
});

export const updateArticle = mutation({
  args: {
    id: v.id("articles"),
    title: v.string(),
    body: v.string(),
    categoryId: v.id("categories"),
    imageStorageId: v.optional(v.id("_storage")),
    excerpt: v.optional(v.string()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const article = await ctx.db.get(args.id);
    if (!article) {
      throw new Error("Article not found");
    }

    // Only allow the author to update the article
    if (article.authorId !== identity.subject) {
      throw new Error("Not authorized to update this article");
    }

    // If there's a new image and the article had an old image, delete the old one
    if (args.imageStorageId && article.imageStorageId && args.imageStorageId !== article.imageStorageId) {
      try {
        await ctx.storage.delete(article.imageStorageId);
      } catch (error) {
        console.error("Error deleting old image:", error);
      }
    }

    const updateData: any = {
      title: args.title,
      body: args.body,
      categoryId: args.categoryId,
      imageStorageId: args.imageStorageId,
    };
    
    if (args.excerpt !== undefined) {
      updateData.excerpt = args.excerpt;
    }
    if (args.slug !== undefined) {
      updateData.slug = args.slug;
    }
    
    await ctx.db.patch(args.id, updateData);

    return { success: true };
  },
});

export const getAllArticles = query({
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    
    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        let imageUrl = null;
        if (article.imageStorageId) {
          try {
            imageUrl = await ctx.storage.getUrl(article.imageStorageId);
            // Ensure the URL is absolute
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `https://${imageUrl}`;
            }
          } catch (error) {
            console.error("Error getting image URL:", error);
          }
        }
        return {
          ...article,
          category,
          imageUrl,
        };
      })
    );

    return articlesWithDetails.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const deleteArticle = mutation({
  args: {
    id: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const article = await ctx.db.get(args.id);
    if (!article) {
      throw new Error("Article not found");
    }

    // Only allow the author to delete the article
    if (article.authorId !== identity.subject) {
      throw new Error("Not authorized to delete this article");
    }

    // Delete the article's image if it exists
    if (article.imageStorageId) {
      try {
        await ctx.storage.delete(article.imageStorageId);
      } catch (error) {
        console.error("Error deleting article image:", error);
      }
    }

    // Delete the article
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

export const getArticlesByCategory = query({
  args: { categoryId: v.optional(v.id("categories")) },
  handler: async (ctx, args) => {
    if (!args.categoryId) return [];
    
    const articles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("categoryId"), args.categoryId))
      .collect();

    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        let imageUrl = null;
        if (article.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(article.imageStorageId);
        }
        return {
          ...article,
          category,
          imageUrl,
        };
      })
    );

    return articlesWithDetails;
  },
});

