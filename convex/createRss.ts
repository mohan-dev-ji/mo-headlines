import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { XMLParser } from "fast-xml-parser";
import { api } from "./_generated/api";

// Create RSS Sources (ADR 2)
// RSS workflow now generates articles for review before queue processing

// Function to decode HTML entities
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#8217;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8212;': '—',
    '&#8211;': '–',
    '&#8230;': '...',
    '&nbsp;': ' ',
    '&hellip;': '...',
    '&mdash;': '—',
    '&ndash;': '–',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsquo;': "'",
    '&rsquo;': "'",
  };
  
  // Replace named entities
  let decoded = text;
  Object.entries(entities).forEach(([entity, replacement]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), replacement);
  });
  
  // Replace numeric entities like &#8217;
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });
  
  // Replace hex entities like &#x27;
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  return decoded;
}

// Types for RSS parsing
interface FeedArticle {
  title: string;
  url: string;
  description: string;
  pubDate: string;
}

// Streamlined RSS feed testing for create/update workflow
export const testAndUpdateRssSource = action({
  args: { 
    sourceId: v.id("create_rss"),
    feedUrl: v.string(),
    maxArticles: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log(`🧪 Testing RSS feed: ${args.feedUrl}`);
    
    try {
      // Fetch RSS feed
      const response = await fetch(args.feedUrl, {
        headers: {
          'User-Agent': 'Mo Headlines RSS Parser/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      console.log(`✅ Feed fetched successfully, length: ${xmlText.length} characters`);
      
      const parser = new XMLParser({
        ignoreAttributes: false,
        parseTagValue: false,
        trimValues: true
      });
      
      const feedData = parser.parse(xmlText);
      
      // Extract articles from feed
      let items: any[] = [];
      if (feedData.rss?.channel?.item) {
        items = Array.isArray(feedData.rss.channel.item) 
          ? feedData.rss.channel.item 
          : [feedData.rss.channel.item];
      } else if (feedData.feed?.entry) {
        // Atom feed
        items = Array.isArray(feedData.feed.entry) 
          ? feedData.feed.entry 
          : [feedData.feed.entry];
      }
      
      console.log(`📰 Total articles found in feed: ${items.length}`);
      
      // Get RSS source to find category
      const source = await ctx.runQuery(api.createRss.getRssSource, { sourceId: args.sourceId });
      if (!source) {
        throw new Error("RSS source not found");
      }

      // Check if this source is set to load all articles
      const isLoadAll = source.loadAllArticles === true;
      let category: any = null;

      if (!isLoadAll) {
        // Get category for filtering
        const categories = await ctx.runQuery(api.categories.getCategoriesWithKeywords);
        category = categories.find((c: any) => c._id === source.categoryId);
        if (!category) {
          throw new Error("Category not found");
        }
        console.log(`🏷️ Category: ${category.name}, Keywords: [${category.keywords?.join(', ') || 'None'}]`);
      } else {
        console.log(`🏷️ Load All Mode: No category filtering will be applied`);
      }

      // Process and filter articles
      const matchedArticles: FeedArticle[] = [];
      const maxArticles = args.maxArticles || source.maxArticles || source.numberOfArticles || 10;
      
      for (const item of items.slice(0, maxArticles)) {
        try {
          // Extract article data
          const title = decodeHTMLEntities(
            item.title?.["#text"] || item.title || ""
          ).trim();
          
          const url = item.link?.["@_href"] || item.link || item.guid || "";
          
          let description = "";
          if (item.description) {
            description = typeof item.description === 'string' 
              ? item.description 
              : item.description?.["#text"] || "";
          } else if (item.summary) {
            description = typeof item.summary === 'string' 
              ? item.summary 
              : item.summary?.["#text"] || "";
          }
          description = decodeHTMLEntities(description).replace(/<[^>]*>/g, '').trim();
          
          const pubDate = item.pubDate || item.published || item.updated || "";

          if (title && url && description) {
            // Check if article matches category keywords (or load all mode)
            const matchesCategory = isLoadAll ||
              !category?.keywords || category.keywords.length === 0 ||
              category.keywords.some((keyword: string) =>
                title.toLowerCase().includes(keyword.toLowerCase()) ||
                description.toLowerCase().includes(keyword.toLowerCase())
              );

            const matchReason = isLoadAll ? '✅ LOAD ALL' : (matchesCategory ? '✅ MATCH' : '❌ NO MATCH');
            console.log(`🔍 "${title.substring(0, 50)}...": ${matchReason}`);

            if (matchesCategory) {
              matchedArticles.push({ title, url, description, pubDate });
            }
          }
        } catch (error) {
          console.error("Error processing RSS item:", error);
        }
      }

      console.log(`🎯 FINAL RESULTS: ${matchedArticles.length} matches out of ${items.length} total articles`);

      // Update source with results
      await ctx.runMutation(api.createRss.updateRssSource, {
        id: args.sourceId,
        articlesInFeed: items.length,
        matchedArticles: matchedArticles,
      });

      return {
        success: true,
        articlesInFeed: items.length,
        matchedCount: matchedArticles.length,
        matchedArticles: matchedArticles,
      };

    } catch (error) {
      console.error("RSS feed test failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Update source with error info
      await ctx.runMutation(api.createRss.updateRssSource, {
        id: args.sourceId,
        articlesInFeed: 0,
        matchedArticles: [],
      });

      return {
        success: false,
        articlesInFeed: 0,
        matchedCount: 0,
        matchedArticles: [],
        error: errorMessage,
      };
    }
  },
});

// Add all matched articles from RSS source to create_queue
export const addRssMatchesToQueue = mutation({
  args: {
    sourceId: v.id("create_rss"),
    selectedArticles: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      description: v.string(),
      pubDate: v.string()
    })))
  },
  handler: async (ctx, args) => {
    // Get the RSS source with matched articles
    const source = await ctx.db.get(args.sourceId);
    if (!source) {
      throw new Error("RSS source not found");
    }

    // Determine which articles to add to queue
    const articlesToAdd = args.selectedArticles || source.matchedArticles || [];

    if (articlesToAdd.length === 0) {
      return { success: false, message: "No articles to add to queue", count: 0 };
    }

    // Get category name directly (handle "load all" case)
    let categoryName = "Unknown";
    if (source.loadAllArticles === true) {
      categoryName = "All (No Filter)";
    } else {
      const category = await ctx.db.get(source.categoryId);
      categoryName = category?.name || "Unknown";
    }

    // Add each article to the create_queue
    const queueItems = [];
    const feedUrl = source.feedUrl || source.url || "Unknown Feed";

    for (const article of articlesToAdd) {
      const queueItemId = await ctx.db.insert("create_queue", {
        title: article.title,
        url: article.url,
        concept: article.description, // Use description as concept
        category: categoryName,
        createSource: `RSS: ${feedUrl}`,
        status: "pending",
        queuedAt: Date.now(),
        isProcessing: false,
        processed: false,
      });
      queueItems.push(queueItemId);
    }

    const selectionText = args.selectedArticles ? "selected" : "matched";
    console.log(`✅ Added ${articlesToAdd.length} ${selectionText} RSS articles to queue from "${source.name}"`);

    // Keep matched articles - they persist until feed is manually updated
    return {
      success: true,
      message: `Added ${articlesToAdd.length} ${selectionText} articles to queue`,
      count: articlesToAdd.length,
      queueItems: queueItems
    };
  },
});

