import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Migration function to copy articles from dev to prod
export const migrateArticlesFromDev = internalMutation({
  args: { articles: v.array(v.any()) },
  handler: async (ctx, { articles }) => {
    console.log(`Starting migration of ${articles.length} articles`);
    
    for (const article of articles) {
      try {
        // Clean the article data - remove _id and _creationTime
        const cleanArticle = {
          title: article.title,
          body: article.body,
          categoryId: article.categoryId,
          authorId: article.authorId,
          imageId: undefined, // Skip images for now - they don't exist in production
          createSource: article.createSource,
          status: article.status,
          isEdited: article.isEdited || false,
          sourceUrls: article.sourceUrls || [],
          viewCount: article.viewCount || 0,
          excerpt: article.excerpt || undefined,
          slug: article.slug,
          publishedAt: article.publishedAt || undefined,
          updatedAt: article.updatedAt,
        };

        await ctx.db.insert("articles", cleanArticle);
        console.log(`Migrated article: ${article.title}`);
      } catch (error) {
        console.error(`Failed to migrate article ${article.title}:`, error);
      }
    }
    
    console.log("Articles migration complete");
  },
});

// Migration function to copy categories from dev to prod (preserving IDs)
export const migrateCategoriesFromDev = mutation({
  args: { categories: v.array(v.any()) },
  handler: async (ctx, { categories }) => {
    console.log(`Starting migration of ${categories.length} categories`);
    
    for (const category of categories) {
      try {
        // Clean the category data
        const cleanCategory = {
          name: category.name,
          slug: category.slug, 
          keywords: category.keywords || [],
          isActive: category.isActive !== false,
          createdAt: category.createdAt || Date.now(),
          updatedAt: Date.now(),
        };

        // Try to insert with the original ID to preserve relationships
        await ctx.db.insert("categories", cleanCategory);
        console.log(`Migrated category: ${category.name} (ID: ${category._id})`);
      } catch (error) {
        console.error(`Failed to migrate category ${category.name}:`, error);
      }
    }
    
    console.log("Categories migration complete");
  },
});

// Transform sourceUrls from string[] to enhanced object array
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

// Migration function to copy RSS feeds from dev to prod
export const migrateRssFeedsFromDev = internalMutation({
  args: { feeds: v.array(v.any()) },
  handler: async (ctx, { feeds }) => {
    console.log(`Starting migration of ${feeds.length} RSS feeds`);
    
    for (const feed of feeds) {
      try {
        // Clean the RSS feed data
        const cleanFeed = {
          name: feed.name,
          categoryId: feed.categoryId,
          feedUrl: feed.feedUrl || feed.url, // Handle both old and new field names
          articlesInFeed: feed.articlesInFeed || feed.numberOfArticles || 0,
          maxArticles: feed.maxArticles || 10,
          matchedArticles: feed.matchedArticles || [],
          publishedAt: feed.publishedAt || undefined,
          pollFrequency: feed.pollFrequency,
          isActive: feed.isActive,
          createdBy: feed.createdBy,
          status: feed.status || "pending",
          lastPolled: feed.lastPolled || undefined,
          nextRunTime: feed.nextRunTime || undefined,
          updatedAt: feed.updatedAt || Date.now(),
          matched: feed.matched || 0,
        };

        await ctx.db.insert("create_rss", cleanFeed);
        console.log(`Migrated RSS feed: ${feed.name}`);
      } catch (error) {
        console.error(`Failed to migrate RSS feed ${feed.name}:`, error);
      }
    }
    
    console.log("RSS feeds migration complete");
  },
});

// Helper function to export data (run this against dev)
export const exportDevData = mutation({
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    const rssFeeds = await ctx.db.query("create_rss").collect();
    
    console.log(`Found ${articles.length} articles and ${rssFeeds.length} RSS feeds to export`);
    
    return {
      articles,
      rssFeeds,
    };
  },
});