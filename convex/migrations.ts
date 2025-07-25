// convex/migrations.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// This file is kept for future migrations if needed

export const backfillAuthorIds = mutation({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    for (const article of articles) {
      if (!article.authorId) {
        await ctx.db.patch(article._id, { authorId: "SYSTEM" }); // Use placeholder
      }
    }
  },
});

export const migrateArticleCategories = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting category migration...");
    
    // First, ensure we have the basic categories
    const categories = await ctx.db.query("categories").collect();
    console.log("Existing categories:", categories.length);
    
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c._id]));

    // Get all articles
    const articles = await ctx.db.query("articles").collect();
    console.log("Total articles:", articles.length);
    
    let migratedCount = 0;
    for (const article of articles) {
      // If the article has a category field (old schema)
      if ("category" in article) {
        const categoryName = article.category as string;
        let categoryId: Id<"categories">;
        
        // Check if we already have this category
        if (categoryMap.has(categoryName.toLowerCase())) {
          categoryId = categoryMap.get(categoryName.toLowerCase())!;
        } else {
          // Create new category if it doesn't exist
          categoryId = await ctx.db.insert("categories", {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
            createdAt: Date.now(),
          });
          categoryMap.set(categoryName.toLowerCase(), categoryId);
        }
        
        // Update the article to use categoryId
        await ctx.db.patch(article._id, {
          categoryId,
        });
        
        migratedCount++;
      }
    }
    
    console.log("Migration complete. Migrated articles:", migratedCount);
    return { success: true, migratedCount };
  },
});
