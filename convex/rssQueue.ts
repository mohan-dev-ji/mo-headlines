import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Perplexity API configuration
const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ProcessedArticle {
  title: string;
  body: string;
  excerpt: string;
  category: string;
  sourceUrls: string[];
  imageGenPrompts: string[];
  topics: string[];
}

// Normalize and constrain topics to single-token, unique buzzwords
function sanitizeTopics(topics: string[]): string[] {
  const allowToken = (raw: string): string | null => {
    if (!raw) return null;
    // Trim and strip leading/trailing non-token chars; allow internal -, +, ., # (e.g., GPT-4, C++, Web3, C#)
    const trimmed = raw.trim().replace(/^[^A-Za-z0-9#+.-]+|[^A-Za-z0-9#+.-]+$/g, "");
    if (!trimmed) return null;
    if (/\s/.test(trimmed)) return null; // must be a single token, no spaces
    if (trimmed.length < 2) return null; // avoid single-letter junk
    return trimmed;
  };

  const seen = new Set<string>();
  const result: string[] = [];
  for (const t of topics || []) {
    const token = allowToken(t);
    if (!token) continue;
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(token);
  }
  // Keep at most 10 topics
  return result.slice(0, 10);
}

// Ensure each topic appears at least once as a bolded standalone token in the body
function boldTopicsInBody(body: string, topics: string[]): string {
  if (!body) return body;

  let updated = body;

  for (const topic of topics) {
    if (!topic) continue;
    const escaped = topic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Already bolded? (matches **Topic** case-insensitively)
    const boldRegex = new RegExp(`\\*\\*${escaped}\\*\\*`, "i");
    if (boldRegex.test(updated)) continue;

    // Standalone token boundaries: start or non-token char, then token, then end or non-token char
    // NOTE: '.' is treated as a boundary to allow matches before sentence punctuation like 'Mars.'
    const boundary = "[^A-Za-z0-9#+-]";
    const standaloneRegex = new RegExp(`(^|${boundary})(${escaped})(?=($|${boundary}))`, "i");

    if (standaloneRegex.test(updated)) {
      // Replace first occurrence only; keep original casing via capture group 2
      updated = updated.replace(standaloneRegex, (_m, p1: string) => `${p1}**${topic}**`);
    }
  }

  return updated;
}

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
        status: "waiting", // Default status for new queue items
        categories: article.categories || [],
        retryCount: 0,
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
      .order("desc")
      .collect();
  },
});

// Get all unprocessed queue items
export const getUnprocessedQueue = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rss_queue")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .order("desc")
      .collect();
  },
});

