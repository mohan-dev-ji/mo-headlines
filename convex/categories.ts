import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      createdAt: Date.now(),
    });

    return { categoryId };
  },
});

export const getAllCategories = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const getCategoryBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
  },
}); 