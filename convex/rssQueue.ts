import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Add articles to RSS queue from producer
export const addArticlesToQueue = mutation({
  args: {
    producerId: v.id("rss_producer"),
    articles: v.array(v.object({
      title: v.string(),
      description: v.string(),
      url: v.string(),
      publishedAt: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const insertedIds = [];
    
    for (const article of args.articles) {
      // Convert publishedAt string to timestamp
      const publishedTimestamp = new Date(article.publishedAt).getTime();
      
      const queueId = await ctx.db.insert("rss_queue", {
        producerId: args.producerId,
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: publishedTimestamp,
        processed: false,
        createdAt: Date.now(),
      });
      
      insertedIds.push(queueId);
    }
    
    return { 
      success: true, 
      insertedCount: insertedIds.length,
      queueIds: insertedIds 
    };
  },
});

// Get queue items by producer
export const getQueueByProducer = query({
  args: { producerId: v.id("rss_producer") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rss_queue")
      .withIndex("by_producer", (q) => q.eq("producerId", args.producerId))
      .order("desc", "createdAt")
      .collect();
  },
});

// Get all unprocessed queue items
export const getUnprocessedQueue = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rss_queue")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .order("desc", "createdAt")
      .collect();
  },
});

// Get all unprocessed queue items with producer details
export const getUnprocessedQueueWithProducers = query({
  handler: async (ctx) => {
    const queueItems = await ctx.db
      .query("rss_queue")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .order("desc", "createdAt")
      .collect();

    // Fetch producer details for each queue item
    const itemsWithProducers = await Promise.all(
      queueItems.map(async (item) => {
        const producer = await ctx.db.get(item.producerId);
        return {
          ...item,
          producer,
        };
      })
    );

    return itemsWithProducers;
  },
});

// Get queue statistics
export const getQueueStats = query({
  handler: async (ctx) => {
    const allItems = await ctx.db.query("rss_queue").collect();
    const unprocessedItems = allItems.filter(item => !item.processed);
    const processedItems = allItems.filter(item => item.processed);
    
    return {
      total: allItems.length,
      unprocessed: unprocessedItems.length,
      processed: processedItems.length,
    };
  },
});