import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Phase 0 Migration: Transform sourceUrls from string[] to object array
// This migration converts existing articles from the old format to the new enhanced structure

export const checkArticlesNeedingMigration = query({
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    
    const needsMigration = articles.filter(article => {
      // Check if sourceUrls exists and has at least one entry
      if (!article.sourceUrls || article.sourceUrls.length === 0) {
        return false;
      }
      
      // Check if it's still in old string format
      const firstSource = article.sourceUrls[0];
      return typeof firstSource === 'string';
    });

    return {
      total: articles.length,
      needsMigration: needsMigration.length,
      alreadyMigrated: articles.length - needsMigration.length,
      articles: needsMigration.map(article => ({
        _id: article._id,
        title: article.title,
        sourceCount: article.sourceUrls?.length || 0,
        sourceUrls: article.sourceUrls
      }))
    };
  },
});

export const migrateArticleSourceUrls = mutation({
  args: {
    articleId: v.id("articles"),
    preview: v.optional(v.boolean()), // If true, just return what would be migrated without saving
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }

    // Check if article needs migration
    if (!article.sourceUrls || article.sourceUrls.length === 0) {
      return { success: false, reason: "No sources to migrate" };
    }

    const firstSource = article.sourceUrls[0];
    if (typeof firstSource !== 'string') {
      return { success: false, reason: "Article already migrated" };
    }

    // Transform string[] to object array with fallbacks
    const migratedSources = (article.sourceUrls as any[]).map((item: any) => {
      // If already an object, return as-is
      if (typeof item === 'object' && item.url) {
        return item;
      }
      
      // Otherwise, treat as string URL and transform
      const url = typeof item === 'string' ? item : String(item);
      try {
        const urlObj = new URL(url);
        return {
          url,
          domain: urlObj.hostname.replace('www.', ''),
          title: `Source from ${urlObj.hostname}` // Fallback title
        };
      } catch (error) {
        // Fallback for invalid URLs
        return {
          url,
          domain: 'unknown',
          title: 'External Source'
        };
      }
    });

    if (args.preview) {
      return {
        success: true,
        preview: true,
        original: article.sourceUrls,
        migrated: migratedSources
      };
    }

    // Perform the migration
    await ctx.db.patch(args.articleId, {
      sourceUrls: migratedSources,
    });

    return {
      success: true,
      migrated: migratedSources.length,
      articleTitle: article.title
    };
  },
});

export const migrateBatchArticles = mutation({
  args: {
    articleIds: v.array(v.id("articles")),
    preview: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const results = {
      successful: [] as any[],
      failed: [] as any[],
      skipped: [] as any[],
      total: args.articleIds.length
    };

    for (const articleId of args.articleIds) {
      try {
        const result = await ctx.db
          .query("articles")
          .filter(q => q.eq(q.field("_id"), articleId))
          .first();
        
        if (!result) {
          results.failed.push({ articleId, error: "Article not found" });
          continue;
        }

        // Check if migration is needed
        if (!result.sourceUrls || result.sourceUrls.length === 0) {
          results.skipped.push({ articleId, reason: "No sources" });
          continue;
        }

        const firstSource = result.sourceUrls[0];
        if (typeof firstSource !== 'string') {
          results.skipped.push({ articleId, reason: "Already migrated" });
          continue;
        }

        // Transform sources
        const migratedSources = (result.sourceUrls as any[]).map((item: any) => {
          // If already an object, return as-is
          if (typeof item === 'object' && item.url) {
            return item;
          }
          
          // Otherwise, treat as string URL and transform
          const url = typeof item === 'string' ? item : String(item);
          try {
            const urlObj = new URL(url);
            return {
              url,
              domain: urlObj.hostname.replace('www.', ''),
              title: `Source from ${urlObj.hostname}`
            };
          } catch (error) {
            return {
              url,
              domain: 'unknown',
              title: 'External Source'
            };
          }
        });

        if (!args.preview) {
          // Perform migration
          await ctx.db.patch(articleId, {
            sourceUrls: migratedSources,
          });
        }

        results.successful.push({
          articleId,
          title: result.title,
          sourceCount: migratedSources.length,
          migrated: migratedSources
        });

      } catch (error) {
        results.failed.push({
          articleId,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    return results;
  },
});

// Helper function to preview all migrations
export const previewAllMigrations = query({
  handler: async (ctx) => {
    const check = await ctx.db.query("articles").collect();
    
    const migratable = check.filter(article => {
      if (!article.sourceUrls || article.sourceUrls.length === 0) return false;
      const firstSource = article.sourceUrls[0];
      return typeof firstSource === 'string';
    });

    return {
      total: check.length,
      migratable: migratable.length,
      preview: migratable.slice(0, 5).map(article => ({
        _id: article._id,
        title: article.title,
        current: article.sourceUrls,
        willBecome: (article.sourceUrls as any[]).map((item: any) => {
          // If already an object, return as-is
          if (typeof item === 'object' && item.url) {
            return item;
          }
          
          // Otherwise, treat as string URL and transform
          const url = typeof item === 'string' ? item : String(item);
          try {
            const urlObj = new URL(url);
            return {
              url,
              domain: urlObj.hostname.replace('www.', ''),
              title: `Source from ${urlObj.hostname}`
            };
          } catch (error) {
            return {
              url,
              domain: 'unknown',
              title: 'External Source'
            };
          }
        })
      }))
    };
  },
});

// One-click migrate all articles
export const migrateAllArticles = mutation({
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    
    const migratable = articles.filter(article => {
      if (!article.sourceUrls || article.sourceUrls.length === 0) return false;
      const firstSource = article.sourceUrls[0];
      return typeof firstSource === 'string';
    });

    const results = {
      processed: 0,
      migrated: 0,
      errors: [] as any[]
    };

    for (const article of migratable) {
      try {
        const migratedSources = (article.sourceUrls as any[]).map((item: any) => {
          // If already an object, return as-is
          if (typeof item === 'object' && item.url) {
            return item;
          }
          
          // Otherwise, treat as string URL and transform
          const url = typeof item === 'string' ? item : String(item);
          try {
            const urlObj = new URL(url);
            return {
              url,
              domain: urlObj.hostname.replace('www.', ''),
              title: `Source from ${urlObj.hostname}`
            };
          } catch (error) {
            return {
              url,
              domain: 'unknown',
              title: 'External Source'
            };
          }
        });

        await ctx.db.patch(article._id, {
          sourceUrls: migratedSources,
        });

        results.migrated++;
      } catch (error) {
        results.errors.push({
          articleId: article._id,
          title: article.title,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
      results.processed++;
    }

    return results;
  },
});