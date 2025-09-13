import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    body: v.string(),
    categoryId: v.id("categories"),
    authorId: v.string(),
    imageId: v.optional(v.id("images")), // Link to selected image
    // Source identification
    createSource: v.string(),
    // AI Processing System fields
    status: v.union(v.literal("draft"), v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    isEdited: v.optional(v.boolean()),
    sourceUrls: v.array(v.object({
      url: v.string(),       // Full source URL
      domain: v.string(),    // Parsed domain name (e.g., "techcrunch")
      title: v.string(),     // Source article title
    })),
    viewCount: v.optional(v.number()),
    excerpt: v.optional(v.string()),
    slug: v.string(),
    publishedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
  .index("by_category", ["categoryId"])
  .index("by_status", ["status"]),

  prompts: defineTable({
    articleId: v.optional(v.id("articles")), // Optional for standalone prompts
    prompt: v.string(),
    source: v.union(v.literal("ai-generated"), v.literal("custom"), v.literal("edited")),
    isUsed: v.boolean(),
    editedFrom: v.optional(v.id("prompts")),
  })
  .index("by_article", ["articleId"])
  .index("by_usage", ["isUsed"]),

  images: defineTable({
    articleId: v.optional(v.id("articles")), // Optional for standalone images
    promptId: v.id("prompts"),
    cloudflareUrl: v.string(),
    cloudflareKey: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("unused")),
    rating: v.optional(v.number()),
    model: v.string(),
    generationCost: v.optional(v.number()),
    articleTitle: v.optional(v.string()), // Optional for standalone images
    categoryId: v.optional(v.id("categories")), // Optional for standalone images
  })
  .index("by_article", ["articleId"])
  .index("by_status", ["status"])
  .index("by_rating", ["rating"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    keywords: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    updatedAt: v.optional(v.number()),
  }).index("by_slug", ["slug"]),


  comments: defineTable({
    articleId: v.id("articles"),
    userId: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    content: v.string(),
    updatedAt: v.number(),
    isDeleted: v.boolean(),
  })
  .index("by_article", ["articleId"])
  .index("by_user", ["userId"]),

  likes: defineTable({
    userId: v.string(),
    articleId: v.id("articles"),
  })
  .index("by_user", ["userId"])
  .index("by_article", ["articleId"])
  .index("by_user_article", ["userId", "articleId"]),


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
    transcript: v.string(),
    categoryId: v.id("categories"),
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
