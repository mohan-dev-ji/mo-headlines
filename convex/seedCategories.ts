import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Enhanced categories with strategic keywords for RSS filtering
const PREDEFINED_CATEGORIES = [
  {
    name: "AI",
    slug: "ai",
    keywords: [
      "artificial intelligence",
      "ai",
      "AGI",
      "machine learning", 
      "neural network",
      "deep learning",
      "large language model",
      "llm",
      "chatbot",
      "generative ai",
      "computer vision",
      "natural language processing"
    ]
  },
  {
    name: "Startups",
    slug: "startups", 
    keywords: [
      "startup",
      "funding",
      "venture capital",
      "series a",
      "series b", 
      "seed funding",
      "ipo",
      "acquisition",
      "merger",
      "unicorn",
      "valuation"
    ]
  },
  {
    name: "Big Tech",
    slug: "big-tech",
    keywords: [
      "apple",
      "google",
      "microsoft", 
      "amazon",
      "meta",
      "netflix",
      "tesla",
      "nvidia",
      "openai",
      "anthropic",
      "perplexity",
      "openai",
      "deepmind",
      "deepseek"
    ]
  },
  {
    name: "Science",
    slug: "science",
    keywords: [
      "science",
      "breakthrough",
      "research",
      "study",
      "discovery",
      "clinical trial",
      "peer review",
      "laboratory",
      "experiment",
      "innovation",
      "scientific",
      "biotech",
      "cure"
    ]
  },
  {
    name: "Transport",
    slug: "transport",
    keywords: [
      "electric vehicle",
      "ev",
      "tesla",
      "battery",
      "charging station",
      "autonomous driving",
      "self-driving",
      "electric car",
      "lithium",
      "range anxiety",
      "robotaxi",
      "uber",
      "zenzic uk"
    ]
  }
];

export const seedCategories = mutation({
  args: {
    force: v.optional(v.boolean()), // Safety flag to prevent accidental runs
  },
  handler: async (ctx, args) => {
    if (!args.force) {
      throw new Error("Must set force: true to run seed script. This will replace all existing categories.");
    }

    console.log("Starting enhanced category seeding with keywords...");

    // Get existing categories
    const existingCategories = await ctx.db.query("categories").collect();
    const existingSlugs = new Set(existingCategories.map(c => c.slug));
    const predefinedSlugs = new Set(PREDEFINED_CATEGORIES.map(c => c.slug));

    let createdCount = 0;
    let updatedCount = 0;
    let deactivatedCount = 0;

    // Create or update predefined categories
    for (const category of PREDEFINED_CATEGORIES) {
      if (existingSlugs.has(category.slug)) {
        // Update existing category with new keywords and set active
        const existingCategory = existingCategories.find(c => c.slug === category.slug);
        if (existingCategory) {
          await ctx.db.patch(existingCategory._id, { 
            name: category.name,
            keywords: category.keywords,
            isActive: true,
            updatedAt: Date.now()
          });
          console.log(`Updated existing category: ${category.name} with ${category.keywords.length} keywords`);
          updatedCount++;
        }
        continue;
      }

      const categoryId = await ctx.db.insert("categories", {
        name: category.name,
        slug: category.slug,
        keywords: category.keywords,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      console.log(`Created category: ${category.name} with keywords: ${category.keywords.join(', ')} (${categoryId})`);
      createdCount++;
    }

    // Deactivate categories not in predefined list
    for (const existingCategory of existingCategories) {
      if (!predefinedSlugs.has(existingCategory.slug)) {
        await ctx.db.patch(existingCategory._id, { 
          isActive: false,
          updatedAt: Date.now()
        });
        console.log(`Deactivated category: ${existingCategory.name}`);
        deactivatedCount++;
      }
    }

    console.log(`Enhanced seeding complete. Created: ${createdCount}, Updated: ${updatedCount}, Deactivated: ${deactivatedCount}`);
    
    return {
      success: true,
      created: createdCount,
      updated: updatedCount,
      deactivated: deactivatedCount,
      total: PREDEFINED_CATEGORIES.length,
      categories: PREDEFINED_CATEGORIES.map(c => ({
        name: c.name,
        slug: c.slug,
        keywordCount: c.keywords.length
      }))
    };
  },
});

export const clearAllCategories = mutation({
  args: {
    confirm: v.literal("DELETE_ALL_CATEGORIES"), // Extra safety
  },
  handler: async (ctx, args) => {
    console.log("Clearing all categories...");
    
    const categories = await ctx.db.query("categories").collect();
    let deletedCount = 0;

    for (const category of categories) {
      await ctx.db.delete(category._id);
      deletedCount++;
    }

    console.log(`Deleted ${deletedCount} categories`);
    
    return {
      success: true,
      deleted: deletedCount
    };
  },
});

export const resetCategories = mutation({
  args: {
    confirm: v.literal("RESET_ALL_CATEGORIES"), // Extra safety
  },
  handler: async (ctx, args) => {
    console.log("Resetting all categories with enhanced keywords...");

    // First clear all existing categories
    const categories = await ctx.db.query("categories").collect();
    let deletedCount = 0;

    for (const category of categories) {
      await ctx.db.delete(category._id);
      deletedCount++;
    }

    console.log(`Deleted ${deletedCount} categories`);

    // Then seed new categories with keywords
    let createdCount = 0;

    for (const category of PREDEFINED_CATEGORIES) {
      const categoryId = await ctx.db.insert("categories", {
        name: category.name,
        slug: category.slug,
        keywords: category.keywords,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      console.log(`Created category: ${category.name} with ${category.keywords.length} keywords (${categoryId})`);
      createdCount++;
    }

    console.log("Enhanced category reset complete");
    
    return {
      success: true,
      deleted: deletedCount,
      created: createdCount,
      total: PREDEFINED_CATEGORIES.length
    };
  },
});

// Helper function to get category keywords for RSS filtering
export const getCategoryKeywords = mutation({
  args: {
    categorySlug: v.string(),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .filter(q => q.and(
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