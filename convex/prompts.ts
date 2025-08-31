import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create prompts for article (used during AI processing)
export const createPromptsForArticle = mutation({
  args: {
    articleId: v.id("articles"),
    prompts: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const promptIds = [];
    
    for (const promptText of args.prompts) {
      const promptId = await ctx.db.insert("prompts", {
        articleId: args.articleId,
        prompt: promptText,
        source: "ai-generated",
        isUsed: false,
      });
      promptIds.push(promptId);
    }
    
    return { promptIds, count: promptIds.length };
  },
});

// Get prompts for article (for Generate tab dropdown)
export const getPromptsForArticle = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const allPrompts = await ctx.db
      .query("prompts")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();
    
    // Filter out prompts that have been superseded by edited versions
    const supersededPromptIds = allPrompts
      .filter(p => p.editedFrom)
      .map(p => p.editedFrom!);
    
    const activePrompts = allPrompts.filter(p => !supersededPromptIds.includes(p._id));
    
    return activePrompts.sort((a, b) => a._creationTime - b._creationTime);
  },
});

// Create custom prompt (via PromptModal)
export const createCustomPrompt = mutation({
  args: {
    articleId: v.id("articles"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const promptId = await ctx.db.insert("prompts", {
      articleId: args.articleId,
      prompt: args.prompt,
      source: "custom",
      isUsed: false,
    });
    
    return { promptId };
  },
});

// Create standalone prompt (for gallery context - no article required)
export const createStandalonePrompt = mutation({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const promptId = await ctx.db.insert("prompts", {
      articleId: undefined, // No article association
      prompt: args.prompt,
      source: "custom",
      isUsed: false,
    });
    
    return { promptId };
  },
});

// Edit prompt (creates new version with relationship tracking)
export const editPrompt = mutation({
  args: {
    originalPromptId: v.id("prompts"),
    newPromptText: v.string(),
  },
  handler: async (ctx, args) => {
    const originalPrompt = await ctx.db.get(args.originalPromptId);
    if (!originalPrompt) {
      throw new Error("Original prompt not found");
    }
    
    const editedPromptId = await ctx.db.insert("prompts", {
      articleId: originalPrompt.articleId,
      prompt: args.newPromptText,
      source: "edited",
      isUsed: false,
      editedFrom: args.originalPromptId,
    });
    
    return { promptId: editedPromptId };
  },
});

// Mark prompt as used (when used for image generation)
export const markPromptAsUsed = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.promptId, {
      isUsed: true,
    });
    
    return { success: true };
  },
});

// Set which prompt is currently selected for an article (unmarks others)
export const setSelectedPrompt = mutation({
  args: { 
    articleId: v.id("articles"),
    promptId: v.id("prompts")
  },
  handler: async (ctx, args) => {
    // First, unmark all prompts for this article
    const existingPrompts = await ctx.db
      .query("prompts")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();
    
    for (const prompt of existingPrompts) {
      if (prompt.isUsed) {
        await ctx.db.patch(prompt._id, { isUsed: false });
      }
    }
    
    // Then mark the selected one as used
    await ctx.db.patch(args.promptId, { isUsed: true });
    
    return { success: true };
  },
});

// Get prompt usage analytics
export const getPromptAnalytics = query({
  args: { articleId: v.optional(v.id("articles")) },
  handler: async (ctx, args) => {
    let prompts;
    
    if (args.articleId) {
      prompts = await ctx.db
        .query("prompts")
        .withIndex("by_article", (q) => q.eq("articleId", args.articleId!))
        .collect();
    } else {
      prompts = await ctx.db.query("prompts").collect();
    }
    
    const analytics = {
      total: prompts.length,
      bySource: {
        "ai-generated": prompts.filter(p => p.source === "ai-generated").length,
        "custom": prompts.filter(p => p.source === "custom").length,
        "edited": prompts.filter(p => p.source === "edited").length,
      },
      byUsage: {
        used: prompts.filter(p => p.isUsed).length,
        unused: prompts.filter(p => !p.isUsed).length,
      },
    };
    
    return analytics;
  },
});

// Delete prompt
export const deletePrompt = mutation({
  args: { promptId: v.id("prompts") },
  handler: async (ctx, args) => {
    // Check if prompt is being used by any images
    const images = await ctx.db
      .query("images")
      .filter((q) => q.eq(q.field("promptId"), args.promptId))
      .collect();
    
    if (images.length > 0) {
      throw new Error("Cannot delete prompt that is being used by images");
    }
    
    await ctx.db.delete(args.promptId);
    return { success: true };
  },
});