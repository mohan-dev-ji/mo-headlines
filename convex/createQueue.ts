import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Universal Queue Management (ADR 2)
// Handles normalized queue items from all source types

// Get all queue items
export const getQueueItems = query({
  args: {},
  handler: async (ctx) => {
    const queueItems = await ctx.db
      .query("create_queue")
      .withIndex("by_queued_at")
      .order("desc")
      .collect();

    return queueItems;
  },
});

// Get queue statistics
export const getQueueStats = query({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("create_queue").collect();
    
    const stats = {
      total: allItems.length,
      pending: allItems.filter(item => item.status === "pending").length,
      processing: allItems.filter(item => item.status === "processing").length,
      completed: allItems.filter(item => item.status === "complete").length,
      bySource: {
        rss: allItems.filter(item => item.createSource.includes("RSS:")).length,
        research: allItems.filter(item => item.createSource.includes("Research:")).length,
        youtube: allItems.filter(item => item.createSource.includes("YouTube:")).length,
      }
    };
    
    return stats;
  },
});

// Add item to universal queue
export const addToQueue = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    concept: v.string(),
    category: v.string(),
    createSource: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const queueItem = await ctx.db.insert("create_queue", {
      title: args.title,
      url: args.url,
      concept: args.concept,
      category: args.category,
      createSource: args.createSource,
      status: "pending",
      queuedAt: now,
      isProcessing: false,
      processed: false,
    });

    return queueItem;
  },
});

