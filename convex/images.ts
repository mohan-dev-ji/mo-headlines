import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create image record (after generation/upload)
export const createImage = mutation({
  args: {
    articleId: v.id("articles"),
    promptId: v.id("prompts"),
    cloudflareUrl: v.string(),
    cloudflareKey: v.string(),
    model: v.string(),
    generationCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get article details for denormalized fields
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    
    const category = await ctx.db.get(article.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    
    const imageId = await ctx.db.insert("images", {
      articleId: args.articleId,
      promptId: args.promptId,
      cloudflareUrl: args.cloudflareUrl,
      cloudflareKey: args.cloudflareKey,
      status: "pending",
      model: args.model,
      generationCost: args.generationCost,
      articleTitle: article.title,
      categoryId: article.categoryId,
    });
    
    return { imageId };
  },
});

// Create standalone image record (for gallery context - no article)
export const createStandaloneImage = mutation({
  args: {
    promptId: v.id("prompts"),
    cloudflareUrl: v.string(),
    cloudflareKey: v.string(),
    model: v.string(),
    rating: v.optional(v.number()),
    generationCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const imageId = await ctx.db.insert("images", {
      articleId: undefined, // No article association
      promptId: args.promptId,
      cloudflareUrl: args.cloudflareUrl,
      cloudflareKey: args.cloudflareKey,
      status: "approved", // Gallery images start as approved
      rating: args.rating,
      model: args.model,
      generationCost: args.generationCost,
      articleTitle: undefined,
      categoryId: undefined,
    });
    
    return { imageId };
  },
});

// Update image metadata (rating, status, article association)
export const updateImageMetadata = mutation({
  args: {
    imageId: v.id("images"),
    rating: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("unused"))),
    articleId: v.optional(v.id("articles")),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }
    
    const updateData: any = {};
    
    if (args.rating !== undefined) {
      // Validate rating is between 1-10
      if (args.rating < 1 || args.rating > 10) {
        throw new Error("Rating must be between 1 and 10");
      }
      updateData.rating = args.rating;
    }
    
    if (args.status !== undefined) {
      updateData.status = args.status;
    }

    if (args.model !== undefined) {
      updateData.model = args.model;
    }
    
    if (args.articleId !== undefined && args.articleId !== image.articleId) {
      // Update article association and denormalized data
      const newArticle = await ctx.db.get(args.articleId);
      if (!newArticle) {
        throw new Error("New article not found");
      }
      
      updateData.articleId = args.articleId;
      updateData.articleTitle = newArticle.title;
      updateData.categoryId = newArticle.categoryId;
    }
    
    await ctx.db.patch(args.imageId, updateData);
    
    return { success: true };
  },
});

// List images with filtering (for gallery)
export const listImages = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("unused"))),
    categoryId: v.optional(v.id("categories")),
    articleId: v.optional(v.id("articles")),
    minRating: v.optional(v.number()),
    sortBy: v.optional(v.union(v.literal("rating"), v.literal("date"), v.literal("status"))),
    sortOrder: v.optional(v.union(v.literal("asc"), v.literal("desc"))),
  },
  handler: async (ctx, args) => {
    let images = await ctx.db.query("images").collect();
    
    // Apply filters
    if (args.status) {
      images = images.filter(img => img.status === args.status);
    }
    
    if (args.categoryId) {
      images = images.filter(img => img.categoryId === args.categoryId);
    }
    
    if (args.articleId) {
      images = images.filter(img => img.articleId === args.articleId);
    }
    
    if (args.minRating !== undefined) {
      images = images.filter(img => img.rating && img.rating >= args.minRating!);
    }
    
    // Apply sorting
    const sortBy = args.sortBy || "date";
    const sortOrder = args.sortOrder || "desc";
    
    images.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "rating":
          const aRating = a.rating || 0;
          const bRating = b.rating || 0;
          compareValue = aRating - bRating;
          break;
        case "status":
          compareValue = a.status.localeCompare(b.status);
          break;
        case "date":
        default:
          compareValue = a._creationTime - b._creationTime;
          break;
      }
      
      return sortOrder === "desc" ? -compareValue : compareValue;
    });
    
    // Enrich with related data
    const enrichedImages = await Promise.all(
      images.map(async (image) => {
        const prompt = await ctx.db.get(image.promptId);
        const article = image.articleId ? await ctx.db.get(image.articleId) : null;
        const category = image.categoryId ? await ctx.db.get(image.categoryId) : null;
        
        return {
          ...image,
          prompt: prompt?.prompt || "",
          promptSource: prompt?.source || "unknown",
          article: {
            title: article?.title || image.articleTitle || "Standalone Image",
            slug: article?.slug || "",
          },
          category: category ? {
            name: category.name,
            slug: category.slug,
          } : null,
        };
      })
    );
    
    return enrichedImages;
  },
});

