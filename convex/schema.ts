import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    body: v.string(),
    categoryId: v.id("categories"),
    authorId: v.string(),
    imageStorageId: v.optional(v.id("_storage")), // Field for storing file storage ID
    // AI Processing System fields
    status: v.union(v.literal("draft"), v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    isEdited: v.optional(v.boolean()),
    sourceUrls: v.array(v.string()),
    viewCount: v.optional(v.number()),
    excerpt: v.optional(v.string()),
    slug: v.string(),
    imageGenPrompts: v.array(v.string()), // AI-generated image prompts for Midjourney/OpenAI
  })
  .index("by_category", ["categoryId"])
  .index("by_status", ["status"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    keywords: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_slug", ["slug"]),


  comments: defineTable({
    articleId: v.id("articles"),
    userId: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    isDeleted: v.boolean(),
  })
  .index("by_article", ["articleId"])
  .index("by_user", ["userId"]),


  // Universal Create Queue (ADR 2) - Normalized queue for all content sources
  create_queue: defineTable({
    // Normalized fields - same for all source types
    title: v.string(),
    url: v.string(), 
    concept: v.string(), // Context for AI processing (RSS excerpt, research notes, YouTube transcript)
    category: v.string(), // Category name for processing
    
    // Source identification
    createSource: v.string(),
    
    // Processing workflow
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("complete")),
    queuedAt: v.number(),
    processedAt: v.optional(v.number()),
    isProcessing: v.boolean(),
    processed: v.boolean(),
    
    // AI Processing results
    generatedArticleId: v.optional(v.id("articles")),
    errorMessage: v.optional(v.string()),
    retryCount: v.optional(v.number()),
  })
  .index("by_status", ["status"])
  .index("by_processed", ["processed"])
  .index("by_queued_at", ["queuedAt"]),

  // Create workflow source tables
  create_rss: defineTable({
    name: v.string(),
    categoryId: v.id("categories"),
    // New fields (optional for backward compatibility)
    feedUrl: v.optional(v.string()),
    articlesInFeed: v.optional(v.number()), // Total number of articles found in the feed
    maxArticles: v.optional(v.number()), // Maximum articles to process
    matchedArticles: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      description: v.string(),
      pubDate: v.string(),
    }))), // Articles that matched category keywords
    publishedAt: v.optional(v.string()),
    // Legacy fields (for backward compatibility)
    url: v.optional(v.string()),
    numberOfArticles: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("complete"))),
    lastPolled: v.optional(v.number()),
    nextRunTime: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    matched: v.optional(v.number()),
    // Common fields
    pollFrequency: v.number(),
    isActive: v.boolean(),
    createdBy: v.id("users"),
  })
  .index("by_category", ["categoryId"])
  .index("by_feed", ["feedUrl"]),

  create_research: defineTable({
    title: v.string(),
    url: v.optional(v.string()),
    concept: v.string(),
    categoryId: v.optional(v.id("categories")),
    createdBy: v.id("users"),
    updatedAt: v.optional(v.number()),
  }),

  create_youtube: defineTable({
    videoUrl: v.string(),
    videoTitle: v.optional(v.string()),
    concept: v.string(),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("complete")),
    duration: v.optional(v.number()),
    category: v.string(),
    timecodeStart: v.optional(v.number()),
    timecodeEnd: v.optional(v.number()),
    createdBy: v.id("users"),
    updatedAt: v.optional(v.number()),
  }),

  

  users: defineTable({
    clerkId: v.string(),
    username: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),
});