// Process single queue item
export const processQueueItem = action({
  args: {
    queueItemId: v.id("create_queue"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; articleId?: Id<"articles">; error?: string }> => {
    // Mark as processing
    await ctx.runMutation(internal.createQueue.setItemProcessing, {
      queueItemId: args.queueItemId,
      isProcessing: true,
    });

    try {
      // Get the queue item
      const queueItem = await ctx.runQuery(internal.createQueue.getQueueItem, {
        queueItemId: args.queueItemId,
      });

      if (!queueItem) {
        throw new Error("Queue item not found");
      }

      // Process with AI using normalized fields
      const processedArticles = await processWithAIInternal({
        items: [{
          title: queueItem.title,
          url: queueItem.url,
          concept: queueItem.concept,
          category: queueItem.category,
          createSource: queueItem.createSource,
        }],
        ctx,
      });
      
      const processedArticle = processedArticles[0]; // Get first (and only) article

      // Create article from processed content
      const articleId: Id<"articles"> = await ctx.runMutation(internal.createQueue.createArticleFromProcessed, {
        processedData: processedArticle,
        queueItemId: args.queueItemId,
      });

      // Mark as complete
      await ctx.runMutation(internal.createQueue.setItemComplete, {
        queueItemId: args.queueItemId,
        articleId: articleId,
      });

      return { success: true, articleId };
    } catch (error) {
      // Mark as failed
      await ctx.runMutation(internal.createQueue.setItemFailed, {
        queueItemId: args.queueItemId,
        errorMessage: error instanceof Error ? error.message : "Processing failed",
      });

      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
});

// Internal mutations
export const setItemProcessing = internalMutation({
  args: {
    queueItemId: v.id("create_queue"),
    isProcessing: v.boolean(),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      isProcessing: args.isProcessing,
      status: args.isProcessing ? "processing" : "pending",
    };
    
    // Clear error message when starting to process
    if (args.isProcessing) {
      updateData.errorMessage = undefined;
    }
    
    await ctx.db.patch(args.queueItemId, updateData);
  },
});

export const setItemComplete = internalMutation({
  args: {
    queueItemId: v.id("create_queue"),
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.queueItemId, {
      status: "complete",
      processed: true,
      isProcessing: false,
      processedAt: now,
      generatedArticleId: args.articleId,
      errorMessage: undefined, // Clear any previous error messages
    });
  },
});

export const setItemFailed = internalMutation({
  args: {
    queueItemId: v.id("create_queue"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.queueItemId);
    const retryCount = (item?.retryCount || 0) + 1;
    
    await ctx.db.patch(args.queueItemId, {
      status: "pending", // Allow retry
      isProcessing: false,
      errorMessage: args.errorMessage,
      retryCount: retryCount,
    });
  },
});

export const getQueueItem = internalQuery({
  args: {
    queueItemId: v.id("create_queue"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.queueItemId);
  },
});

// Bulk delete queue items
export const bulkDeleteQueueItems = mutation({
  args: {
    itemIds: v.array(v.id("create_queue")),
  },
  handler: async (ctx, args) => {
    const results = {
      success: true,
      successCount: 0,
      failedCount: 0,
      failedIds: [] as Id<"create_queue">[],
      errors: [] as string[],
    };

    for (const itemId of args.itemIds) {
      try {
        await ctx.db.delete(itemId);
        results.successCount++;
      } catch (error) {
        results.failedCount++;
        results.failedIds.push(itemId);
        results.errors.push(error instanceof Error ? error.message : "Unknown error");
        results.success = false;
      }
    }

    return results;
  },
});

// Delete single queue item
export const deleteQueueItem = mutation({
  args: {
    itemId: v.id("create_queue"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.delete(args.itemId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to delete item" 
      };
    }
  },
});

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

// Normalize and constrain topics to 1-2 word proper nouns only
function sanitizeTopics(topics: string[]): string[] {
  // Generic terms to filter out - these are not proper nouns
  const genericTerms = new Set([
    'ai', 'ml', 'coding', 'software', 'technology', 'tech', 'innovation', 'startup', 'startups',
    'robotics', 'automation', 'cloud', 'data', 'analytics', 'security', 'privacy', 'blockchain',
    'crypto', 'web3', 'digital', 'mobile', 'internet', 'online', 'platform', 'app', 'api',
    'development', 'programming', 'algorithm', 'database', 'network', 'system', 'framework',
    'machine learning', 'artificial intelligence'
  ]);

  const allowToken = (raw: string): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    
    // Allow 1-2 words only, convert spaces to hyphens
    const words = trimmed.split(/\s+/);
    if (words.length > 2) return null;
    if (words.length < 1) return null;
    
    // Each word should be valid (letters, numbers, basic punctuation)
    for (const word of words) {
      if (!/^[A-Za-z0-9#+.-]+$/.test(word)) return null;
      if (word.length < 2) return null;
    }
    
    // Convert to hyphenated version for URLs
    const hyphenated = words.join('-');
    
    // Filter out generic terms (case-insensitive)
    if (genericTerms.has(trimmed.toLowerCase())) return null;
    
    // Return hyphenated version for URL compatibility
    return hyphenated;
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
    
    // Convert hyphenated topic back to spaced version for text matching
    const textVersion = topic.replace(/-/g, ' ');
    const escapedText = textVersion.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Already bolded? (matches **Topic** case-insensitively)
    const boldRegex = new RegExp(`\\*\\*${escapedText}\\*\\*`, "i");
    if (boldRegex.test(updated)) continue;

    // For multi-word topics, look for the full phrase
    // For single-word topics, use word boundaries
    let standaloneRegex;
    if (textVersion.includes(' ')) {
      // Multi-word: match full phrase with word boundaries
      standaloneRegex = new RegExp(`\\b(${escapedText})\\b`, "i");
    } else {
      // Single word: use original logic
      const boundary = "[^A-Za-z0-9#+-]";
      standaloneRegex = new RegExp(`(^|${boundary})(${escapedText})(?=($|${boundary}))`, "i");
    }

    if (standaloneRegex.test(updated)) {
      // Replace first occurrence, bolding the original spaced version
      if (textVersion.includes(' ')) {
        updated = updated.replace(standaloneRegex, `**${textVersion}**`);
      } else {
        updated = updated.replace(standaloneRegex, (_m, p1: string) => `${p1}**${textVersion}**`);
      }
    }
  }

  return updated;
}

// Internal AI processing function - handles single item or batch
async function processWithAIInternal(args: {
  items: Array<{
    title: string;
    url: string;
    concept: string;
    category: string;
    createSource: string;
  }>;
  ctx: any;
}): Promise<ProcessedArticle[]> {
  const itemCount = args.items.length;
  console.log(`🤖 Processing with AI: ${itemCount} item${itemCount === 1 ? '' : 's'}`);
  
  // Check if API key is configured
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("Perplexity API key not configured. Please add PERPLEXITY_API_KEY to your environment variables.");
  }

  // Get available categories for the prompt
  const availableCategories = await args.ctx.runQuery(api.categories.getAllCategories);
  const categoryNames = availableCategories.map((cat: any) => cat.name);

  // Generate content sections for each item
  const contentSections = args.items.map((item, index) => `
ARTICLE ${index + 1}:
Title: ${item.title}
Description: ${item.concept}
Source: ${item.createSource}
URL: ${item.url}
Category: ${item.category}`).join('\n');

    const prompt = `You are a professional tech journalist tasked with fact-checking and rewriting news articles. 

ORIGINAL CONTENT:
${contentSections}

TASK:
Process each article individually and return an array of processed articles.

For each article:
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
- Each topic can be 1-2 words maximum for proper nouns only
- Topics MUST be unique (deduplicate case-insensitively)  
- ONLY return proper nouns: company names, product names, people names, or specific technologies
- SINGLE WORDS: "OpenAI", "Tesla", "Meta", "ChatGPT", "iPhone", "AWS", "Microsoft", "Google", "Nvidia"
- TWO WORDS ALLOWED: People names ("Elon Musk", "Donald Trump"), product names ("Adobe Express", "Microsoft Office", "Acrobat Studio")
- NO generic terms, categories, or descriptive phrases
- GOOD examples: "OpenAI", "Tesla", "GPT-4", "Meta", "Elon Musk", "Donald Trump", "Adobe Express", "Microsoft Office", "Tim Cook"
- BAD examples: "AI", "coding", "startups", "robotics", "cloud", "technology", "innovation", "software", "machine learning", "artificial intelligence"
- Do NOT return generic concepts, categories, or descriptive terms
- Focus on entities that readers would recognize as specific names, brands, products, or people

MARKDOWN FORMATTING INSTRUCTIONS:
- Write as a flowing, natural article without section headings or subheadings
- NO bullet points, NO numbered lists, NO ## headings - just natural paragraph text
- Break into new paragraphs every 2-3 sentences at natural narrative breaks
- Only use **bold text** for the specific topics you generate
- Each topic MUST appear at least once as a standalone token in the body and be bolded exactly as **<topic>** (e.g., **AI**, **OpenAI**). Do not bold anything else.
- Write in a natural, journalistic style with smooth transitions between ideas
- Ensure proper spacing between paragraphs for readability
- Focus on narrative flow rather than structured sections

RESPONSE FORMAT (JSON ARRAY):
[
  {
    "title": "Improved title for article 1",
    "body": "Full article content in markdown format",
    "excerpt": "2-3 sentence summary for preview",
    "category": "One of: ${categoryNames.join(", ")}",
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
  }${args.items.length > 1 ? ',\n  {\n    "title": "Improved title for article 2",\n    "body": "Full article content in markdown format",\n    "excerpt": "2-3 sentence summary for preview",\n    "category": "One of: ' + categoryNames.join(", ") + '",\n    "sourceUrls": ["url1", "url2", "url3"],\n    "imageGenPrompts": ["prompt1", "prompt2", "prompt3"],\n    "topics": ["Topic1", "Topic2", "Topic3", "Topic4", "Topic5"]\n  }\n  // ... repeat for each article' : ''}
]`;

    try {
      console.log(`📡 Calling Perplexity API for ${itemCount} item${itemCount === 1 ? '' : 's'}`);
      
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
              content: `You are a professional tech journalist. You must respond ONLY with valid JSON ARRAY. Do not include any text before or after the JSON array. Return raw JSON array only. Process ${itemCount} article${itemCount === 1 ? '' : 's'} and return an array with ${itemCount} processed article${itemCount === 1 ? '' : 's'}.`
            },
            {
              role: "user",
              content: prompt + `\n\nCRITICAL: You must return a JSON ARRAY with exactly ${itemCount} article${itemCount === 1 ? '' : 's'}. Each article must include ALL fields:\n- title, body, excerpt, category, sourceUrls, imageGenPrompts, topics\n- imageGenPrompts: array of exactly 3 strings\n- topics: array of 5-10 strings\n\nRespond with ONLY the JSON array. No additional text, explanations, or formatting.`
            }
          ],
          temperature: 0.2,
          max_tokens: itemCount * 2000, // Increased tokens for bulk processing
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }

      const data: PerplexityResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from Perplexity API");
      }

      const content = data.choices[0].message.content.trim();
      
      // Try to extract JSON from the response
      let jsonContent = content;
      
      // If response contains extra text, try to find the JSON array/object
      if (!content.startsWith('[') && !content.startsWith('{')) {
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        const objectMatch = content.match(/\{[\s\S]*\}/);
        
        if (arrayMatch) {
          jsonContent = arrayMatch[0];
        } else if (objectMatch) {
          jsonContent = objectMatch[0];
        } else {
          throw new Error(`No JSON found in response: ${content.substring(0, 500)}...`);
        }
      }
      
      // Parse the JSON response as array
      let processedArticles: ProcessedArticle[];
      try {
        const parsed = JSON.parse(jsonContent);
        // Handle both single object and array responses
        processedArticles = Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseError) {
        // Check if response was likely truncated
        const isLikelyTruncated = !jsonContent.includes('}]') && !jsonContent.endsWith('}') && !jsonContent.endsWith(']');
        const errorPrefix = isLikelyTruncated ? 'Response appears truncated - try processing fewer items at once. ' : '';
        throw new Error(`${errorPrefix}Failed to parse Perplexity response as JSON: ${jsonContent.substring(0, 500)}...`);
      }

      console.log(`✅ AI processing complete for ${processedArticles.length} article${processedArticles.length === 1 ? '' : 's'}`);

      // Validate and sanitize each article
      for (let i = 0; i < processedArticles.length; i++) {
        const article = processedArticles[i];
        
        // Validate required fields
        if (!article.title || !article.body || !article.category) {
          throw new Error(`Missing required fields in article ${i + 1} of Perplexity response`);
        }

        // Ensure imageGenPrompts is an array
        if (!article.imageGenPrompts || !Array.isArray(article.imageGenPrompts)) {
          console.warn(`Article ${i + 1}: imageGenPrompts missing or invalid, setting empty array`);
          article.imageGenPrompts = [];
        }

        // Ensure topics is an array
        if (!article.topics || !Array.isArray(article.topics)) {
          console.warn(`Article ${i + 1}: topics missing or invalid, setting empty array`);
          article.topics = [];
        }

        // Enforce single-token, proper noun topics regardless of model behavior
        const originalTopics = article.topics;
        article.topics = sanitizeTopics(article.topics);
        
        // Remove bold formatting from topics that were filtered out
        const filteredOutTopics = originalTopics.filter(topic => !article.topics.includes(topic));
        for (const filteredTopic of filteredOutTopics) {
          const escapedTopic = filteredTopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const boldRegex = new RegExp(`\\*\\*${escapedTopic}\\*\\*`, 'gi');
          article.body = article.body.replace(boldRegex, filteredTopic);
        }
        
        // Ensure each topic is bolded at least once as standalone token
        article.body = boldTopicsInBody(article.body, article.topics);

        console.log(`🏷️ Article ${i + 1} sanitized topics: [${article.topics.join(', ')}]`);
      }

      return processedArticles;

    } catch (error) {
      console.error("AI processing error:", error);
      throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// AI Processing action - Universal processor for all source types
export const processWithAI = action({
  args: {
    title: v.string(),
    url: v.string(),
    concept: v.string(),
    category: v.string(),
    createSource: v.string(),
  },
  handler: async (ctx, args): Promise<ProcessedArticle> => {
    const processedArticles = await processWithAIInternal({
      items: [{
        title: args.title,
        url: args.url,
        concept: args.concept,
        category: args.category,
        createSource: args.createSource,
      }],
      ctx,
    });
    return processedArticles[0]; // Return first (and only) article
  },
});

// Create article from processed data
export const createArticleFromProcessed = internalMutation({
  args: {
    processedData: v.object({
      title: v.string(),
      body: v.string(),
      excerpt: v.string(),
      category: v.string(),
      sourceUrls: v.array(v.string()),
      imageGenPrompts: v.array(v.string()),
      topics: v.array(v.string()),
    }),
    queueItemId: v.id("create_queue"),
  },
  handler: async (ctx, args) => {
    // Find category ID
    const category = await ctx.db
      .query("categories")
      .filter((q) => q.eq(q.field("name"), args.processedData.category))
      .first();

    if (!category) {
      throw new Error(`Category "${args.processedData.category}" not found`);
    }

    // Create the article
    const articleId = await ctx.db.insert("articles", {
      title: args.processedData.title,
      body: args.processedData.body,
      categoryId: category._id,
      topics: args.processedData.topics,
      authorId: "ai-system", // System-generated
      status: "pending", // Enters review workflow
      isAutoGenerated: true,
      sourceUrls: args.processedData.sourceUrls,
      rssSourceOrigin: [], // Universal queue doesn't use RSS-specific field
      excerpt: args.processedData.excerpt,
      slug: args.processedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      imageGenPrompts: args.processedData.imageGenPrompts,
    });

    return articleId;
  },
});

// Clear all queue items (development)
export const clearAllQueueItems = mutation({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("create_queue").collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    return { cleared: items.length };
  },
});

