# Timecode-Based YouTube Transcript Extraction with Supadata.ai

Supadata.ai provides a powerful API for extracting YouTube video transcripts with precise timestamp data, making it ideal for segment-based extraction and AI article generation. This guide covers practical implementation for Next.js applications with comprehensive error handling and performance optimization.

## Supadata.ai API Response Structure

The Supadata.ai API returns transcript data in two primary formats, with timestamp information provided in milliseconds for precise segment extraction.

### API Endpoints and Authentication

**Base API:** `https://api.supadata.ai/v1`
**Primary Endpoint:** `GET /youtube/transcript`
**Authentication:** HTTP header `x-api-key: YOUR_API_KEY`

```javascript
import { Supadata } from '@supadata/js';

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY
});
```

### Response Formats

**Timestamped Response (default):**
```javascript
{
  "content": [
    {
      "text": "Welcome to our tutorial on AI development",
      "offset": 1020,      // Start time in milliseconds
      "duration": 3500,    // Duration in milliseconds  
      "lang": "en"
    },
    {
      "text": "Today we'll cover the fundamentals",
      "offset": 4520,
      "duration": 2800,
      "lang": "en"
    }
  ],
  "lang": "en",
  "availableLangs": ["en", "es", "zh-TW"]
}
```

**Key Timestamp Properties:**
- **offset**: Start time in milliseconds from video beginning
- **duration**: Length of the text segment in milliseconds
- **End time calculation**: `offset + duration`

**Plain Text Response:**
```javascript
{
  "content": "Welcome to our tutorial on AI development. Today we'll cover the fundamentals...",
  "lang": "en", 
  "availableLangs": ["en", "es", "zh-TW"]
}
```

## Extracting Specific Video Segments

### Basic Segment Extraction Function

```javascript
// Filter transcript by time range (milliseconds)
function extractTranscriptSegment(transcript, startMs, endMs) {
  if (!transcript.content || !Array.isArray(transcript.content)) {
    throw new Error('Invalid transcript format - no timestamped content');
  }
  
  const filteredSegments = transcript.content.filter(segment => {
    const segmentStart = segment.offset;
    const segmentEnd = segment.offset + segment.duration;
    
    // Include segments that overlap with desired time range
    return segmentStart < endMs && segmentEnd > startMs;
  });
  
  return {
    ...transcript,
    content: filteredSegments,
    extractedText: filteredSegments.map(s => s.text).join(' '),
    timeRange: { start: startMs, end: endMs },
    segmentCount: filteredSegments.length
  };
}

// Usage example: Extract 1-3 minute segment
const fullTranscript = await supadata.transcript({
  url: 'https://www.youtube.com/watch?v=VIDEO_ID'
});

const segment = extractTranscriptSegment(
  fullTranscript,
  60000,  // 1 minute start
  180000  // 3 minute end
);
```

### Advanced Multi-Segment Extraction

```javascript
class TranscriptSegmentExtractor {
  constructor(apiKey) {
    this.supadata = new Supadata({ apiKey });
  }
  
  async extractMultipleSegments(videoUrl, timeRanges) {
    const transcript = await this.supadata.transcript({
      url: videoUrl,
      text: false, // Get timestamped chunks
      lang: 'en'
    });
    
    return timeRanges.map(range => ({
      label: range.label || `${this.formatTime(range.start)}-${this.formatTime(range.end)}`,
      startTime: range.start,
      endTime: range.end,
      segments: this.filterByTimeRange(transcript, range.start, range.end),
      text: this.getSegmentText(transcript, range.start, range.end),
      wordCount: this.getWordCount(transcript, range.start, range.end)
    }));
  }
  
  filterByTimeRange(transcript, startMs, endMs) {
    return transcript.content.filter(segment => {
      const segmentStart = segment.offset;
      const segmentEnd = segment.offset + segment.duration;
      return segmentStart < endMs && segmentEnd > startMs;
    });
  }
  
  getSegmentText(transcript, startMs, endMs) {
    const segments = this.filterByTimeRange(transcript, startMs, endMs);
    return segments.map(s => s.text).join(' ').trim();
  }
  
  getWordCount(transcript, startMs, endMs) {
    const text = this.getSegmentText(transcript, startMs, endMs);
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
  
  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
}
```

## Timestamp Format Handling

### Converting Different Time Formats