// Get all RSS sources with category info
export const getRssSources = query({
  args: { includeCategory: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const sources = await ctx.db.query("create_rss").collect();
    
    if (args.includeCategory) {
      const enrichedSources = await Promise.all(
        sources.map(async (source) => {
          const category = await ctx.db.get(source.categoryId);
          return {
            ...source,
            category
          };
        })
      );
      return enrichedSources;
    }
    
    return sources;
  },
});

// Get single RSS source
export const getRssSource = query({
  args: { sourceId: v.id("create_rss") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sourceId);
  },
});

// Create new RSS source
export const createRssSource = mutation({
  args: {
    name: v.string(),
    feedUrl: v.string(),
    categoryId: v.id("categories"),
    loadAllArticles: v.optional(v.boolean()), // Flag to ignore category filtering
    isActive: v.boolean(),
    pollFrequency: v.number(),
    maxArticles: v.number(),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    const rssSourceId = await ctx.db.insert("create_rss", {
      name: args.name,
      categoryId: args.categoryId,
      feedUrl: args.feedUrl,
      articlesInFeed: 0,
      maxArticles: args.maxArticles,
      matchedArticles: [],
      pollFrequency: args.pollFrequency,
      publishedAt: new Date().toISOString(),
      isActive: args.isActive,
      createdBy: args.createdBy,
      loadAllArticles: args.loadAllArticles,
    });

    // Schedule feed testing after creation
    await ctx.scheduler.runAfter(0, api.createRss.testAndUpdateRssSource, {
      sourceId: rssSourceId,
      feedUrl: args.feedUrl,
      maxArticles: args.maxArticles,
    });

    return rssSourceId;
  },
});

