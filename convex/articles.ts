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
    sourceUrls: v.optional(v.array(v.string())),
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
    sourceUrls: v.optional(v.array(v.string())),
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
      throw new Error("OpenAI API key not configured");
    }

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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return {
        imageUrl: data.data[0].url,
        success: true,
      };
    } catch (error) {
      console.error("DALL-E image generation error:", error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