// Get all unprocessed queue items with producer details
export const getUnprocessedQueueWithProducers = query({
  handler: async (ctx) => {
    const queueItems = await ctx.db
      .query("rss_queue")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .order("desc")
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
        .order("desc")
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

// Process individual queue item through AI fact-checking
export const processQueueItem = action({
  args: { 
    queueItemId: v.id("rss_queue")
  },
  handler: async (ctx, args): Promise<{ success: boolean; queueItemId: Id<"rss_queue">; articleId?: Id<"articles">; status: "completed" } | never> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get queue item and validate status
    const queueItemData: { queueItem: any; producer: any } | null = await ctx.runQuery(internal.rssQueue.getQueueItemForProcessing, { 
      queueItemId: args.queueItemId 
    });

    if (!queueItemData) {
      throw new Error("Queue item not found");
    }

    const { queueItem, producer } = queueItemData;

    // Check if item is already processing or completed
    if (queueItem.status === "processing") {
      throw new Error("Item is already being processed");
    }
    if (queueItem.status === "completed") {
      throw new Error("Item has already been processed");
    }

    try {
      // Update status to processing
      await ctx.runMutation(internal.rssQueue.updateQueueItemStatus, {
        queueItemId: args.queueItemId,
        status: "processing"
      });

      // Get current categories for the AI prompt
      const availableCategories = await ctx.runQuery(internal.rssQueue.getAvailableCategories);
      
      // Call Perplexity AI for fact-checking and article generation
      const processedArticle = await processWithPerplexity({
        title: queueItem.title,
        description: queueItem.description,
        originalUrl: queueItem.url,
        publishedAt: queueItem.publishedAt,
        categories: queueItem.categories || [],
        producerName: producer.name,
        availableCategories
      });

      // Create the article and complete processing
      const result: { articleId: Id<"articles"> } = await ctx.runMutation(internal.rssQueue.completeQueueItemProcessing, {
        queueItemId: args.queueItemId,
        processedArticle,
        producerName: producer.name
      });

      return {
        success: true,
        queueItemId: args.queueItemId,
        articleId: result.articleId,
        status: "completed"
      };

    } catch (error) {
      // Update status to failed and record error
      const retryCount = (queueItem.retryCount || 0) + 1;
      
      await ctx.runMutation(internal.rssQueue.markQueueItemFailed, {
        queueItemId: args.queueItemId,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        retryCount
      });

      throw error;
    }
  },
});

// Process article content with Perplexity AI
async function processWithPerplexity(articleData: {
  title: string;
  description: string;
  originalUrl: string;
  publishedAt: number;
  categories: string[];
  producerName: string;
  availableCategories: string[];
}): Promise<ProcessedArticle> {
  
  // Check if API key is configured
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("Perplexity API key not configured. Please add PERPLEXITY_API_KEY to your environment variables.");
  }

  const prompt = `You are a professional tech journalist tasked with fact-checking and rewriting news articles. 

ORIGINAL ARTICLE:
Title: ${articleData.title}
Description: ${articleData.description}
Source: ${articleData.producerName}
URL: ${articleData.originalUrl}
Published: ${new Date(articleData.publishedAt).toISOString()}
RSS Categories: ${articleData.categories.join(", ")}

TASK:
1. Use your research capabilities to find 3-5 reputable sources reporting on this same story
2. Fact-check the key claims against these sources
3. Write a well-balanced, journalistic article that synthesizes the information
4. Identify any conflicting reports or uncertain details
5. Create a compelling excerpt
6. Generate 3 detailed image generation prompts for visual content related to the article
7. Generate 5-10 relevant topics for content grouping and discoverability
8. When writing the article, make the topic words **bold** when they naturally appear in the text

REQUIREMENTS:
- Article should be 400-800 words
- Use professional, objective tone
- Include specific facts, dates, and figures when available
- Cite discrepancies between sources if they exist
- Focus on factual accuracy over sensationalism

IMAGE GENERATION PROMPT REQUIREMENTS:
- Create 3 detailed, specific prompts for AI image generation (Midjourney/OpenAI style)
- Each prompt should be 15-30 words describing a visual concept related to the article
- Focus on: technology, scenes, concepts, or visual metaphors from the story
- Make prompts specific and descriptive (not generic)
- Avoid copyrighted characters, logos, or specific people
- Include style suggestions where appropriate (e.g., "digital art", "photorealistic", "minimalist")

TOPIC GENERATION REQUIREMENTS:
- Return 5-10 topics
- Each topic MUST be exactly one token with no spaces (a single word). Internal hyphens/plus signs are allowed (e.g., "GPT-4", "C++").
- Topics MUST be unique (deduplicate case-insensitively)
- Prefer proper nouns, product/brand names, acronyms, and well-known tech buzzwords (e.g., "OpenAI", "GPT-5", "AI", "coding", "startups", "robotics", "cloud")
- Do NOT return multi-word phrases (e.g., not "AI models" or "machine learning"). If you would return a phrase, emit the single best token instead (e.g., "AI" or "ML").
- Avoid overly generic filler terms

MARKDOWN FORMATTING INSTRUCTIONS:
- Write as a flowing, natural article without section headings or subheadings
- NO bullet points, NO numbered lists, NO ## headings - just natural paragraph text
- Break into new paragraphs every 2-3 sentences at natural narrative breaks
- Only use **bold text** for the specific topics you generate
- Each topic MUST appear at least once as a standalone token in the body and be bolded exactly as **<topic>** (e.g., **AI**, **OpenAI**). Do not bold anything else.
- Write in a natural, journalistic style with smooth transitions between ideas
- Ensure proper spacing between paragraphs for readability
- Focus on narrative flow rather than structured sections

RESPONSE FORMAT (JSON):
{
  "title": "Improved title for the article",
  "body": "Full article content in markdown format",
  "excerpt": "2-3 sentence summary for preview",
  "category": "One of: ${articleData.availableCategories.join(", ")}",
  "sourceUrls": ["url1", "url2", "url3"],
  "imageGenPrompts": [
    "First detailed image generation prompt describing a visual concept related to the article",
    "Second detailed image generation prompt with different visual angle or component", 
    "Third detailed image generation prompt focusing on another key aspect"
  ],
  "topics": [
    "Relevant Topic 1",
    "Relevant Topic 2",
    "Relevant Topic 3",
    "Relevant Topic 4",
    "Relevant Topic 5"
  ]
}`;

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are a professional tech journalist. You must respond ONLY with valid JSON. Do not include any text before or after the JSON object. Do not use markdown formatting. Return raw JSON only. The JSON must include ALL required fields: title, body, excerpt, category, sourceUrls, imageGenPrompts, and topics."
          },
          {
            role: "user",
            content: prompt + "\n\nCRITICAL: You must include ALL fields in your JSON response:\n- imageGenPrompts: array of exactly 3 strings\n- topics: array of 5-10 strings\n- All other required fields\n\nRespond with ONLY the JSON object. No additional text, explanations, or formatting."
          }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data: PerplexityResponse = await response.json();
    
    // Debug logging for API response
    console.log("Perplexity API Response structure:", {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
    });
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from Perplexity API");
    }

    const content = data.choices[0].message.content.trim();
    
    // Try to extract JSON from the response
    let jsonContent = content;
    
    // If response contains extra text, try to find the JSON object
    if (!content.startsWith('{')) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      } else {
        throw new Error(`No JSON object found in response: ${content.substring(0, 500)}...`);
      }
    }
    
    // Parse the JSON response
    let processedArticle: ProcessedArticle;
    try {
      processedArticle = JSON.parse(jsonContent);
    } catch (parseError) {
      throw new Error(`Failed to parse Perplexity response as JSON: ${jsonContent.substring(0, 500)}...`);
    }

    // Debug: Log what Perplexity actually returned
    console.log("Perplexity raw response:", JSON.stringify(processedArticle, null, 2));

    // Validate required fields
    if (!processedArticle.title || !processedArticle.body || !processedArticle.category) {
      throw new Error("Missing required fields in Perplexity response");
    }

    // Ensure imageGenPrompts is an array with 3 prompts
    if (!processedArticle.imageGenPrompts || !Array.isArray(processedArticle.imageGenPrompts)) {
      console.warn("imageGenPrompts missing or invalid, setting empty array");
      console.log("imageGenPrompts received:", processedArticle.imageGenPrompts);
      processedArticle.imageGenPrompts = [];
    } else if (processedArticle.imageGenPrompts.length !== 3) {
      console.warn(`Expected 3 image generation prompts, got ${processedArticle.imageGenPrompts.length}`);
    }

    // Ensure topics is an array with 5-10 items
    if (!processedArticle.topics || !Array.isArray(processedArticle.topics)) {
      console.warn("topics missing or invalid, setting empty array");
      console.log("topics received:", processedArticle.topics);
      processedArticle.topics = [];
    } else if (processedArticle.topics.length < 5 || processedArticle.topics.length > 10) {
      console.warn(`Expected 5-10 topics, got ${processedArticle.topics.length}`);
    }

    // Enforce single-token, unique topics regardless of model behavior
    processedArticle.topics = sanitizeTopics(processedArticle.topics);
    // Ensure each topic is bolded at least once as standalone token
    processedArticle.body = boldTopicsInBody(processedArticle.body, processedArticle.topics);

    // No image processing - focusing on text content only

    return processedArticle;

  } catch (error) {
    console.error("Perplexity API processing error:", error);
    throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60); // Limit length
}

