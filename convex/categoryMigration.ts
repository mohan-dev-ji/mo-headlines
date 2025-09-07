import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Phase 1: Category Migration from 5 categories to 3 categories (ADR 4)
// Maps old categories (AI, Startups, Big Tech, Science, Transport) to new simplified structure

// Category mapping for article migration
const CATEGORY_MIGRATION_MAP = {
  // Tech & Science gets: AI + Big Tech + Science + tech Transport terms
  "ai": "tech-science",
  "big-tech": "tech-science", 
  "science": "tech-science",
  
  // Finance gets: Startups + financial terms
  "startups": "finance",
  
  // Policies gets: Transport (policy-focused) + government terms  
  "transport": "policies"
} as const;

// Check articles that need category migration
export const checkCategoryMigrationNeeded = query({
  handler: async (ctx) => {
    // Get all articles
    const articles = await ctx.db.query("articles").collect();
    
    // Get current categories
    const categories = await ctx.db.query("categories").collect();
    const categoryMap = new Map(categories.map(cat => [cat._id, cat]));
    
    // Analyze migration needs
    const migrationNeeds = {
      total: articles.length,
      needsMigration: 0,
      alreadyMigrated: 0,
      byOldCategory: {} as Record<string, number>,
      byNewCategory: {} as Record<string, number>,
      articles: [] as any[]
    };

    for (const article of articles) {
      const category = categoryMap.get(article.categoryId);
      if (!category) continue;
      
      const categorySlug = category.slug;
      
      // Check if this is an old category that needs migration
      if (categorySlug in CATEGORY_MIGRATION_MAP) {
        migrationNeeds.needsMigration++;
        migrationNeeds.byOldCategory[categorySlug] = (migrationNeeds.byOldCategory[categorySlug] || 0) + 1;
        
        const targetSlug = CATEGORY_MIGRATION_MAP[categorySlug as keyof typeof CATEGORY_MIGRATION_MAP];
        migrationNeeds.byNewCategory[targetSlug] = (migrationNeeds.byNewCategory[targetSlug] || 0) + 1;
        
        migrationNeeds.articles.push({
          _id: article._id,
          title: article.title,
          currentCategory: category.name,
          currentSlug: categorySlug,
          willMigrateTo: targetSlug,
          publishedAt: article.publishedAt,
          status: article.status
        });
      } else {
        migrationNeeds.alreadyMigrated++;
      }
    }

    return migrationNeeds;
  }
});

// Preview what the migration would do
export const previewCategoryMigration = query({
  handler: async (ctx) => {
    const currentCategories = await ctx.db.query("categories").collect();
    const articles = await ctx.db.query("articles").collect();
    
    const preview = {
      currentCategories: currentCategories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        keywordCount: cat.keywords?.length || 0,
        articleCount: articles.filter(a => a.categoryId === cat._id).length,
        isActive: cat.isActive
      })),
      migrationMapping: Object.entries(CATEGORY_MIGRATION_MAP).map(([oldSlug, newSlug]) => ({
        from: oldSlug,
        to: newSlug,
        articleCount: articles.filter(a => {
          const cat = currentCategories.find(c => c._id === a.categoryId);
          return cat?.slug === oldSlug;
        }).length
      })),
      newCategoryStructure: [
        {
          name: "Tech & Science",
          slug: "tech-science",
          willReceiveFrom: ["ai", "big-tech", "science"],
          estimatedArticles: articles.filter(a => {
            const cat = currentCategories.find(c => c._id === a.categoryId);
            return cat && ["ai", "big-tech", "science"].includes(cat.slug);
          }).length
        },
        {
          name: "Finance", 
          slug: "finance",
          willReceiveFrom: ["startups"],
          estimatedArticles: articles.filter(a => {
            const cat = currentCategories.find(c => c._id === a.categoryId);
            return cat?.slug === "startups";
          }).length
        },
        {
          name: "Policies",
          slug: "policies", 
          willReceiveFrom: ["transport"],
          estimatedArticles: articles.filter(a => {
            const cat = currentCategories.find(c => c._id === a.categoryId);
            return cat?.slug === "transport";
          }).length
        }
      ]
    };

    return preview;
  }
});