// Find duplicates for deduplication
export const findDuplicatesForDeduplication = query({
  args: { 
    selectedIds: v.optional(v.array(v.id("create_queue")))
  },
  handler: async (ctx, args) => {
    // Get items to check for duplicates
    let queueItems;
    if (args.selectedIds && args.selectedIds.length > 0) {
      // Check only selected items
      queueItems = await Promise.all(
        args.selectedIds.map(async (itemId) => {
          const item = await ctx.db.get(itemId);
          return item;
        })
      );
      // Filter out null items
      queueItems = queueItems.filter(item => item !== null);
    } else {
      // Check all pending items
      queueItems = await ctx.db
        .query("create_queue")
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();
    }

    if (queueItems.length === 0) {
      return { articlesToDelete: [] };
    }

    // Convert to format expected by deduplication utility
    const articlesForDedup = queueItems.map(item => ({
      _id: item._id,
      title: item.title,
      createdAt: item._creationTime,
      url: item.url,
      concept: item.concept,
      createSource: item.createSource,
      category: item.category,
    }));

    // Simple similarity check for now - group by normalized title
    const titleGroups = new Map<string, typeof articlesForDedup>();
    
    for (const item of articlesForDedup) {
      // Create normalized title hash
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
        const sorted = group.sort((a, b) => b.createdAt - a.createdAt);
        articlesToDelete.push(...sorted.slice(1)); // Keep first (newest), delete rest
      }
    }

    return {
      articlesToDelete: articlesToDelete.map(item => ({
        _id: item._id,
        title: item.title,
        createSource: item.createSource,
        createdAt: item.createdAt
      }))
    };
  },
});