```javascript
class TimestampConverter {
  // Convert HH:MM:SS to milliseconds
  static parseTimeString(timeString) {
    const parts = timeString.split(':').map(Number);
    let totalMs = 0;
    
    if (parts.length === 2) {
      // MM:SS format
      totalMs = (parts[0] * 60 + parts[1]) * 1000;
    } else if (parts.length === 3) {
      // HH:MM:SS format
      totalMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    }
    
    return totalMs;
  }
  
  // Convert milliseconds to HH:MM:SS.mmm
  static formatTimestamp(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }
  
  // Validate and clean timestamp data
  static validateTimestamp(timestamp) {
    if (typeof timestamp !== 'number' || timestamp < 0 || !Number.isFinite(timestamp)) {
      return null;
    }
    return timestamp;
  }
}
```

## Next.js Integration Patterns

### API Route Implementation (App Router)

```typescript
// app/api/transcript/segments/route.ts
import { Supadata, SupadataError } from '@supadata/js';
import { NextRequest, NextResponse } from 'next/server';

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY!
});

export async function POST(request: NextRequest) {
  try {
    const { 
      videoUrl, 
      segments, 
      language = 'en' 
    } = await request.json();
    
    // Validate input
    if (!videoUrl || !segments || !Array.isArray(segments)) {
      return NextResponse.json(
        { error: 'Missing required fields: videoUrl, segments' },
        { status: 400 }
      );
    }
    
    // Get full transcript
    const transcript = await supadata.transcript({
      url: videoUrl,
      lang: language,
      text: false // Get timestamped chunks
    });
    
    // Extract specified segments
    const extractor = new TranscriptSegmentExtractor();
    const extractedSegments = segments.map(segment => {
      const startMs = segment.startTime * 1000; // Convert to milliseconds
      const endMs = segment.endTime * 1000;
      
      return {
        id: segment.id,
        label: segment.label,
        text: extractor.getSegmentText(transcript, startMs, endMs),
        startTime: segment.startTime,
        endTime: segment.endTime,
        wordCount: extractor.getWordCount(transcript, startMs, endMs)
      };
    });
    
    return NextResponse.json({
      success: true,
      videoUrl,
      segments: extractedSegments,
      language: transcript.lang
    });
    
  } catch (error) {
    console.error('Transcript extraction error:', error);
    
    if (error instanceof SupadataError) {
      return NextResponse.json({
        error: error.error,
        message: error.message,
        details: error.details
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}
```

### Server Component with Caching

```typescript
// app/transcript/[videoId]/page.tsx
import { unstable_cache } from 'next/cache';
import { Supadata } from '@supadata/js';

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY!
});

const getCachedTranscript = unstable_cache(
  async (videoId: string, language: string = 'en') => {
    return await supadata.transcript({
      videoId,
      lang: language,
      text: false
    });
  },
  ['transcript-cache'],
  {
    tags: ['transcript'],
    revalidate: 3600 // Cache for 1 hour
  }
);

interface PageProps {
  params: { videoId: string };
  searchParams: { 
    start?: string; 
    end?: string; 
    lang?: string; 
  };
}

export default async function TranscriptPage({ 
  params, 
  searchParams 
}: PageProps) {
  const { videoId } = params;
  const startTime = parseInt(searchParams.start || '0');
  const endTime = parseInt(searchParams.end || '0');
  const language = searchParams.lang || 'en';
  
  try {
    const transcript = await getCachedTranscript(videoId, language);
    
    let displayContent = transcript;
    
    // Filter by time range if specified
    if (startTime > 0 || endTime > 0) {
      const extractor = new TranscriptSegmentExtractor();
      displayContent = {
        ...transcript,
        content: extractor.filterByTimeRange(
          transcript,
          startTime * 1000,
          endTime * 1000
        )
      };
    }
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          Video Transcript
          {(startTime > 0 || endTime > 0) && (
            <span className="text-lg text-gray-600 ml-2">
              ({startTime}s - {endTime}s)
            </span>
          )}
        </h1>
        
        <TranscriptDisplay 
          transcript={displayContent}
          showTimestamps={true}
        />
      </div>
    );
    
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Transcript
        </h1>
        <p className="text-gray-700">
          Failed to load transcript for video {videoId}
        </p>
      </div>
    );
  }
}
```

### Client-Side Hook for Real-Time Processing

