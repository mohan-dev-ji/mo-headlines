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

// Create a new RSS source
export const createRSSSource = mutation({
  args: {
    name: v.string(),
    url: v.string(),
    category: v.string(),
    isActive: v.boolean(),
    pollFrequency: v.number(),
    numberOfArticles: v.number(),
    goldenArticleUrl: v.optional(v.string()),
    goldenArticleTitle: v.optional(v.string()),
    goldenArticleDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    
    const sourceId = await ctx.db.insert("rss_sources", {
      name: args.name,
      url: args.url,
      category: args.category,
      isActive: args.isActive,
      pollFrequency: args.pollFrequency,
      numberOfArticles: args.numberOfArticles,
      lastPolled: undefined,
      createdAt: now,
      updatedAt: now,
      goldenArticleUrl: args.goldenArticleUrl,
      goldenArticleTitle: args.goldenArticleTitle,
      goldenArticleDate: args.goldenArticleDate,
    });

    return { sourceId };
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

      // Filter articles by category if specified
      let filteredArticles = articles;
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

// Get all RSS sources
export const getAllSources = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rss_sources")
      .order("desc")
      .collect();
  },
});

// Get RSS sources by status
export const getSourcesByStatus = query({
  args: { isActive: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rss_sources")
      .withIndex("by_active", (q) => q.eq("isActive", args.isActive))
      .order("desc")
      .collect();
  },
});

// Get RSS source by ID
export const getSourceById = query({
  args: { id: v.id("rss_sources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Toggle RSS source active status
export const toggleSourceStatus = mutation({
  args: { 
    id: v.id("rss_sources"),
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

// Update RSS source
export const updateRSSSource = mutation({
  args: {
    id: v.id("rss_sources"),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    category: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    pollFrequency: v.optional(v.number()),
    numberOfArticles: v.optional(v.number()),
    goldenArticleUrl: v.optional(v.string()),
    goldenArticleTitle: v.optional(v.string()),
    goldenArticleDate: v.optional(v.number()),
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

// Delete RSS source
export const deleteRSSSource = mutation({
  args: { id: v.id("rss_sources") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Also delete related RSS items
    const rssItems = await ctx.db
      .query("rss_items")
      .withIndex("by_source", (q) => q.eq("sourceId", args.id))
      .collect();

    for (const item of rssItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Update last polled timestamp
export const updateLastPolled = mutation({
  args: { 
    id: v.id("rss_sources"),
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

// Get RSS sources by category
export const getSourcesByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rss_sources")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Get active RSS sources for polling
export const getActiveSourcesForPolling = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rss_sources")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});