// Migrate a single article to new category
export const migrateArticleCategory = mutation({
  args: {
    articleId: v.id("articles"),
    preview: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }

    // Get current category
    const currentCategory = await ctx.db.get(article.categoryId);
    if (!currentCategory) {
      throw new Error("Current category not found");
    }

    // Check if migration is needed
    const currentSlug = currentCategory.slug;
    if (!(currentSlug in CATEGORY_MIGRATION_MAP)) {
      return { 
        success: false, 
        reason: `Category '${currentSlug}' doesn't need migration`,
        currentCategory: currentCategory.name
      };
    }

    // Find target category
    const targetSlug = CATEGORY_MIGRATION_MAP[currentSlug as keyof typeof CATEGORY_MIGRATION_MAP];
    const targetCategory = await ctx.db
      .query("categories")
      .filter(q => q.eq(q.field("slug"), targetSlug))
      .first();

    if (!targetCategory) {
      throw new Error(`Target category '${targetSlug}' not found. Run seedCategories first.`);
    }

    if (args.preview) {
      return {
        success: true,
        preview: true,
        article: {
          title: article.title,
          currentCategory: currentCategory.name,
          targetCategory: targetCategory.name,
          mapping: `${currentSlug} → ${targetSlug}`
        }
      };
    }

    // Perform migration
    await ctx.db.patch(args.articleId, {
      categoryId: targetCategory._id
    });

    return {
      success: true,
      migrated: {
        articleTitle: article.title,
        fromCategory: currentCategory.name,
        toCategory: targetCategory.name,
        mapping: `${currentSlug} → ${targetSlug}`
      }
    };
  }
});

