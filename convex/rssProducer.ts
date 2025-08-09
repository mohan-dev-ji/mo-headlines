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

// Unified producer query with flexible filtering
export const getProducers = query({
  args: {
    isActive: v.optional(v.boolean()),
    categoryId: v.optional(v.id("categories")),
    includeCategory: v.optional(v.boolean()),
    id: v.optional(v.id("rss_producer")),
  },
  handler: async (ctx, args) => {
    // Single producer by ID
    if (args.id) {
      const producer = await ctx.db.get(args.id);
      if (!producer) return null;

      if (args.includeCategory) {
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
      }
      return producer;
    }

    // Multiple producers with filters
    let query = ctx.db.query("rss_producer");

    // Apply filters
    if (args.isActive !== undefined) {
      query = query.withIndex("by_active", (q) => q.eq("isActive", args.isActive));
    }
    if (args.categoryId) {
      query = query.withIndex("by_category", (q) => q.eq("categoryId", args.categoryId));
    }

    const producers = await query.order("desc", "_creationTime").collect();

    // Include category data if requested
    if (args.includeCategory) {
      return await Promise.all(
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
    }

    return producers;
  },
});

// Unified update function for all producer changes
export const updateProducer = mutation({
  args: {
    id: v.id("rss_producer"),
    // Basic fields
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    isActive: v.optional(v.boolean()),
    pollFrequency: v.optional(v.number()),
    numberOfArticles: v.optional(v.number()),
    // Timestamp fields
    lastPolled: v.optional(v.number()),
    // Run result fields
    lastRunSuccess: v.optional(v.boolean()),
    lastRunFeedStatus: v.optional(v.string()),
    lastRunCategoryStatus: v.optional(v.string()),
    lastRunArticlesFound: v.optional(v.number()),
    lastRunArticlesQueued: v.optional(v.number()),
    lastRunArticles: v.optional(v.array(v.object({
      title: v.string(),
      url: v.string(),
      publishedAt: v.string(),
      excerpt: v.string(),
    }))),
    lastRunError: v.optional(v.string()),
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


// Run producer now - fetch RSS, filter by keywords, and add to queue


export const runProducerNow = action({
  args: { producerId: v.id("rss_producer") },
  handler: async (ctx, args) => {
    // Get producer and category data using unified function
    const producer = await ctx.runQuery("rssProducer:getProducers", {
      id: args.producerId,
      includeCategory: true
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

    const now = Date.now();
    
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

      // Update producer with run results using unified function
      await ctx.runMutation("rssProducer:updateProducer", {
        id: args.producerId,
        lastPolled: now,
        lastRunSuccess: true,
        lastRunFeedStatus: 'live',
        lastRunCategoryStatus: feedResult.articles.length > 0 ? 'found' : 'not_found',
        lastRunArticlesFound: feedResult.articles.length,
        lastRunArticlesQueued: queueResult.insertedCount,
        lastRunArticles: feedResult.articles.map(article => ({
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
        lastRun: now,
      };
    } else {
      // Update producer with error results using unified function
      await ctx.runMutation("rssProducer:updateProducer", {
        id: args.producerId,
        lastPolled: now,
        lastRunSuccess: feedResult.status === 'success',
        lastRunFeedStatus: feedResult.status === 'success' ? 'live' : 'not_live',
        lastRunCategoryStatus: feedResult.status === 'success' ? 'not_found' : undefined,
        lastRunArticlesFound: 0,
        lastRunArticlesQueued: 0,
        lastRunArticles: [],
        lastRunError: feedResult.error,
      });

      return {
        success: feedResult.status === 'success',
        feedStatus: feedResult.status === 'success' ? 'live' : 'not_live',
        categoryStatus: feedResult.status === 'success' ? 'not_found' : null,
        articlesFound: 0,
        articlesQueued: 0,
        articles: [],
        lastRun: now,
        error: feedResult.error,
      };
    }
  },
});