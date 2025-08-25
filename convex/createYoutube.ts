import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Extract YouTube video data using Supadata API
export const extractYouTubeData = action({
  args: {
    videoUrl: v.string(),
    videoTitle: v.string(),
    categoryId: v.id("categories"),
    timecodeStart: v.optional(v.number()),
    timecodeEnd: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; youtubeId?: Id<"create_youtube">; error?: string }> => {
    try {
      // Get user identity
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return { success: false, error: "Authentication required" };
      }

      // Get or create user in Convex database
      const userId = await ctx.runMutation(api.users.getOrCreateUser, {
        clerkId: identity.subject,
        username: identity.name || undefined,
      });

      // Extract video ID from YouTube URL
      const videoId = extractVideoIdFromUrl(args.videoUrl);
      if (!videoId) {
        return { success: false, error: "Invalid YouTube URL format" };
      }

      // Check if API key is configured
      const supadataApiKey = process.env.SUPADATA_API_KEY;
      if (!supadataApiKey) {
        return { success: false, error: "Supadata API key not configured" };
      }

      // Call Supadata API to get video metadata and transcript
      const response = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`, {
        method: "GET",
        headers: {
          "x-api-key": supadataApiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Supadata API error: ${response.status} - ${errorText}` };
      }

      const transcriptData = await response.json();

      // Use the custom video title provided by user
      const videoTitle = args.videoTitle;

      // Extract transcript text based on in/out points (timecodes)
      let transcript = "";
      if (transcriptData.content && Array.isArray(transcriptData.content)) {
        if (args.timecodeStart !== undefined || args.timecodeEnd !== undefined) {
          // Extract segment based on specified in/out points
          const startMs = (args.timecodeStart || 0) * 1000;
          const endMs = args.timecodeEnd ? args.timecodeEnd * 1000 : undefined;
          transcript = extractTranscriptSegment(transcriptData.content, startMs, endMs);
        } else {
          // Use full transcript if no in/out points specified
          transcript = transcriptData.content.map((segment: any) => segment.text).join(' ');
        }
      } else if (typeof transcriptData.content === 'string') {
        transcript = transcriptData.content;
      }

      if (!transcript.trim()) {
        return { success: false, error: "No transcript content available for the specified time range" };
      }

      // Store YouTube source data with extracted transcript segment
      const youtubeId = await ctx.runMutation(internal.createYoutube.createYouTubeSource, {
        videoUrl: args.videoUrl,
        videoTitle,
        transcript: transcript.trim(),
        categoryId: args.categoryId,
        timecodeStart: args.timecodeStart,
        timecodeEnd: args.timecodeEnd,
        userId: userId,
      });

      return { success: true, youtubeId };

    } catch (error) {
      console.error("YouTube extraction error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to extract YouTube data" 
      };
    }
  },
});

