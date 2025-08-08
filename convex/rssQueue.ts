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
      categories: v.optional(v.array(v.string())),
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
        categories: article.categories || [],
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
      .order("desc", "_creationTime")
      .collect();
  },
});

// Get all unprocessed queue items
export const getUnprocessedQueue = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rss_queue")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .order("desc", "_creationTime")
      .collect();
  },
});

// Get all unprocessed queue items with producer details
export const getUnprocessedQueueWithProducers = query({
  handler: async (ctx) => {
    const queueItems = await ctx.db
      .query("rss_queue")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .order("desc", "_creationTime")
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

// Search queue items with producer details
export const searchQueueWithProducers = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // If no search term, return recent unprocessed items
    if (!args.searchTerm.trim()) {
      const queueItems = await ctx.db
        .query("rss_queue")
        .withIndex("by_processed", (q) => q.eq("processed", false))
        .order("desc", "_creationTime")
        .take(args.limit || 50);

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
    }
    
    // Get all unprocessed items for searching
    const allItems = await ctx.db
      .query("rss_queue")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    
    // Filter items by search term
    const filteredItems = allItems.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    );
    
    // Take only the requested limit
    const limitedItems = filteredItems.slice(0, args.limit || 50);
    
    // Fetch producer details for filtered items
    const itemsWithProducers = await Promise.all(
      limitedItems.map(async (item) => {
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

// Delete single queue item
export const deleteQueueItem = mutation({
  args: { 
    itemId: v.id("rss_queue")
  },
  handler: async (ctx, args) => {
    // Check if item exists before attempting to delete
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error(`Queue item ${args.itemId} not found`);
    }

    // Delete the item
    await ctx.db.delete(args.itemId);
    
    return {
      success: true,
      deletedId: args.itemId
    };
  },
});

// Bulk delete queue items
export const bulkDeleteQueueItems = mutation({
  args: { 
    itemIds: v.array(v.id("rss_queue"))
  },
  handler: async (ctx, args) => {
    const results = {
      successCount: 0,
      failedIds: [] as Id<"rss_queue">[],
      errors: [] as string[]
    };

    for (const itemId of args.itemIds) {
      try {
        // Check if item exists before attempting to delete
        const item = await ctx.db.get(itemId);
        if (!item) {
          results.failedIds.push(itemId);
          results.errors.push(`Item ${itemId} not found`);
          continue;
        }

        // Delete the item
        await ctx.db.delete(itemId);
        results.successCount++;
      } catch (error) {
        results.failedIds.push(itemId);
        results.errors.push(`Failed to delete ${itemId}: ${error}`);
      }
    }

    return {
      success: results.failedIds.length === 0,
      successCount: results.successCount,
      failedCount: results.failedIds.length,
      totalRequested: args.itemIds.length,
      failedIds: results.failedIds,
      errors: results.errors
    };
  },
});

// Find articles to delete for deduplication among selected items
export const findDuplicatesForDeduplication = query({
  args: { 
    selectedIds: v.array(v.id("rss_queue"))
  },
  handler: async (ctx, args) => {
    // Get all selected queue items with producer details
    const selectedItems = await Promise.all(
      args.selectedIds.map(async (itemId) => {
        const item = await ctx.db.get(itemId);
        if (!item) return null;
        
        const producer = await ctx.db.get(item.producerId);
        return {
          ...item,
          producer,
        };
      })
    );

    // Filter out null items (items that weren't found)
    const validItems = selectedItems.filter(item => item !== null);

    if (validItems.length === 0) {
      return { articlesToDelete: [] };
    }

    // Generate similarity hashes and find duplicates
    // This is a simple implementation - the frontend will use the actual hashing logic
    const titleGroups = new Map<string, typeof validItems>();
    
    // Group articles by normalized title
    for (const item of validItems) {
      const normalizedTitle = item.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word))
        .sort()
        .join(' ');
      
      if (!titleGroups.has(normalizedTitle)) {
        titleGroups.set(normalizedTitle, []);
      }
      titleGroups.get(normalizedTitle)!.push(item);
    }

    // Find duplicates to delete (keep the newest in each group)
    const articlesToDelete = [];
    
    for (const group of titleGroups.values()) {
      if (group.length > 1) {
        // Sort by creation date (newest first) and mark older ones for deletion
        const sorted = group.sort((a, b) => b._creationTime - a._creationTime);
        articlesToDelete.push(...sorted.slice(1)); // Keep first (newest), delete rest
      }
    }

    return {
      articlesToDelete: articlesToDelete.map(item => ({
        _id: item._id,
        title: item.title,
        producer: item.producer ? { name: item.producer.name } : undefined,
        createdAt: item._creationTime
      }))
    };
  },
});