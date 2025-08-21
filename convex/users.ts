import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create user based on Clerk ID
export const getOrCreateUser = mutation({
  args: { clerkId: v.string(), username: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // First try to find existing user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user if doesn't exist
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      username: args.username,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});