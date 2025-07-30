import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    keywords: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const categoryId = await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
      keywords: args.keywords || [],
      isActive: args.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
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

export const getActiveCategories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getCategoriesWithKeywords = query({
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    keywords: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.keywords !== undefined) updates.keywords = args.keywords;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.categoryId, updates);

    return { success: true };
  },
});

export const getCategoryKeywords = query({
  args: { 
    categorySlug: v.string() 
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .filter((q) => q.and(
        q.eq(q.field("slug"), args.categorySlug),
        q.eq(q.field("isActive"), true)
      ))
      .first();

    if (!category) {
      throw new Error(`Category not found: ${args.categorySlug}`);
    }

    return {
      name: category.name,
      slug: category.slug,
      keywords: category.keywords || []
    };
  },
}); 