// Get single image by ID (for detail page)
export const checkImageInUse = query({
  args: { imageId: v.id("images") },
  handler: async (ctx, args) => {
    // Check if image is being used by any articles
    const articles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("imageId"), args.imageId))
      .collect();

    return {
      isInUse: articles.length > 0,
      articlesCount: articles.length,
    };
  },
});

export const getImageById = query({
  args: { imageId: v.id("images") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      return null;
    }

    const prompt = await ctx.db.get(image.promptId);
    const article = image.articleId ? await ctx.db.get(image.articleId) : null;
    const category = image.categoryId ? await ctx.db.get(image.categoryId) : null;
    
    return {
      ...image,
      prompt: {
        text: prompt?.prompt || "",
        source: prompt?.source || "unknown",
        isUsed: prompt?.isUsed || false,
        editedFrom: prompt?.editedFrom || null,
      },
      article: article ? {
        id: article._id,
        title: article.title || image.articleTitle || "Standalone Image",
        slug: article.slug,
        status: article.status,
      } : {
        id: null,
        title: image.articleTitle || "Standalone Image", 
        slug: "",
        status: "standalone",
      },
      category: category ? {
        id: category._id,
        name: category.name,
        slug: category.slug,
      } : null,
    };
  },
});

// Get images analytics
export const getImagesAnalytics = query({
  args: { 
    categoryId: v.optional(v.id("categories")),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    let images = await ctx.db.query("images").collect();
    
    // Apply filters
    if (args.categoryId) {
      images = images.filter(img => img.categoryId === args.categoryId);
    }
    
    if (args.dateRange) {
      images = images.filter(img => 
        img._creationTime >= args.dateRange!.start && 
        img._creationTime <= args.dateRange!.end
      );
    }
    
    // Get prompt data for analysis
    const promptIds = images.map(img => img.promptId);
    const prompts = await Promise.all(
      promptIds.map(id => ctx.db.get(id))
    );
    
    const analytics = {
      totalImages: images.length,
      byStatus: {
        pending: images.filter(img => img.status === "pending").length,
        approved: images.filter(img => img.status === "approved").length,
        rejected: images.filter(img => img.status === "rejected").length,
        unused: images.filter(img => img.status === "unused").length,
      },
      byRating: {
        averageRating: images.filter(img => img.rating).reduce((sum, img) => sum + (img.rating || 0), 0) / images.filter(img => img.rating).length || 0,
        ratedImages: images.filter(img => img.rating).length,
        highRated: images.filter(img => img.rating && img.rating >= 7).length,
      },
      byPromptSource: {
        "ai-generated": prompts.filter(p => p?.source === "ai-generated").length,
        "custom": prompts.filter(p => p?.source === "custom").length,
        "edited": prompts.filter(p => p?.source === "edited").length,
      },
      byModel: images.reduce((acc, img) => {
        acc[img.model] = (acc[img.model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalCost: images.reduce((sum, img) => sum + (img.generationCost || 0), 0),
    };
    
    return analytics;
  },
});

// Delete image (and cleanup Cloudflare storage)
export const deleteImage = mutation({
  args: { imageId: v.id("images") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }
    
    // Check if image is being used by any articles
    const articles = await ctx.db
      .query("articles")
      .filter((q) => q.eq(q.field("imageId"), args.imageId))
      .collect();
    
    if (articles.length > 0) {
      throw new Error("Cannot delete image that is being used by articles");
    }
    
    // TODO: Add Cloudflare cleanup logic here
    // await cleanupCloudflareImage(image.cloudflareKey);
    
    await ctx.db.delete(args.imageId);
    
    return { success: true, cloudflareKey: image.cloudflareKey };
  },
});

// Bulk update image status/rating
export const bulkUpdateImages = mutation({
  args: {
    imageIds: v.array(v.id("images")),
    updates: v.object({
      status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("unused"))),
      rating: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const updates: any = {};
    
    if (args.updates.status !== undefined) {
      updates.status = args.updates.status;
    }
    
    if (args.updates.rating !== undefined) {
      if (args.updates.rating < 1 || args.updates.rating > 10) {
        throw new Error("Rating must be between 1 and 10");
      }
      updates.rating = args.updates.rating;
    }
    
    const results = [];
    for (const imageId of args.imageIds) {
      try {
        await ctx.db.patch(imageId, updates);
        results.push({ imageId, success: true });
      } catch (error) {
        results.push({ 
          imageId, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }
    
    return { 
      results,
      updated: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };
  },
});