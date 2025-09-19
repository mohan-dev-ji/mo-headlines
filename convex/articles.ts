import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";


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
    imageId: v.optional(v.id("images")),
    excerpt: v.optional(v.string()),
    slug: v.string(),
    createSource: v.optional(v.string()),
    sourceUrls: v.optional(v.array(v.object({
      url: v.string(),
      domain: v.string(),
      title: v.string(),
    }))),
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
      imageId: args.imageId,
      status: "draft",
      createSource: args.createSource || "Manual",
      sourceUrls: args.sourceUrls || [],
      excerpt: args.excerpt || "",
      slug: args.slug,
      updatedAt: Date.now(),
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
    let imageRating = null;
    let imageModel = null;
    if (article.imageId) {
      try {
        const image = await ctx.db.get(article.imageId);
        if (image) {
          imageUrl = image.cloudflareUrl;
          imageRating = image.rating;
          imageModel = image.model;
        }
      } catch (error) {
        console.error("Error getting image URL:", error);
      }
    }

    return {
      ...article,
      category,
      imageUrl,
      imageRating,
      imageModel,
    };
  },
});

export const updateArticle = mutation({
  args: {
    id: v.id("articles"),
    title: v.string(),
    body: v.string(),
    categoryId: v.id("categories"),
    imageId: v.optional(v.id("images")),
    excerpt: v.optional(v.string()),
    slug: v.optional(v.string()),
    createSource: v.optional(v.string()),
    sourceUrls: v.optional(v.array(v.object({
      url: v.string(),
      domain: v.string(),
      title: v.string(),
    }))),
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


    const updateData: any = {
      title: args.title,
      body: args.body,
      categoryId: args.categoryId,
      imageId: args.imageId,
      updatedAt: Date.now(),
    };
    
    if (args.excerpt !== undefined) {
      updateData.excerpt = args.excerpt;
    }
    if (args.slug !== undefined) {
      updateData.slug = args.slug;
    }
    if (args.createSource !== undefined) {
      updateData.createSource = args.createSource;
    }
    if (args.sourceUrls !== undefined) {
      updateData.sourceUrls = args.sourceUrls;
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
        if (article.imageId) {
          try {
            const image = await ctx.db.get(article.imageId);
            if (image) {
              imageUrl = image.cloudflareUrl;
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

    // Note: Image cleanup will be handled by the images table

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
        if (article.imageId) {
          const image = await ctx.db.get(article.imageId);
          if (image) {
            imageUrl = image.cloudflareUrl;
          }
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

// Review System Functions

export const getArticlesByStatus = query({
  args: { status: v.union(v.literal("draft"), v.literal("pending"), v.literal("approved"), v.literal("rejected")) },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();

    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        let imageUrl = null;
        if (article.imageId) {
          try {
            const image = await ctx.db.get(article.imageId);
            if (image) {
              imageUrl = image.cloudflareUrl;
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

export const updateArticleStatus = mutation({
  args: {
    id: v.id("articles"),
    status: v.union(v.literal("draft"), v.literal("pending"), v.literal("approved"), v.literal("rejected")),
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

    await ctx.db.patch(args.id, {
      status: args.status,
    });

    return { success: true };
  },
});

// Internal mutation to update article with image - Updated for new architecture
export const updateArticleImage = internalMutation({
  args: {
    articleId: v.id("articles"),
    imageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      imageId: args.imageId,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

// Public mutation to attach image to article (called from AddImagePage)
export const attachImageToArticle = mutation({
  args: {
    articleId: v.id("articles"),
    imageId: v.id("images"),
  },
  handler: async (ctx, args) => {
    // Verify the article exists
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }

    // Verify the image exists
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    // Update the article with the image ID
    await ctx.db.patch(args.articleId, {
      imageId: args.imageId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const saveGeneratedImage = action({
  args: {
    articleId: v.id("articles"),
    imageUrl: v.string(),
    promptUsed: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Download the image from DALL-E URL
      const response = await fetch(args.imageUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch generated image");
      }

      const imageBlob = await response.blob();
      
      // Generate upload URL for Convex storage
      const uploadUrl = await ctx.storage.generateUploadUrl();
      
      // Upload the image to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": imageBlob.type },
        body: imageBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to storage");
      }

      const { storageId } = await uploadResponse.json();

      // TODO: Update for new architecture - create image record first, then link to article
      // This function needs to be updated once the images table functions are created

      return { success: true, storageId };
    } catch (error) {
      console.error("Error saving generated image:", error);
      throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

export const generateImageWithDallE = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error("OpenAI API key not configured");
      throw new Error("OpenAI API key not configured");
    }

    // Validate prompt length (OpenAI has limits)
    if (args.prompt.length > 1000) {
      throw new Error("Prompt is too long. Maximum 1000 characters allowed.");
    }

    if (!args.prompt.trim()) {
      throw new Error("Prompt cannot be empty");
    }

    console.log("Generating DALL-E image with prompt:", args.prompt.substring(0, 100) + "...");

    try {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: args.prompt,
          n: 1,
          size: "1792x1024", // 16:10 aspect ratio, closest to 16:9
          quality: "standard",
          response_format: "url"
        }),
      });

      console.log("OpenAI API response status:", response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          console.error("OpenAI API error details:", errorData);

          if (errorData.error) {
            if (errorData.error.code === 'invalid_api_key') {
              errorMessage = "Invalid OpenAI API key";
            } else if (errorData.error.code === 'insufficient_quota') {
              errorMessage = "OpenAI API quota exceeded";
            } else if (errorData.error.code === 'content_policy_violation') {
              errorMessage = "Content policy violation - please modify your prompt";
            } else {
              errorMessage = errorData.error.message || errorMessage;
            }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }

        throw new Error(`OpenAI API error: ${errorMessage}`);
      }

      const data = await response.json();
      console.log("DALL-E image generated successfully");

      if (!data.data || !data.data[0] || !data.data[0].url) {
        throw new Error("Invalid response from OpenAI API - no image URL returned");
      }

      return {
        imageUrl: data.data[0].url,
        success: true,
      };
    } catch (error) {
      console.error("DALL-E image generation error:", error);

      if (error instanceof Error) {
        // Re-throw the error with the original message for better debugging
        throw error;
      } else {
        throw new Error(`Failed to generate image: Unknown error`);
      }
    }
  },
});

// Calendar Discovery System - ADR 5 Implementation

export const getArticlesByDateRange = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD format
    endDate: v.string(),   // YYYY-MM-DD format
    categoryId: v.optional(v.id("categories")), // Optional category filter
    limit: v.optional(v.number()), // For pagination
    offset: v.optional(v.number()), // For pagination
  },
  handler: async (ctx, args) => {
    const startMs = new Date(args.startDate).getTime();
    const endMs = new Date(args.endDate).getTime() + 24 * 60 * 60 * 1000 - 1; // End of day

    let query = ctx.db.query("articles")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), startMs),
          q.lte(q.field("_creationTime"), endMs),
          q.eq(q.field("status"), "approved")
        )
      );

    // Add category filter if provided
    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }

    let articles = await query.collect();

    // Sort by creation time (newest first)
    articles.sort((a, b) => b._creationTime - a._creationTime);

    // Apply pagination if provided
    if (args.offset !== undefined || args.limit !== undefined) {
      const offset = args.offset || 0;
      const limit = args.limit || 10;
      articles = articles.slice(offset, offset + limit);
    }

    // Add category and image details
    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        let imageUrl = null;
        if (article.imageId) {
          try {
            const image = await ctx.db.get(article.imageId);
            if (image) {
              imageUrl = image.cloudflareUrl;
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

    return articlesWithDetails;
  },
});

export const getDateCounts = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD format
    endDate: v.string(),   // YYYY-MM-DD format
    categoryId: v.optional(v.id("categories")), // Optional category filter
  },
  handler: async (ctx, args) => {
    const startMs = new Date(args.startDate).getTime();
    const endMs = new Date(args.endDate).getTime() + 24 * 60 * 60 * 1000 - 1; // End of day

    let query = ctx.db.query("articles")
      .filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), startMs),
          q.lte(q.field("_creationTime"), endMs),
          q.eq(q.field("status"), "approved")
        )
      );

    // Add category filter if provided
    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }

    const articles = await query.collect();

    // Group articles by date (YYYY-MM-DD format)
    const dateCounts: Record<string, number> = {};

    articles.forEach(article => {
      const date = new Date(article._creationTime).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    return dateCounts;
  },
});

export const getArticlesWithPagination = query({
  args: {
    categoryId: v.optional(v.id("categories")), // Optional category filter
    selectedDate: v.optional(v.string()), // Optional date filter (YYYY-MM-DD)
    limit: v.optional(v.number()), // Default 10
    offset: v.optional(v.number()), // Default 0
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const offset = args.offset || 0;

    let query = ctx.db.query("articles")
      .filter((q) => q.eq(q.field("status"), "approved"));

    // Add category filter if provided
    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }

    // Add date filter if provided
    if (args.selectedDate) {
      const startMs = new Date(args.selectedDate).getTime();
      const endMs = startMs + 24 * 60 * 60 * 1000 - 1; // End of day
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("_creationTime"), startMs),
          q.lte(q.field("_creationTime"), endMs)
        )
      );
    }

    let articles = await query.collect();

    // Sort by creation time (newest first)
    articles.sort((a, b) => b._creationTime - a._creationTime);

    // Get total count for pagination metadata
    const total = articles.length;

    // Apply pagination
    articles = articles.slice(offset, offset + limit);

    // Add category and image details
    const articlesWithDetails = await Promise.all(
      articles.map(async (article) => {
        const category = await ctx.db.get(article.categoryId);
        let imageUrl = null;
        if (article.imageId) {
          try {
            const image = await ctx.db.get(article.imageId);
            if (image) {
              imageUrl = image.cloudflareUrl;
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

    return {
      articles: articlesWithDetails,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    };
  },
});

