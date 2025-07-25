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
    createdAt: v.number(),
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
});