// Re-extract transcript with updated timecodes
export const updateYouTubeTranscript = action({
  args: {
    youtubeId: v.id("create_youtube"),
    timecodeStart: v.optional(v.number()),
    timecodeEnd: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    try {
      // Get existing YouTube source
      const youtube = await ctx.runQuery(internal.createYoutube.getYouTubeSource, {
        youtubeId: args.youtubeId,
      });

      if (!youtube) {
        return { success: false, error: "YouTube source not found" };
      }

      // Extract video ID from stored URL
      const videoId = extractVideoIdFromUrl(youtube.videoUrl);
      if (!videoId) {
        return { success: false, error: "Invalid video URL in source" };
      }

      // Check if API key is configured
      const supadataApiKey = process.env.SUPADATA_API_KEY;
      if (!supadataApiKey) {
        return { success: false, error: "Supadata API key not configured" };
      }

      // Call Supadata API to get fresh transcript data
      const response = await fetch(`https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`, {
        method: "GET",
        headers: {
          "x-api-key": supadataApiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `Supadata API error: ${response.status} - ${errorText}` };
      }

      const transcriptData = await response.json();

      // Extract transcript text based on updated in/out points
      let transcript = "";
      if (transcriptData.content && Array.isArray(transcriptData.content)) {
        if (args.timecodeStart !== undefined || args.timecodeEnd !== undefined) {
          // Extract segment based on updated in/out points
          const startMs = (args.timecodeStart || 0) * 1000;
          const endMs = args.timecodeEnd ? args.timecodeEnd * 1000 : undefined;
          transcript = extractTranscriptSegment(transcriptData.content, startMs, endMs);
        } else {
          // Use full transcript if no in/out points specified
          transcript = transcriptData.content.map((segment: any) => segment.text).join(' ');
        }
      } else if (typeof transcriptData.content === 'string') {
        transcript = transcriptData.content;
      }

      if (!transcript.trim()) {
        return { success: false, error: "No transcript content available for the specified time range" };
      }

      // Update YouTube source with new transcript and timecodes
      await ctx.runMutation(internal.createYoutube.updateYouTubeSource, {
        youtubeId: args.youtubeId,
        transcript: transcript.trim(),
        timecodeStart: args.timecodeStart,
        timecodeEnd: args.timecodeEnd,
      });

      return { success: true };

    } catch (error) {
      console.error("YouTube transcript update error:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update transcript" 
      };
    }
  },
});

// List YouTube sources for display
export const listYouTubeSources = query({
  args: {
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("create_youtube");

    if (args.categoryId) {
      query = query.filter((q) => q.eq(q.field("categoryId"), args.categoryId));
    }

    const youtubeSources = await query
      .order("desc")
      .collect();

    // Get category names for display
    const sourcesWithCategory = await Promise.all(
      youtubeSources.map(async (source) => {
        const category = await ctx.db.get(source.categoryId);
        return {
          ...source,
          categoryName: category?.name || "Unknown Category",
        };
      })
    );

    return sourcesWithCategory;
  },
});

// Add YouTube source to universal queue
export const addYouTubeToQueue = mutation({
  args: {
    youtubeId: v.id("create_youtube"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; queueItemId?: Id<"create_queue"> }> => {
    const youtube = await ctx.db.get(args.youtubeId);
    if (!youtube) {
      throw new Error("YouTube source not found");
    }

    const category = await ctx.db.get(youtube.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    // Add to universal queue with normalized format
    const queueItem = await ctx.runMutation(api.createQueue.addToQueue, {
      title: youtube.videoTitle || `YouTube Video`,
      url: youtube.videoUrl,
      concept: youtube.transcript, // Use the extracted transcript segment
      category: category.name,
      createSource: `YouTube: Video`, // Will be enhanced with channel name if available
    });

    // Delete the YouTube source after adding to queue
    await ctx.db.delete(args.youtubeId);

    return { success: true, queueItemId: queueItem };
  },
});

// Delete YouTube source
export const deleteYouTubeSource = mutation({
  args: {
    youtubeId: v.id("create_youtube"),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.db.delete(args.youtubeId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to delete YouTube source" 
      };
    }
  },
});

// Internal mutations and queries
export const createYouTubeSource = internalMutation({
  args: {
    videoUrl: v.string(),
    videoTitle: v.string(),
    transcript: v.string(),
    categoryId: v.id("categories"),
    timecodeStart: v.optional(v.number()),
    timecodeEnd: v.optional(v.number()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const youtubeId = await ctx.db.insert("create_youtube", {
      videoUrl: args.videoUrl,
      videoTitle: args.videoTitle,
      transcript: args.transcript,
      categoryId: args.categoryId,
      timecodeStart: args.timecodeStart,
      timecodeEnd: args.timecodeEnd,
      createdBy: args.userId,
      updatedAt: Date.now(),
    });

    return youtubeId;
  },
});

export const updateYouTubeSource = internalMutation({
  args: {
    youtubeId: v.id("create_youtube"),
    transcript: v.string(),
    timecodeStart: v.optional(v.number()),
    timecodeEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.youtubeId, {
      transcript: args.transcript,
      timecodeStart: args.timecodeStart,
      timecodeEnd: args.timecodeEnd,
      updatedAt: Date.now(),
    });
  },
});

// Update YouTube video title
export const updateYouTubeTitle = mutation({
  args: {
    youtubeId: v.id("create_youtube"),
    videoTitle: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.youtubeId, {
      videoTitle: args.videoTitle,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const getYouTubeSource = internalQuery({
  args: {
    youtubeId: v.id("create_youtube"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.youtubeId);
  },
});

// Utility functions
function extractVideoIdFromUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^[a-zA-Z0-9_-]{11}$/ // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
}

function extractTranscriptSegment(transcriptContent: any[], startMs: number, endMs?: number): string {
  if (!Array.isArray(transcriptContent)) {
    return "";
  }

  const filteredSegments = transcriptContent.filter(segment => {
    if (!segment.offset || !segment.duration) return false;
    
    const segmentStart = segment.offset;
    const segmentEnd = segment.offset + segment.duration;
    
    // Include segments that overlap with desired time range
    if (endMs === undefined) {
      // No end time specified, get everything from start
      return segmentEnd > startMs;
    } else {
      // Both start and end specified
      return segmentStart < endMs && segmentEnd > startMs;
    }
  });

  return filteredSegments.map(s => s.text).join(' ');
}

// Get YouTube statistics
export const getYouTubeStats = query({
  args: {},
  handler: async (ctx) => {
    const allSources = await ctx.db.query("create_youtube").collect();
    
    const stats = {
      total: allSources.length,
      byCategory: {} as Record<string, number>,
      hasTimecodes: allSources.filter(s => s.timecodeStart !== undefined || s.timecodeEnd !== undefined).length,
    };

    // Group by category
    for (const source of allSources) {
      const category = await ctx.db.get(source.categoryId);
      if (category) {
        stats.byCategory[category.name] = (stats.byCategory[category.name] || 0) + 1;
      }
    }

    return stats;
  },
});