// Migrate all articles in batch
export const migrateBatchArticles = mutation({
  args: {
    articleIds: v.optional(v.array(v.id("articles"))), // If empty, migrate all eligible
    preview: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Get articles to migrate
    let articles;
    if (args.articleIds && args.articleIds.length > 0) {
      articles = await Promise.all(
        args.articleIds.map(id => ctx.db.get(id))
      );
      articles = articles.filter(a => a !== null);
    } else {
      // Get all articles
      articles = await ctx.db.query("articles").collect();
    }

    const results = {
      total: articles.length,
      migrated: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    };

    // Get all categories for lookup
    const categories = await ctx.db.query("categories").collect();
    const categoryMap = new Map(categories.map(cat => [cat._id, cat]));
    const slugToCategoryMap = new Map(categories.map(cat => [cat.slug, cat]));

    for (const article of articles) {
      try {
        const currentCategory = categoryMap.get(article.categoryId);
        if (!currentCategory) {
          results.skipped++;
          results.details.push({
            articleId: article._id,
            title: article.title,
            status: "skipped",
            reason: "Current category not found"
          });
          continue;
        }

        const currentSlug = currentCategory.slug;
        
        // Check if migration is needed
        if (!(currentSlug in CATEGORY_MIGRATION_MAP)) {
          results.skipped++;
          results.details.push({
            articleId: article._id,
            title: article.title,
            status: "skipped",
            reason: `Category '${currentSlug}' doesn't need migration`
          });
          continue;
        }

        // Find target category
        const targetSlug = CATEGORY_MIGRATION_MAP[currentSlug as keyof typeof CATEGORY_MIGRATION_MAP];
        const targetCategory = slugToCategoryMap.get(targetSlug);

        if (!targetCategory) {
          results.errors++;
          results.details.push({
            articleId: article._id,
            title: article.title,
            status: "error",
            reason: `Target category '${targetSlug}' not found`
          });
          continue;
        }

        if (!args.preview) {
          // Perform migration
          await ctx.db.patch(article._id, {
            categoryId: targetCategory._id
          });
        }

        results.migrated++;
        results.details.push({
          articleId: article._id,
          title: article.title,
          status: args.preview ? "preview" : "migrated",
          fromCategory: currentCategory.name,
          toCategory: targetCategory.name,
          mapping: `${currentSlug} → ${targetSlug}`
        });

      } catch (error) {
        results.errors++;
        results.details.push({
          articleId: article._id,
          title: article.title,
          status: "error",
          reason: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return results;
  }
});

// One-click migration: Seed new categories + migrate all articles
export const performCompleteCategoryMigration = mutation({
  args: {
    confirm: v.literal("MIGRATE_TO_3_CATEGORIES") // Safety confirmation
  },
  handler: async (ctx, args) => {
    console.log("Starting complete category migration...");

    const results = {
      phase1_seedCategories: null as any,
      phase2_migrateArticles: null as any,
      phase3_cleanup: null as any
    };

    try {
      // Phase 1: Seed new 3-category structure
      console.log("Phase 1: Seeding new categories...");
      // Note: This would call seedCategories, but we need to import it
      // For now, user should run seedCategories separately
      results.phase1_seedCategories = { 
        note: "Run seedCategories mutation first with force: true" 
      };

      // Phase 2: Migrate all articles
      console.log("Phase 2: Migrating articles...");
      results.phase2_migrateArticles = await ctx.db
        .query("articles")
        .collect()
        .then(async (articles) => {
          const migrationResults = {
            total: articles.length,
            migrated: 0,
            skipped: 0,
            errors: [] as any[]
          };

          const categories = await ctx.db.query("categories").collect();
          const categoryMap = new Map(categories.map(cat => [cat._id, cat]));
          const slugToCategoryMap = new Map(categories.map(cat => [cat.slug, cat]));

          for (const article of articles) {
            const currentCategory = categoryMap.get(article.categoryId);
            if (!currentCategory) {
              migrationResults.skipped++;
              continue;
            }

            const currentSlug = currentCategory.slug;
            if (!(currentSlug in CATEGORY_MIGRATION_MAP)) {
              migrationResults.skipped++;
              continue;
            }

            const targetSlug = CATEGORY_MIGRATION_MAP[currentSlug as keyof typeof CATEGORY_MIGRATION_MAP];
            const targetCategory = slugToCategoryMap.get(targetSlug);

            if (!targetCategory) {
              migrationResults.errors.push({
                article: article.title,
                error: `Target category '${targetSlug}' not found`
              });
              continue;
            }

            await ctx.db.patch(article._id, {
              categoryId: targetCategory._id
            });

            migrationResults.migrated++;
          }

          return migrationResults;
        });

      console.log("Category migration completed successfully");
      return results;

    } catch (error) {
      console.error("Category migration failed:", error);
      throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

// Get migration statistics
export const getCategoryMigrationStats = query({
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    const categories = await ctx.db.query("categories").collect();
    
    const categoryMap = new Map(categories.map(cat => [cat._id, cat]));
    
    const stats = {
      totalArticles: articles.length,
      categoriesCount: categories.length,
      activeCategories: categories.filter(c => c.isActive !== false).length,
      distribution: {} as Record<string, {name: string, count: number, keywords: number}>,
      oldCategoryArticles: 0,
      newCategoryArticles: 0
    };

    // Count articles per category
    for (const article of articles) {
      const category = categoryMap.get(article.categoryId);
      if (category) {
        if (!stats.distribution[category.slug]) {
          stats.distribution[category.slug] = {
            name: category.name,
            count: 0,
            keywords: category.keywords?.length || 0
          };
        }
        stats.distribution[category.slug].count++;

        // Check if it's old or new category structure
        if (category.slug in CATEGORY_MIGRATION_MAP) {
          stats.oldCategoryArticles++;
        } else if (['tech-science', 'finance', 'policies'].includes(category.slug)) {
          stats.newCategoryArticles++;
        }
      }
    }

    return stats;
  }
});