// Search queue items
export const searchQueueItems = query({
  args: { 
    searchTerm: v.string(),
    status: v.optional(v.union(v.literal("pending"), v.literal("processing"), v.literal("complete"))),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("create_queue");
    
    // Filter by status if provided
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const allItems = await query.collect();
    
    // If no search term, return filtered by status only
    if (!args.searchTerm.trim()) {
      return allItems
        .sort((a, b) => b.queuedAt - a.queuedAt)
        .slice(0, args.limit || 50);
    }
    
    const searchLower = args.searchTerm.toLowerCase();
    
    // Filter items by search term
    const filteredItems = allItems.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      item.concept.toLowerCase().includes(searchLower) ||
      item.createSource.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
    
    return filteredItems
      .sort((a, b) => b.queuedAt - a.queuedAt)
      .slice(0, args.limit || 50);
  },
});

// Batch process multiple queue items - TRUE batch processing
export const batchProcessQueueItems = action({
  args: {
    queueItemIds: v.array(v.id("create_queue")),
    batchSize: v.optional(v.number()), // Max items per API call (default 5)
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const batchSize = Math.min(args.batchSize || 5, 10); // Limit to 10 items max per batch
    const results = {
      successful: [] as Id<"create_queue">[],
      failed: [] as { itemId: Id<"create_queue">; error: string }[],
      totalProcessed: 0,
      apiCallsMade: 0,
    };

    // Process items in batches for true batch processing
    for (let i = 0; i < args.queueItemIds.length; i += batchSize) {
      const batchIds = args.queueItemIds.slice(i, i + batchSize);
      
      try {
        // Get all items in this batch
        const batchItems = await Promise.all(
          batchIds.map(async (itemId) => {
            const item = await ctx.runQuery(internal.createQueue.getQueueItem, { queueItemId: itemId });
            return { itemId, item };
          })
        );

        // Filter valid pending items
        const validItems = batchItems.filter(({ item }) => item && item.status === "pending");
        
        if (validItems.length === 0) {
          // Mark invalid items as failed
          for (const { itemId, item } of batchItems) {
            const error = !item ? "Item not found" : `Item status is ${item.status}, expected pending`;
            results.failed.push({ itemId, error });
          }
          results.totalProcessed += batchIds.length;
          continue;
        }

        // Mark all valid items as processing
        await Promise.all(
          validItems.map(({ itemId }) =>
            ctx.runMutation(internal.createQueue.setItemProcessing, {
              queueItemId: itemId,
              isProcessing: true,
            })
          )
        );

        // TRUE BATCH PROCESSING: Process all items in single API call
        console.log(`🚀 Batch processing ${validItems.length} items in single API call`);
        
        const processedArticles = await processWithAIInternal({
          items: validItems.map(({ item }) => ({
            title: item!.title,
            url: item!.url,
            concept: item!.concept,
            category: item!.category,
            createSource: item!.createSource,
          })),
          ctx,
        });

        results.apiCallsMade++;

        // Create articles for each processed result
        for (let j = 0; j < processedArticles.length && j < validItems.length; j++) {
          const processedArticle = processedArticles[j];
          const { itemId } = validItems[j];

          try {
            // Create article from processed content
            const articleId: Id<"articles"> = await ctx.runMutation(internal.createQueue.createArticleFromProcessed, {
              processedData: processedArticle,
              queueItemId: itemId,
            });

            // Mark as complete
            await ctx.runMutation(internal.createQueue.setItemComplete, {
              queueItemId: itemId,
              articleId: articleId,
            });

            results.successful.push(itemId);
          } catch (error) {
            // Mark individual item as failed
            await ctx.runMutation(internal.createQueue.setItemFailed, {
              queueItemId: itemId,
              errorMessage: error instanceof Error ? error.message : "Article creation failed",
            });
            
            results.failed.push({ 
              itemId, 
              error: error instanceof Error ? error.message : "Article creation failed" 
            });
          }
        }

      } catch (error) {
        // Entire batch failed - mark all items as failed
        for (const itemId of batchIds) {
          await ctx.runMutation(internal.createQueue.setItemFailed, {
            queueItemId: itemId,
            errorMessage: error instanceof Error ? error.message : "Batch processing failed",
          });
          
          results.failed.push({ 
            itemId, 
            error: error instanceof Error ? error.message : "Batch processing failed" 
          });
        }
      }

      results.totalProcessed += batchIds.length;
      
      // Small delay between batches to be respectful to the API
      if (i + batchSize < args.queueItemIds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  },
});

// Get items by status filter
export const getQueueItemsByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("complete")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("create_queue")
      .filter((q) => q.eq(q.field("status"), args.status))
      .order("desc")
      .take(args.limit || 50);

    return items;
  },
});