// Update RSS source
export const updateRssSource = mutation({
  args: {
    id: v.id("create_rss"),
    name: v.optional(v.string()),
    // Support both old and new field names
    feedUrl: v.optional(v.string()),
    url: v.optional(v.string()), // Legacy field
    categoryId: v.optional(v.id("categories")),
    loadAllArticles: v.optional(v.boolean()),
    pollFrequency: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    // New fields
    articlesInFeed: v.optional(v.number()),
    matchedArticles: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      description: v.string(),
      pubDate: v.string(),
    }))),
    // Legacy fields
    lastPolled: v.optional(v.number()),
    matched: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    await ctx.db.patch(id, updateData);
  },
});

// Delete RSS source
export const deleteRssSource = mutation({
  args: { id: v.id("create_rss") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Run RSS source to generate articles for review (simplified)
export const runRssSourceNow = action({
  args: { sourceId: v.id("create_rss") },
  handler: async (ctx, args) => {
    const source = await ctx.runQuery(api.createRss.getRssSource, { sourceId: args.sourceId });
    if (!source) {
      throw new Error("RSS source not found");
    }

    // Clear previous results
    await ctx.runMutation(api.createRss.updateRssSource, {
      id: args.sourceId,
      matchedArticles: [],
      articlesInFeed: 0,
    });

    try {
      // Fetch and parse RSS feed  
      const feedUrl = source.feedUrl || source.url;
      if (!feedUrl) {
        throw new Error("RSS feed URL not found");
      }
      
      console.log(`Fetching RSS feed: ${feedUrl}`);
      const response = await fetch(feedUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      console.log(`✅ Feed fetched successfully, length: ${xmlText.length} characters`);
      
      const parser = new XMLParser({
        ignoreAttributes: false,
        parseTagValue: false,
        trimValues: true
      });
      
      const feedData = parser.parse(xmlText);
      console.log(`📊 Parsed feed structure:`, JSON.stringify({
        hasRSS: !!feedData.rss,
        hasChannel: !!feedData.rss?.channel,
        hasItems: !!feedData.rss?.channel?.item,
        hasAtomFeed: !!feedData.feed,
        hasEntries: !!feedData.feed?.entry,
      }, null, 2));
      
      // Extract articles from feed
      let items: any[] = [];
      if (feedData.rss?.channel?.item) {
        items = Array.isArray(feedData.rss.channel.item) 
          ? feedData.rss.channel.item 
          : [feedData.rss.channel.item];
      } else if (feedData.feed?.entry) {
        // Atom feed
        items = Array.isArray(feedData.feed.entry) 
          ? feedData.feed.entry 
          : [feedData.feed.entry];
      }
      
      console.log(`📰 Total articles found in feed: ${items.length}`);
      
      // Check if this source is set to load all articles
      const isLoadAll = source.loadAllArticles === true;
      let category: any = null;

      if (!isLoadAll) {
        // Get category for filtering first
        const categories = await ctx.runQuery(api.categories.getCategoriesWithKeywords);
        category = categories.find((c: any) => c._id === source.categoryId);
        if (!category) {
          throw new Error("Category not found");
        }
      }

      const maxArticles = source.maxArticles || source.numberOfArticles || 10;
      console.log(`🎯 Will process first ${maxArticles} articles`);
      
      if (items.length > 0) {
        console.log(`📝 Sample first article:`, JSON.stringify({
          title: items[0].title,
          link: items[0].link,
          description: items[0].description?.substring?.(0, 100) + "...",
          pubDate: items[0].pubDate
        }, null, 2));
      }

      if (isLoadAll) {
        console.log(`🏷️ Load All Mode: No category filtering will be applied`);
      } else {
        console.log(`🏷️ Category info:`, JSON.stringify({
          name: category.name,
          keywords: category.keywords,
          keywordCount: category.keywords?.length || 0
        }, null, 2));
      }

      // Process and filter articles
      const matchedArticles: FeedArticle[] = [];
      for (const item of items.slice(0, maxArticles)) {
        try {
          // Extract article data
          const title = decodeHTMLEntities(
            item.title?.["#text"] || item.title || ""
          ).trim();
          
          const url = item.link?.["@_href"] || item.link || item.guid || "";
          
          let description = "";
          if (item.description) {
            description = typeof item.description === 'string' 
              ? item.description 
              : item.description?.["#text"] || "";
          } else if (item.summary) {
            description = typeof item.summary === 'string' 
              ? item.summary 
              : item.summary?.["#text"] || "";
          }
          description = decodeHTMLEntities(description).replace(/<[^>]*>/g, '').trim();
          
          const pubDate = item.pubDate || item.published || item.updated || "";

          if (title && url && description) {
            // Check if article matches category keywords (or load all mode)
            const matchesCategory = isLoadAll ||
              !category?.keywords || category.keywords.length === 0 ||
              category.keywords.some((keyword: string) =>
                title.toLowerCase().includes(keyword.toLowerCase()) ||
                description.toLowerCase().includes(keyword.toLowerCase())
              );

            const matchReason = isLoadAll ? '✅ LOAD ALL' : (matchesCategory ? '✅ MATCH' : '❌ NO MATCH');
            console.log(`🔍 Article "${title.substring(0, 50)}...": ${matchReason}`);

            if (matchesCategory) {
              matchedArticles.push({ title, url, description, pubDate });
            }
          } else {
            console.log(`⚠️ Skipping article with missing fields: title=${!!title}, url=${!!url}, description=${!!description}`);
          }
        } catch (error) {
          console.error("Error processing RSS item:", error);
        }
      }

      console.log(`🎯 FINAL RESULTS: ${matchedArticles.length} matches out of ${items.length} total articles`);

      // Update source with results
      await ctx.runMutation(api.createRss.updateRssSource, {
        id: args.sourceId,
        articlesInFeed: items.length,
        matchedArticles: matchedArticles,
      });

      return {
        success: true,
        articlesInFeed: items.length,
        matchedCount: matchedArticles.length,
        matchedArticles: matchedArticles,
      };

    } catch (error) {
      console.error("RSS processing failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Update source with zero results on error
      await ctx.runMutation(api.createRss.updateRssSource, {
        id: args.sourceId,
        articlesInFeed: 0,
        matchedArticles: [],
      });

      return {
        success: false,
        articlesInFeed: 0,
        matchedCount: 0,
        matchedArticles: [],
        error: errorMessage,
      };
    }
  },
});

// Add RSS article to universal queue (manual action by admin)
export const addRssArticleToQueue = mutation({
  args: {
    sourceId: v.id("create_rss"),
    title: v.string(),
    url: v.string(),
    concept: v.string(), // RSS excerpt/description becomes concept for AI processing
  },
  handler: async (ctx, args) => {
    // Get source and category info
    const source = await ctx.db.get(args.sourceId);
    if (!source) {
      throw new Error("RSS source not found");
    }

    // Handle "load all" case
    let categoryName = "Unknown";
    if (source.loadAllArticles === true) {
      categoryName = "All (No Filter)";
    } else {
      const category = await ctx.db.get(source.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
      categoryName = category.name;
    }

    const feedUrl = source.feedUrl || source.url || "Unknown Feed";

    // Add to universal queue
    const queueItemId = await ctx.db.insert("create_queue", {
      title: args.title,
      url: args.url,
      concept: args.concept, // RSS description becomes context for AI processing
      category: categoryName,
      createSource: `RSS: ${feedUrl}`,
      status: "pending",
      queuedAt: Date.now(),
      isProcessing: false,
      processed: false,
    });

    return queueItemId;
  },
});

// Clear all RSS sources (development)
export const clearAllRssSources = mutation({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query("create_rss").collect();
    for (const source of sources) {
      await ctx.db.delete(source._id);
    }
    return { cleared: sources.length };
  },
});