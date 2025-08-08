import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { XMLParser } from "fast-xml-parser";

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
  publishedAt: string;
  excerpt: string;
  categories?: string[];
}

interface FeedAnalysis {
  feedTitle: string;
  feedURL: string;
  category: string;
  dateFetched: string;
  status: 'success' | 'error';
  articles: FeedArticle[];
  error?: string;
}

// Create a new RSS producer
export const createProducer = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    categoryId: v.id("categories"),
    isActive: v.boolean(),
    pollFrequency: v.number(),
    numberOfArticles: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    
    const producerId = await ctx.db.insert("rss_producer", {
      name: args.name,
      url: args.url,
      categoryId: args.categoryId,
      isActive: args.isActive,
      pollFrequency: args.pollFrequency,
      numberOfArticles: args.numberOfArticles,
      lastPolled: undefined,
      updatedAt: now,
    });

    return { producerId };
  },
});

// Test RSS feed and parse articles using fetch and basic XML parsing
export const testRSSFeed = action({
  args: { 
    url: v.string(), 
    category: v.optional(v.string()),
    numberOfArticles: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<FeedAnalysis> => {
    try {
      // Fetch RSS feed content
      const response = await fetch(args.url, {
        headers: {
          'User-Agent': 'Mo Headlines RSS Parser/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      // Parse XML using fast-xml-parser
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text",
        parseAttributeValue: false,
        trimValues: true,
      });
      
      let parsedXml;
      try {
        parsedXml = parser.parse(xmlText);
      } catch (error) {
        throw new Error('Invalid XML format');
      }

      // Handle both RSS and Atom feeds
      const isAtom = parsedXml.feed !== undefined;
      const isRSS = parsedXml.rss !== undefined;
      
      if (!isAtom && !isRSS) {
        throw new Error('No RSS channel or Atom feed found');
      }

      let feedData, itemsData;
      
      if (isRSS) {
        feedData = parsedXml.rss.channel;
        itemsData = feedData.item || [];
      } else {
        feedData = parsedXml.feed;
        itemsData = feedData.entry || [];
      }

      // Ensure itemsData is an array
      if (!Array.isArray(itemsData)) {
        itemsData = [itemsData];
      }

      const feedTitle = feedData.title || 'Unknown Feed';
      const feedDescription = feedData.description || feedData.subtitle || 'No description available';

      // Extract articles/items
      const maxArticles = args.numberOfArticles || 10;
      
      console.log('📄 Total Items in Feed:', itemsData.length);
      console.log('📄 Max Articles to Process:', maxArticles);
      
      const articles: FeedArticle[] = itemsData.slice(0, maxArticles).map((item: any) => {
        let title = 'Untitled';
        let link = '';
        let pubDate = new Date().toISOString();
        let description = 'No description available';
        let categories: string[] = [];

        // Extract title
        if (typeof item.title === 'string') {
          title = decodeHTMLEntities(item.title);
        } else if (item.title && item.title['#text']) {
          title = decodeHTMLEntities(item.title['#text']);
        }

        // Extract link
        if (isRSS) {
          link = item.link || item.guid || '';
        } else {
          // Atom feed
          if (item.link) {
            if (typeof item.link === 'string') {
              link = item.link;
            } else if (Array.isArray(item.link)) {
              link = item.link.find((l: any) => l['@_rel'] === 'alternate' || l['@_type'] === 'text/html')?.['@_href'] || 
                     item.link[0]?.['@_href'] || '';
            } else if (item.link['@_href']) {
              link = item.link['@_href'];
            }
          }
          link = link || item.id || '';
        }

        // Extract publish date
        if (isRSS) {
          pubDate = item.pubDate || item.date || new Date().toISOString();
        } else {
          pubDate = item.published || item.updated || new Date().toISOString();
        }

        // Extract description
        if (isRSS) {
          description = item.description || item.summary || item.content || 'No description available';
        } else {
          description = item.summary || item.content || 'No description available';
          
          // Handle complex content structures
          if (typeof description === 'object' && description['#text']) {
            description = description['#text'];
          }
        }

        // Clean up description (remove HTML tags and decode entities)
        if (typeof description === 'string') {
          description = decodeHTMLEntities(description.replace(/<[^>]*>/g, '')).substring(0, 300);
        }

        // Extract categories
        if (item.category) {
          if (Array.isArray(item.category)) {
            categories = item.category.map((cat: any) => {
              return typeof cat === 'string' ? cat : (cat['#text'] || cat['@_term'] || '');
            }).filter(Boolean).map(c => c.trim());
          } else if (typeof item.category === 'string') {
            categories = [item.category.trim()];
          } else if (item.category['#text'] || item.category['@_term']) {
            categories = [item.category['#text'] || item.category['@_term']].map(c => c.trim());
          }
        }

        return {
          title: title.trim(),
          url: link.trim(),
          publishedAt: pubDate,
          excerpt: description.trim(),
          categories,
        };
      });

      console.log('\n📰 PROCESSING ARTICLES:');
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Categories: [${article.categories?.join(', ') || 'None'}]`);
      });

      // Filter articles by category if specified
      let filteredArticles = articles;
      console.log('🎯 FILTERING CHECK: Category value:', args.category);
      console.log('🎯 FILTERING CHECK: Will filter?', !!(args.category && args.category.trim() !== '' && args.category.toLowerCase() !== 'all'));
      
      if (args.category && args.category.trim() !== '' && args.category.toLowerCase() !== 'all') {
        // First, fetch the category keywords from the database
        console.log('🔍 Fetching category keywords from database...');
        const categoryRecord = await ctx.runQuery("categories:getCategoryBySlug", {
          slug: args.category.toLowerCase()
        });
        
        if (!categoryRecord) {
          console.log('❌ Category not found in database:', args.category);
          return {
            feedTitle,
            feedURL: args.url,
            category: args.category,
            dateFetched: new Date().toISOString(),
            status: 'error',
            articles: [],
            error: `Category "${args.category}" not found in database`,
          };
        }
        
        const categoryKeywords = categoryRecord.keywords || [];
        console.log(`\n🎯 OUR PRODUCER CATEGORY: ${categoryRecord.name}`);
        console.log('🔑 KEYWORDS:', categoryKeywords);
        
        filteredArticles = articles.filter((article, index) => {
          // Only process articles that have categories
          if (!article.categories || article.categories.length === 0) {
            return false;
          }
          
          // Check if any RSS category contains any of our category keywords
          let matchFound = false;
          
          for (const rssCategory of article.categories) {
            const rssCategoryLower = rssCategory.toLowerCase().trim();
            
            // Check if this RSS category contains any of our keywords (whole word matching)
            for (const keyword of categoryKeywords) {
              const keywordLower = keyword.toLowerCase().trim();
              
              // Use word boundary matching to avoid false positives like "ai" matching "brain"
              const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
              const keywordFound = regex.test(rssCategoryLower);
              
              if (keywordFound) {
                matchFound = true;
                break; // Found a match in this category, no need to check more keywords for this category
              }
            }
            
            if (matchFound) break; // Found a match, no need to check more categories
          }
          
          return matchFound;
        });
        
        console.log('\n✅ MATCHED ARTICLES:');
        filteredArticles.forEach((article, index) => {
          console.log(`${index + 1}. ${article.title}`);
          console.log(`   URL: ${article.url}`);
          console.log(`   Categories: [${article.categories?.join(', ') || 'None'}]`);
        });
      } else {
        console.log('🌐 No category filtering applied - returning all articles');
      }

      return {
        feedTitle,
        feedURL: args.url,
        category: args.category,
        dateFetched: new Date().toISOString(),
        status: 'success',
        articles: filteredArticles,
        totalArticlesParsed: articles.length,
        filteredCount: filteredArticles.length,
      };
    } catch (error) {
      console.error('RSS feed parsing error:', error);
      return {
        feedTitle: '',
        feedURL: args.url,
        category: args.category,
        dateFetched: new Date().toISOString(),
        status: 'error',
        articles: [],
        error: error instanceof Error ? error.message : 'Failed to parse RSS feed',
      };
    }
  },
});

// Get all RSS producers
export const getAllProducers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rss_producer")
      .order("desc")
      .collect();
  },
});

// Get RSS producers by status
export const getProducersByStatus = query({
  args: { isActive: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rss_producer")
      .withIndex("by_active", (q) => q.eq("isActive", args.isActive))
      .order("desc")
      .collect();
  },
});

// Get RSS producer by ID
export const getProducerById = query({
  args: { id: v.id("rss_producer") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Toggle RSS producer active status
export const toggleProducerStatus = mutation({
  args: { 
    id: v.id("rss_producer"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const producer = await ctx.db.get(args.id);
    if (!producer) {
      throw new Error("Producer not found");
    }

    const now = Date.now();
    const updateData: any = {
      isActive: args.isActive,
      updatedAt: now,
    };

    // If enabling, set next run time based on poll frequency
    // If disabling, clear next run time
    if (args.isActive) {
      updateData.nextRunTime = now + (producer.pollFrequency * 60 * 1000);
    } else {
      updateData.nextRunTime = undefined;
    }

    await ctx.db.patch(args.id, updateData);

    return { success: true };
  },
});

// Update RSS producer
export const updateProducer = mutation({
  args: {
    id: v.id("rss_producer"),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    isActive: v.optional(v.boolean()),
    pollFrequency: v.optional(v.number()),
    numberOfArticles: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;
    
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete RSS producer
export const deleteProducer = mutation({
  args: { id: v.id("rss_producer") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Also delete related RSS queue items
    const queueItems = await ctx.db
      .query("rss_queue")
      .withIndex("by_producer", (q) => q.eq("producerId", args.id))
      .collect();

    for (const item of queueItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Update last polled timestamp
export const updateProducerLastPolled = mutation({
  args: { 
    id: v.id("rss_producer"),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastPolled: args.timestamp,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update next run time
export const updateProducerNextRunTime = mutation({
  args: { 
    id: v.id("rss_producer"),
    nextRunTime: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      nextRunTime: args.nextRunTime,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update producer with run results
export const updateProducerRunResults = mutation({
  args: {
    id: v.id("rss_producer"),
    success: v.boolean(),
    feedStatus: v.string(),
    categoryStatus: v.optional(v.string()),
    articlesFound: v.number(),
    articlesQueued: v.number(),
    articles: v.array(v.object({
      title: v.string(),
      url: v.string(),
      publishedAt: v.string(),
      excerpt: v.string(),
    })),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastRunSuccess: args.success,
      lastRunFeedStatus: args.feedStatus,
      lastRunCategoryStatus: args.categoryStatus,
      lastRunArticlesFound: args.articlesFound,
      lastRunArticlesQueued: args.articlesQueued,
      lastRunArticles: args.articles,
      lastRunError: args.error,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get RSS producers by category
export const getProducersByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rss_producer")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
  },
});

// Get active RSS producers for polling
export const getActiveProducersForPolling = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rss_producer")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get all producers with their category data (including keywords)
export const getAllProducersWithCategories = query({
  handler: async (ctx) => {
    const producers = await ctx.db
      .query("rss_producer")
      .order("desc", "_creationTime")
      .collect();

    // Fetch category data for each producer
    const producersWithCategories = await Promise.all(
      producers.map(async (producer) => {
        const category = await ctx.db.get(producer.categoryId);
        return {
          ...producer,
          category: category ? {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            keywords: category.keywords || [],
          } : null,
        };
      })
    );

    return producersWithCategories;
  },
});

// Get producer with category data by ID
export const getProducerWithCategoryById = query({
  args: { id: v.id("rss_producer") },
  handler: async (ctx, args) => {
    const producer = await ctx.db.get(args.id);
    if (!producer) return null;

    const category = await ctx.db.get(producer.categoryId);
    return {
      ...producer,
      category: category ? {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        keywords: category.keywords || [],
      } : null,
    };
  },
});

// Run producer now - fetch RSS, filter by keywords, and add to queue
// Internal action to check and run scheduled producers (called by cron job)
export const checkAndRunScheduledProducers = action({
  handler: async (ctx) => {
    const now = Date.now();
    
    // Get all active producers that are due to run
    const producersDue = await ctx.runQuery("rssProducer:getProducersDueForRun", { currentTime: now });
    
    console.log(`🕐 Cron check: ${producersDue.length} producers due for run`);
    
    // Run each producer that's due
    for (const producer of producersDue) {
      try {
        console.log(`🚀 Auto-running producer: ${producer.name}`);
        await ctx.runAction("rssProducer:runProducerNow", { producerId: producer._id });
      } catch (error) {
        console.error(`❌ Failed to auto-run producer ${producer.name}:`, error);
      }
    }
    
    return { producersRun: producersDue.length };
  },
});

// Get producers that are due to run
export const getProducersDueForRun = query({
  args: { currentTime: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rss_producer")
      .withIndex("by_next_run", (q) => q.lt("nextRunTime", args.currentTime))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const runProducerNow = action({
  args: { producerId: v.id("rss_producer") },
  handler: async (ctx, args) => {
    // Get producer and category data
    const producer = await ctx.runQuery("rssProducer:getProducerWithCategoryById", {
      id: args.producerId
    });
    
    if (!producer) {
      throw new Error("Producer not found");
    }

    if (!producer.category) {
      throw new Error("Producer category not found");
    }

    // Test RSS feed with category keywords
    const feedResult = await ctx.runAction("rssProducer:testRSSFeed", {
      url: producer.url,
      category: producer.category.name,
      numberOfArticles: producer.numberOfArticles,
    });

    // Update producer last polled timestamp and set next run time
    const now = Date.now();
    await ctx.runMutation("rssProducer:updateProducerLastPolled", {
      id: args.producerId,
      timestamp: now,
    });
    
    // Set next run time based on poll frequency (only if producer is still active)
    const currentProducer = await ctx.runQuery("rssProducer:getProducerById", { id: args.producerId });
    if (currentProducer?.isActive) {
      const nextRunTime = now + (currentProducer.pollFrequency * 60 * 1000); // Convert minutes to milliseconds
      await ctx.runMutation("rssProducer:updateProducerNextRunTime", {
        id: args.producerId,
        nextRunTime: nextRunTime,
      });
    }

    // If feed was successful and articles found, add to queue
    if (feedResult.status === 'success' && feedResult.articles.length > 0) {
      const queueResult = await ctx.runMutation("rssQueue:addArticlesToQueue", {
        producerId: args.producerId,
        articles: feedResult.articles.map(article => ({
          title: article.title,
          description: article.excerpt,
          url: article.url,
          publishedAt: article.publishedAt,
          categories: article.categories,
        })),
      });

      // Save run results to database
      await ctx.runMutation("rssProducer:updateProducerRunResults", {
        id: args.producerId,
        success: true,
        feedStatus: 'live',
        categoryStatus: feedResult.articles.length > 0 ? 'found' : 'not_found',
        articlesFound: feedResult.articles.length,
        articlesQueued: queueResult.insertedCount,
        articles: feedResult.articles.map(article => ({
          title: article.title,
          url: article.url,
          publishedAt: article.publishedAt,
          excerpt: article.excerpt,
        })),
      });

      return {
        success: true,
        feedStatus: 'live',
        categoryStatus: feedResult.articles.length > 0 ? 'found' : 'not_found',
        articlesFound: feedResult.articles.length,
        articlesQueued: queueResult.insertedCount,
        articles: feedResult.articles,
        lastRun: Date.now(),
      };
    } else {
      // Save run results to database
      await ctx.runMutation("rssProducer:updateProducerRunResults", {
        id: args.producerId,
        success: feedResult.status === 'success',
        feedStatus: feedResult.status === 'success' ? 'live' : 'not_live',
        categoryStatus: feedResult.status === 'success' ? 'not_found' : undefined,
        articlesFound: 0,
        articlesQueued: 0,
        articles: [],
        error: feedResult.error,
      });

      return {
        success: feedResult.status === 'success',
        feedStatus: feedResult.status === 'success' ? 'live' : 'not_live',
        categoryStatus: feedResult.status === 'success' ? 'not_found' : null,
        articlesFound: 0,
        articlesQueued: 0,
        articles: [],
        lastRun: Date.now(),
        error: feedResult.error,
      };
    }
  },
});