```typescript
// hooks/useTranscriptSegments.ts
'use client';

import { useState, useCallback } from 'react';

interface SegmentRequest {
  videoUrl: string;
  segments: Array<{
    id: string;
    label: string;
    startTime: number;
    endTime: number;
  }>;
  language?: string;
}

export function useTranscriptSegments() {
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const extractSegments = useCallback(async (request: SegmentRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/transcript/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to extract segments');
      }
      
      const data = await response.json();
      setSegments(data.segments);
      return data.segments;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    loading,
    segments,
    error,
    extractSegments
  };
}
```

## Robust Error Handling

### Comprehensive Error Management

```javascript
class RobustTranscriptExtractor {
  constructor(apiKey, options = {}) {
    this.supadata = new Supadata({ apiKey });
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
  }
  
  async extractWithErrorHandling(videoInput, timeRange = null) {
    const startTime = Date.now();
    
    try {
      // Step 1: Validate and normalize input
      const videoId = this.validateVideoInput(videoInput);
      
      // Step 2: Extract transcript with retry logic
      const transcript = await this.executeWithRetry(() =>
        this.supadata.transcript({
          videoId,
          lang: 'en',
          text: false
        })
      );
      
      // Step 3: Process and validate data
      const processedTranscript = this.validateTranscriptData(transcript);
      
      // Step 4: Extract time range if specified
      let result = processedTranscript;
      if (timeRange) {
        result = this.extractTimeSegment(processedTranscript, timeRange);
      }
      
      return {
        success: true,
        data: result,
        metadata: {
          videoId,
          processingTime: Date.now() - startTime,
          hasTimestamps: Array.isArray(result.content),
          segmentCount: Array.isArray(result.content) ? result.content.length : 0
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          type: this.classifyError(error),
          message: error.message,
          retryable: this.isRetryableError(error),
          processingTime: Date.now() - startTime
        }
      };
    }
  }
  
  validateVideoInput(input) {
    if (!input || typeof input !== 'string') {
      throw new Error('Video input must be a valid string');
    }
    
    // Extract video ID from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^[a-zA-Z0-9_-]{11}$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    
    throw new Error('Invalid YouTube URL or video ID format');
  }
  
  validateTranscriptData(transcript) {
    if (!transcript || !transcript.content) {
      throw new Error('No transcript content available');
    }
    
    if (Array.isArray(transcript.content)) {
      // Validate timestamped chunks
      return {
        ...transcript,
        content: transcript.content.filter(chunk => 
          chunk.text && 
          typeof chunk.offset === 'number' && 
          typeof chunk.duration === 'number'
        )
      };
    }
    
    return transcript;
  }
  
  async executeWithRetry(operation) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (!this.isRetryableError(error) || attempt === this.maxRetries) {
          throw error;
        }
        
        const delay = this.baseDelay * Math.pow(2, attempt - 1);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }
  
  isRetryableError(error) {
    return error.status >= 500 || 
           error.status === 429 ||
           error.message.includes('timeout') ||
           error.message.includes('network');
  }
  
  classifyError(error) {
    if (error instanceof SupadataError) {
      return `SUPADATA_${error.error.toUpperCase().replace('-', '_')}`;
    }
    if (error.message.includes('Invalid')) return 'INVALID_INPUT';
    if (error.status === 404) return 'VIDEO_NOT_FOUND';
    if (error.status === 403) return 'ACCESS_FORBIDDEN';
    return 'UNKNOWN_ERROR';
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Common Error Scenarios and Solutions

**Missing Transcripts:**
```javascript
// Handle cases where transcripts are unavailable
function handleMissingTranscript(videoId) {
  return {
    videoId,
    transcript: null,
    error: 'TRANSCRIPT_NOT_AVAILABLE',
    suggestions: [
      'Check if captions are enabled for this video',
      'Try accessing the video directly on YouTube',
      'Contact the video creator about adding captions'
    ],
    fallback: {
      useManualTranscription: true,
      estimatedCost: '$0.10 per minute'
    }
  };
}
```

**Imprecise Timestamps:**
```javascript
// Handle cases with poor timestamp precision
function handleImpreciseTimestamps(transcript, targetSegment) {
  const segments = transcript.content;
  
  // Look for segments within a buffer zone
  const bufferMs = 5000; // 5 second buffer
  const expandedStart = Math.max(0, targetSegment.start - bufferMs);
  const expandedEnd = targetSegment.end + bufferMs;
  
  const candidateSegments = segments.filter(segment => {
    return segment.offset >= expandedStart && 
           (segment.offset + segment.duration) <= expandedEnd;
  });
  
  return {
    originalSegmentCount: segments.length,
    expandedSegmentCount: candidateSegments.length,
    confidence: candidateSegments.length > 0 ? 'medium' : 'low',
    segments: candidateSegments,
    warning: 'Timestamps may not be precise - using expanded time window'
  };
}
```

## Performance Optimization Strategies

### Caching Implementation

```javascript
// Multi-layer caching system
class TranscriptCache {
  constructor() {
    this.memoryCache = new Map();
    this.maxMemoryEntries = 100;
  }
  
