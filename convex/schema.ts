import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    body: v.string(),
    categoryId: v.id("categories"),
    topicIds: v.array(v.id("topics")),
    authorId: v.string(),
    createdAt: v.number(),
    imageStorageId: v.optional(v.id("_storage")), // Field for storing file storage ID
  }).index("by_category", ["categoryId"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    keywords: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_slug", ["slug"]),

  topics: defineTable({
    name: v.string(),
    slug: v.string(),
    createdAt: v.number(),
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

  rss_producer: defineTable({
    name: v.string(),
    url: v.string(),
    categoryId: v.id("categories"),
    isActive: v.boolean(),
    pollFrequency: v.number(),
    numberOfArticles: v.number(),
    lastPolled: v.optional(v.number()),
    nextRunTime: v.optional(v.number()),
    updatedAt: v.number(),
    // Run result fields
    lastRunSuccess: v.optional(v.boolean()),
    lastRunFeedStatus: v.optional(v.string()),
    lastRunCategoryStatus: v.optional(v.string()),
    lastRunArticlesFound: v.optional(v.number()),
    lastRunArticlesQueued: v.optional(v.number()),
    lastRunArticles: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      publishedAt: v.string(),
      excerpt: v.string(),
    }))),
    lastRunError: v.optional(v.string()),
  })
  .index("by_category", ["categoryId"])
  .index("by_active", ["isActive"])
  .index("by_next_run", ["nextRunTime"]),

  rss_queue: defineTable({
    producerId: v.id("rss_producer"),
    title: v.string(),
    description: v.string(),
    url: v.string(),
    publishedAt: v.number(),
    processed: v.boolean(),
    categories: v.optional(v.array(v.string())),
  })
  .index("by_producer", ["producerId"])
  .index("by_processed", ["processed"])
  .index("by_published", ["publishedAt"]),
});
