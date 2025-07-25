import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const createTopic = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if topic already exists
    const existingTopic = await ctx.db
      .query("topics")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingTopic) {
      return { topicId: existingTopic._id };
    }

    // Create new topic
    const topicId = await ctx.db.insert("topics", {
      name: args.name,
      slug: args.name.toLowerCase().replace(/\s+/g, "-"),
      createdAt: Date.now(),
    });

    return { topicId };
  },
});

export const getAllTopics = query({
  handler: async (ctx) => {
    return await ctx.db.query("topics").collect();
  },
});

export const getTopicsByIds = query({
  args: {
    topicIds: v.array(v.id("topics")),
  },
  handler: async (ctx, args) => {
    const topics = await Promise.all(
      args.topicIds.map((id) => ctx.db.get(id))
    );
    return topics.filter((topic): topic is NonNullable<typeof topic> => topic !== null);
  },
});

export const getTopicBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const topic = await ctx.db
      .query("topics")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();

    return topic;
  },
}); 