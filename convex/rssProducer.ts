import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { XMLParser } from "fast-xml-parser";

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
      createdAt: now,
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
      
      console.log('🔍 RSS PARSER RESPONSE - Complete Feed Data:');
      console.log('📄 Feed Title:', feedTitle);
      console.log('📄 Feed Description:', feedDescription);
      console.log('📄 Total Items in Feed:', itemsData.length);
      console.log('📄 Max Articles to Process:', maxArticles);
      console.log('📄 Raw Feed Data Structure:', JSON.stringify(feedData, null, 2));
      console.log('📄 Raw Items Data (first 3 items):', JSON.stringify(itemsData.slice(0, 3), null, 2));
      
      const articles: FeedArticle[] = itemsData.slice(0, maxArticles).map((item: any) => {
        let title = 'Untitled';
        let link = '';
        let pubDate = new Date().toISOString();
        let description = 'No description available';
        let categories: string[] = [];

        // Extract title
        if (typeof item.title === 'string') {
          title = item.title;
        } else if (item.title && item.title['#text']) {
          title = item.title['#text'];
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

        // Clean up description (remove HTML tags)
        if (typeof description === 'string') {
          description = description.replace(/<[^>]*>/g, '').substring(0, 300);
        }

        // Extract categories with detailed debugging
        if (item.category) {
          console.log('🏷️  Raw category data for article:', title.substring(0, 50) + '...', {
            categoryType: typeof item.category,
            isArray: Array.isArray(item.category),
            rawData: item.category
          });
          
          if (Array.isArray(item.category)) {
            categories = item.category.map((cat: any) => {
              const extracted = typeof cat === 'string' ? cat : (cat['#text'] || cat['@_term'] || '');
              console.log('📝 Category extracted:', extracted, 'from:', cat);
              return extracted.trim();
            }).filter(Boolean);
          } else if (typeof item.category === 'string') {
            categories = [item.category.trim()];
            console.log('📝 Single string category:', item.category.trim());
          } else if (item.category['#text'] || item.category['@_term']) {
            const extracted = item.category['#text'] || item.category['@_term'];
            categories = [extracted.trim()];
            console.log('📝 Object category extracted:', extracted.trim());
          }
          
          console.log('✅ Final categories array:', categories);
        } else {
          console.log('❌ No category data found for article:', title.substring(0, 50) + '...');
        }

        return {
          title: title.trim(),
          url: link.trim(),
          publishedAt: pubDate,
          excerpt: description.trim(),
          categories,
        };
      });

      console.log('📰 EXTRACTED ARTICLES (before keyword filtering):');
      console.log('📰 Total Articles Extracted:', articles.length);
      console.log('📰 Articles Summary:', articles.map((article, index) => ({
        index: index + 1,
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt,
        excerpt: article.excerpt.substring(0, 100) + '...',
        categories: article.categories
      })));
      console.log('📰 Full Article Data:', JSON.stringify(articles, null, 2));

      // Filter articles by category if specified
      let filteredArticles = articles;
      console.log('🎯 FILTERING CHECK: Category value:', args.category);
      console.log('🎯 FILTERING CHECK: Will filter?', !!(args.category && args.category.trim() !== '' && args.category.toLowerCase() !== 'all'));
      
      if (args.category && args.category.trim() !== '' && args.category.toLowerCase() !== 'all') {
        console.log('🔍 Starting category filtering...');
        console.log('🎯 Target category:', args.category);
        console.log('📄 Total articles before filtering:', articles.length);
        console.log('📋 All articles summary:', articles.map(a => ({ 
          title: a.title.substring(0, 40) + '...', 
          categories: a.categories 
        })));
        
        filteredArticles = articles.filter((article, index) => {
          console.log(`\n🔎 Processing article ${index + 1}/${articles.length}:`);
          console.log('📰 Title:', article.title);
          
          // Only process articles that have categories
          if (!article.categories || article.categories.length === 0) {
            console.log('❌ REJECTED: Article has no categories');
            return false;
          }
          
          console.log('🏷️  Article categories:', article.categories);
          console.log('🎯 Looking for category:', args.category);
          
          // Check each category for matches with strict logic
          let matchFound = false;
          let matchDetails: string[] = [];
          
          for (const cat of article.categories) {
            const catLower = cat.toLowerCase().trim();
            const targetLower = args.category.toLowerCase().trim();
            
            // Only allow exact matches or category contains target (more strict)
            // This prevents "AI" from matching unrelated categories
            const exactMatch = catLower === targetLower;
            const catContainsTarget = catLower.includes(targetLower) && targetLower.length >= 2; // Minimum 2 chars to avoid false positives
            
            console.log(`  🔍 Testing "${cat}":`);
            console.log(`    • Exact match: ${exactMatch}`);
            console.log(`    • "${cat}" contains "${args.category}": ${catContainsTarget}`);
            
            // More strict matching: only exact or category-contains-target
            if (exactMatch || catContainsTarget) {
              matchFound = true;
              matchDetails.push(`"${cat}" (${exactMatch ? 'exact' : 'contains-target'})`);
            } else {
              console.log(`    • REJECTED: No valid match found`);
            }
          }
          
          const result = matchFound;
          console.log(`${result ? '✅ ACCEPTED' : '❌ REJECTED'}: ${result ? 'Matches: ' + matchDetails.join(', ') : 'No matches found'}`);
          
          return result;
        });
        
        console.log('\n📊 FILTERING SUMMARY:');
        console.log('📄 Articles before filtering:', articles.length);
        console.log('✅ Articles after filtering:', filteredArticles.length);
        console.log('📝 Filtered articles:', filteredArticles.map(a => a.title.substring(0, 50) + '...'));
      } else {
        console.log('🌐 No category filtering applied - returning all articles');
        console.log('📄 Total articles:', articles.length);
        console.log('🎯 Category value:', args.category || 'undefined/empty');
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

    await ctx.db.patch(args.id, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

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
      .order("desc", "createdAt")
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

    // Update producer last polled timestamp
    await ctx.runMutation("rssProducer:updateProducerLastPolled", {
      id: args.producerId,
      timestamp: Date.now(),
    });

    // If feed was successful and articles found, add to queue
    if (feedResult.status === 'success' && feedResult.articles.length > 0) {
      const queueResult = await ctx.runMutation("rssQueue:addArticlesToQueue", {
        producerId: args.producerId,
        articles: feedResult.articles.map(article => ({
          title: article.title,
          description: article.excerpt,
          url: article.url,
          publishedAt: article.publishedAt,
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