// Internal helper functions for the action

export const getQueueItemForProcessing = internalQuery({
  args: { queueItemId: v.id("rss_queue") },
  handler: async (ctx, args) => {
    const queueItem = await ctx.db.get(args.queueItemId);
    if (!queueItem) return null;
    
    const producer = await ctx.db.get(queueItem.producerId);
    if (!producer) return null;
    
    return { queueItem, producer };
  },
});

export const updateQueueItemStatus = internalMutation({
  args: { 
    queueItemId: v.id("rss_queue"),
    status: v.union(v.literal("waiting"), v.literal("processing"), v.literal("completed"), v.literal("failed"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.queueItemId, {
      status: args.status,
    });
  },
});

export const completeQueueItemProcessing = internalMutation({
  args: { 
    queueItemId: v.id("rss_queue"),
    processedArticle: v.object({
      title: v.string(),
      body: v.string(),
      excerpt: v.string(),
      category: v.string(),
      sourceUrls: v.array(v.string()),
      imageGenPrompts: v.array(v.string()),
      topics: v.array(v.string()),
    }),
    producerName: v.string()
  },
  handler: async (ctx, args) => {
    // Get category ID for the processed article
    let category = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("name"), args.processedArticle.category))
      .first();
    
    // Fallback logic if category not found
    if (!category) {
      console.log(`Category '${args.processedArticle.category}' not found, trying fallbacks...`);
      
      // Try common category mappings
      const categoryMappings: Record<string, string> = {
        "Robotics": "AI",
        "Biotech": "Science", 
        "Crypto": "Startups",
        "EVs": "Transport",
        "Electric Vehicles": "Transport",
        "Artificial Intelligence": "AI",
        "Machine Learning": "AI",
        "Blockchain": "Startups",
        "Cryptocurrency": "Startups"
      };
      
      const mappedCategory = categoryMappings[args.processedArticle.category];
      if (mappedCategory) {
        category = await ctx.db
          .query("categories")
          .filter((q) => q.eq(q.field("name"), mappedCategory))
          .first();
      }
      
      // Final fallback - use AI category as default
      if (!category) {
        console.log(`No mapping found, defaulting to AI category`);
        category = await ctx.db
          .query("categories")
          .filter((q) => q.eq(q.field("name"), "AI"))
          .first();
      }
      
      if (!category) {
        throw new Error("No valid category found, even AI category is missing");
      }
    }

    // Generate slug from title
    const slug = generateSlug(args.processedArticle.title);

    // No image storage - focusing on text content only
    const imageStorageId: Id<"_storage"> | undefined = undefined;

    // Create the AI-generated article
    const cleanedTopics = sanitizeTopics(args.processedArticle.topics);
    const articleId = await ctx.db.insert("articles", {
      title: args.processedArticle.title,
      body: args.processedArticle.body,
      excerpt: args.processedArticle.excerpt,
      categoryId: category._id,
      topics: cleanedTopics, // sanitized topics for content grouping and search
      authorId: "ai-system", // System-generated content
      status: "pending", // Requires admin approval
      isAutoGenerated: true,
      isEdited: false,
      sourceUrls: args.processedArticle.sourceUrls,
      rssSourceOrigin: [args.producerName],
      viewCount: 0,
      imageStorageId, // Store the generated image
      slug,
      imageGenPrompts: args.processedArticle.imageGenPrompts,
    });

    // Update queue item as completed
    await ctx.db.patch(args.queueItemId, {
      status: "completed",
      processed: true,
      processedAt: Date.now(),
      generatedArticleId: articleId,
    });

    return { articleId };
  },
});

export const markQueueItemFailed = internalMutation({
  args: { 
    queueItemId: v.id("rss_queue"),
    errorMessage: v.string(),
    retryCount: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.queueItemId, {
      status: "failed",
      errorMessage: args.errorMessage,
      retryCount: args.retryCount,
    });
  },
});

export const getAvailableCategories = internalQuery({
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return categories.map(cat => cat.name);
  },
});