import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create Research Sources
// Research workflow for manual topic investigation and content creation

// Get all research sources
export const getResearchSources = query({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query("create_research").collect();
    return sources;
  },
});

// Get single research source
export const getResearchSource = query({
  args: { sourceId: v.id("create_research") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sourceId);
  },
});

// Create new research source
export const createResearchSource = mutation({
  args: {
    title: v.string(),
    url: v.optional(v.string()),
    concept: v.string(),
    categoryId: v.id("categories"),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const researchSourceId = await ctx.db.insert("create_research", {
      title: args.title,
      url: args.url,
      concept: args.concept,
      categoryId: args.categoryId,
      createdBy: args.createdBy,
      updatedAt: Date.now(),
    });

    return researchSourceId;
  },
});

// Update research source
export const updateResearchSource = mutation({
  args: {
    id: v.id("create_research"),
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    concept: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

// Delete research source
export const deleteResearchSource = mutation({
  args: { id: v.id("create_research") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Add research to universal create_queue
export const addResearchToQueue = mutation({
  args: { sourceId: v.id("create_research") },
  handler: async (ctx, args) => {
    // Get the research source
    const source = await ctx.db.get(args.sourceId);
    if (!source) {
      return { success: false, message: "Research source not found", count: 0 };
    }

    // Check if already in queue
    const existingQueueItem = await ctx.db
      .query("create_queue")
      .filter((q) => 
        q.eq(q.field("title"), source.title) && 
        q.eq(q.field("url"), source.url || "") &&
        q.eq(q.field("createSource"), `Research: ${source.title}`)
      )
      .first();

    if (existingQueueItem) {
      return { success: false, message: "Research already in queue", count: 0 };
    }

    // Get category name if categoryId exists
    let categoryName = "Research"; // Default fallback
    if (source.categoryId) {
      const category = await ctx.db.get(source.categoryId);
      categoryName = category?.name || "Research";
    }

    // Add to universal queue
    const queueItemId = await ctx.db.insert("create_queue", {
      title: source.title,
      url: source.url || `research://${source._id}`, // Use research ID as fallback URL
      concept: source.concept, // Research concept becomes context for AI processing
      category: categoryName,
      createSource: `Research: ${source.title}`,
      status: "pending",
      queuedAt: Date.now(),
      isProcessing: false,
      processed: false,
    });

    console.log(`✅ Added research "${source.title}" to queue`);

    // Delete the research source since it's now in the queue
    await ctx.db.delete(args.sourceId);

    return { 
      success: true, 
      message: `Added "${source.title}" to queue`, 
      count: 1,
      queueItemId: queueItemId
    };
  },
});

// Clear all research sources (development)
export const clearAllResearchSources = mutation({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query("create_research").collect();
    for (const source of sources) {
      await ctx.db.delete(source._id);
    }
    return { cleared: sources.length };
  },
});