  generateCacheKey(videoId, startTime, endTime, language) {
    return `transcript:${videoId}:${startTime}-${endTime}:${language}`;
  }
  
  async get(videoId, startTime, endTime, language = 'en') {
    const cacheKey = this.generateCacheKey(videoId, startTime, endTime, language);
    
    // Check memory cache first
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey);
    }
    
    // Check persistent cache (Redis/Database)
    const cached = await this.getPersistentCache(cacheKey);
    if (cached) {
      // Store in memory cache for faster access
      this.setMemoryCache(cacheKey, cached);
      return cached;
    }
    
    return null;
  }
  
  async set(videoId, startTime, endTime, language, data) {
    const cacheKey = this.generateCacheKey(videoId, startTime, endTime, language);
    
    // Store in both memory and persistent cache
    this.setMemoryCache(cacheKey, data);
    await this.setPersistentCache(cacheKey, data, 3600); // 1 hour TTL
  }
  
  setMemoryCache(key, data) {
    // Implement LRU eviction
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    
    this.memoryCache.set(key, data);
  }
}
```

### Batch Processing for Multiple Segments

```javascript
// Efficient batch processing
async function processBatchSegments(videoId, segments) {
  // Get full transcript once
  const fullTranscript = await supadata.transcript({
    videoId,
    text: false
  });
  
  // Process all segments from the same transcript
  return segments.map(segment => {
    const startMs = segment.startTime * 1000;
    const endMs = segment.endTime * 1000;
    
    const relevantChunks = fullTranscript.content.filter(chunk => {
      const chunkStart = chunk.offset;
      const chunkEnd = chunk.offset + chunk.duration;
      return chunkStart < endMs && chunkEnd > startMs;
    });
    
    return {
      id: segment.id,
      label: segment.label,
      text: relevantChunks.map(chunk => chunk.text).join(' '),
      chunks: relevantChunks,
      metadata: {
        startTime: segment.startTime,
        endTime: segment.endTime,
        chunkCount: relevantChunks.length,
        wordCount: relevantChunks.map(c => c.text).join(' ').split(' ').length
      }
    };
  });
}
```

## Limitations and Considerations

### API Rate Limits and Pricing

**Supadata.ai Rate Limits:**
- **Basic Plan**: 1 request/second, 100 credits/month
- **Pro Plan**: 10 requests/second, 1,000 credits/month  
- **Scale Plan**: 50 requests/second, 5,000 credits/month

**Cost Optimization:**
- Cache frequently accessed segments
- Batch process multiple segments from the same video
- Use appropriate time granularity (avoid over-segmentation)

### Transcript Quality Considerations

**Auto-Generated vs Manual Captions:**
- Auto-generated captions may have accuracy issues
- Timestamp precision varies by video type and quality
- Manual captions provide better accuracy but aren't always available

**Content Type Limitations:**
- Music videos often lack meaningful transcripts
- Videos with heavy background noise may have poor transcript quality
- Multiple speakers can cause attribution issues

### Best Practices for Production

1. **Always implement comprehensive error handling** for network failures and missing transcripts
2. **Cache transcript data** to reduce API calls and improve performance
3. **Validate timestamp data** before processing to handle malformed responses
4. **Use appropriate time buffers** when extracting segments to account for imprecise timestamps
5. **Monitor API usage and costs** to stay within rate limits and budget constraints
6. **Implement fallback mechanisms** for cases where Supadata.ai is unavailable
7. **Test with various video types** including different languages, lengths, and content types

This comprehensive implementation guide provides everything needed to build a robust timecode-based transcript extraction system using Supadata.ai with Next.js, including practical code examples, error handling strategies, and performance optimizations for production deployment.