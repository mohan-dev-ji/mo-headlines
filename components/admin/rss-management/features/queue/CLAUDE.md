# Queue Feature Implementation

## Feature Overview

The Queue feature monitors pending articles awaiting AI processing and fact-checking. It provides real-time visibility into the article processing pipeline with deduplication, filtering, and status tracking capabilities.

## Component Architecture

### Queue Tab (`queue-tab.tsx`)
Main container component for the Queue feature:
- Real-time queue monitoring via listening to the rss_queue table
- Filter and search controls
- Bulk actions such as Delete all or multiple via checkboxes

### Queue Item Card (`queue-item-card.tsx`)
Individual queue article display component:
- Article title, excerpt, URL, Source (use producerId to get producer: name), published at (from producer table) and status (waiting or processing)
- Processing status indicators
- Similarity/deduplication status

### Queue Filters (`queue-filters.tsx`)
Filter and earch by title/content
- type words that are in the title or description to get results  
Filter and search controls for the queue:
- Category filtering
- Source filtering
- Processing status filtering
- Most recently published
Bulk Action:
- Delete all
- Delete multiple via checkbox

### Queue Stats (`queue-stats.tsx`)
Queue performance metrics and statistics:
- Total articles in queue
- Number processed today
- Deduplication effectiveness metrics

## Data Management

### Queue Article Structure
```typescript
interface QueueArticle {
  _id: Id<"pending_articles">;
  title: string;
  url: string;
  sourceId: Id<"rss_sources">;
  category: string;
  description: string;
  publishedAt: number;
  processed: boolean;
  isProcessing: boolean;
  processedAt?: number;
  similarityHash: string;
}
```

### Queue Statistics
```typescript
interface QueueStatistics {
  totalPending: number;
  processing: number;
  processed: number;
  averageProcessingTime: number;
  duplicatesDetected: number;
  categoryBreakdown: Record<string, number>;
}
```

## Queue Item Display

### Article Card Layout
```
┌─────────────────────────────────────────────────────┐
│ Article Title                           │ Status    │
│ Source: TechCrunch AI                  │   ⏳      │
│ Category: AI & ML                      │ Pending   │
│ Added: 5 min ago                       │           │
│ Similarity: 85% match detected         │           │
└─────────────────────────────────────────────────────┘
```

### Status Indicators
- ⏳ **Pending:** Waiting for processing
- ⚡ **Processing:** Currently being processed
- ✅ **Completed:** Successfully processed
- ❌ **Failed:** Processing failed
- 🔄 **Duplicate:** Similar article already processed

## Deduplication System

### Similarity Hash Generation
```typescript
// Generate similarity hash from article title
function generateSimilarityHash(title: string): string {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(' ')
    .filter(word => !commonWords.includes(word))
    .sort()
    .join('-');
    
  return cleanTitle;
}
```

### Duplicate Detection
- Compare similarity hashes of incoming articles
- Flag potential duplicates for review
- Prevent duplicate processing to save API costs
- Show duplicate detection in queue display

## Real-time Monitoring

### Live Updates
- Queue count updates as articles added/removed
- Processing status changes in real-time
- New articles appear immediately
- Completed articles move to processed state

### Performance Metrics
- Articles processed per hour
- Average time from queue to completion
- Processing success rate
- API cost savings from deduplication

## Queue Management Actions

### Bulk Operations
- Select multiple articles for bulk actions
- Bulk delete or reprocess

### Individual Actions
- Manual processing trigger
- Edit article metadata
- Remove from queue
- Mark as duplicate

## Integration Points

### Producer Integration
- Receives articles from active producers
- Shows which producer contributed each article
- Producer status affects queue population
- Queue feedback to producer performance

### Consumer Integration
- Articles batched for consumer processing
- Processing status updates from consumer
- Batch completion updates queue state
- Failed processing returns articles to queue

### Backend Integration
- **Get Queue:** `api.rss_queue.getPending`
- **Get Statistics:** `api.rss_queue.getStats`
- **Update Status:** `api.rss_queue.updateStatus`
- **Bulk Actions:** `api.rss_queue.bulkUpdate`

## Search and Sorting Strategy

### Data Architecture Analysis

**Current System:**
- Queue data stored in Convex `rss_queue` table
- Frontend uses reactive queries: `useQuery(api.rssQueue.getUnprocessedQueueWithProducers)`
- Data is NOT stored on frontend - fetched real-time from Convex
- Automatic re-renders when database changes

**Data Flow:**
```
Convex Database → Reactive Query → React Component State → UI
```

### Sorting Strategy (Hybrid Approach)

#### Phase 1: Frontend Sorting (Current Implementation)
**Recommended for immediate implementation**

**Pros:**
- No additional backend queries needed
- Instant sorting (no network delay)
- Works with existing data architecture
- Simple to implement for current scale

**Implementation:**
```typescript
const sortedItems = useMemo(() => {
  if (!queueItems) return []
  
  return [...queueItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest': 
        return b.createdAt - a.createdAt
      case 'oldest': 
        return a.createdAt - b.createdAt
      case 'title': 
        return a.title.localeCompare(b.title)
      case 'source': 
        return (a.producer?.name || '').localeCompare(b.producer?.name || '')
      case 'published':
        return b.publishedAt - a.publishedAt
      default: 
        return 0
    }
  })
}, [queueItems, sortBy])
```

**Sort Options:**
- **Newest**: Most recently added to queue
- **Oldest**: Earliest added to queue  
- **Title A-Z**: Alphabetical by article title
- **Source**: Alphabetical by producer name
- **Published**: Most recently published articles first

#### Phase 2: Backend Sorting (Future Migration)
**When queue grows large (1000+ items)**

```typescript
// Future Convex query for backend sorting
export const getQueueSorted = query({
  args: { 
    sortBy: v.union(
      v.literal("newest"), 
      v.literal("oldest"), 
      v.literal("title"), 
      v.literal("source")
    )
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("rss_queue")
      .withIndex("by_processed", (q) => q.eq("processed", false))
    
    switch (args.sortBy) {
      case 'newest':
        return await query.order("desc", "createdAt").collect()
      case 'oldest': 
        return await query.order("asc", "createdAt").collect()
      case 'title':
      case 'source':
        // Requires different indexing strategy
        const items = await query.collect()
        return items.sort(/* sorting logic */)
    }
  }
})
```

### Search Strategy (Backend Filtering)

**Recommended: Backend search queries**

**Why Backend Search:**
- Search across ALL data (not just loaded items)
- Database filtering more efficient than client-side
- Supports partial matching and case-insensitive search
- Real-time search as user types

**Implementation:**
```typescript
// Convex search query
export const searchQueue = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm.trim()) {
      return await ctx.db.query("rss_queue")
        .withIndex("by_processed", (q) => q.eq("processed", false))
        .order("desc", "createdAt")
        .take(args.limit || 50)
    }
    
    const allItems = await ctx.db.query("rss_queue")
      .withIndex("by_processed", (q) => q.eq("processed", false))
      .collect()
    
    const searchLower = args.searchTerm.toLowerCase()
    
    return allItems.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower)
    ).slice(0, args.limit || 50)
  }
})
```

**Frontend Search Integration:**
```typescript
// Debounced search implementation
const [searchTerm, setSearchTerm] = useState('')
const [debouncedSearch, setDebouncedSearch] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm)
  }, 300)
  
  return () => clearTimeout(timer)
}, [searchTerm])

// Use search query when there's a search term
const queueItems = useQuery(
  debouncedSearch 
    ? api.rssQueue.searchQueue 
    : api.rssQueue.getUnprocessedQueueWithProducers,
  debouncedSearch ? { searchTerm: debouncedSearch } : undefined
)
```

### Performance Considerations

**Current Scale (< 1000 items):**
- Frontend sorting: ✅ Optimal
- Backend search: ✅ Necessary for comprehensive search
- No pagination needed yet

**Future Scale (1000+ items):**
- Backend sorting: ✅ Required for performance
- Pagination: ✅ Required
- Indexes: ✅ Required for title/source sorting
- Virtualized rendering: ✅ Required for large lists

### Migration Path

**Step 1 (Current):** Frontend sorting + Backend search
**Step 2 (Growth):** Add pagination when queue > 500 items  
**Step 3 (Scale):** Move to backend sorting when > 1000 items
**Step 4 (Optimization):** Add database indexes for complex sorting

This hybrid approach provides the best balance of:
- ✅ Simple implementation
- ✅ Instant user feedback  
- ✅ Comprehensive search capabilities
- ✅ Future scalability

## Filtering and Search

### Filter Options
```typescript
interface QueueFilters {
  category?: string;
  sourceId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  showDuplicates?: boolean;
  sortBy?: 'newest' | 'oldest' | 'title' | 'source' | 'published';
}
```

### Search Functionality
- Real-time search with 300ms debounce
- Full-text search in article titles and descriptions
- Backend filtering for comprehensive results
- Clear search functionality
- Search result count display

## User Workflows

### Monitor Queue Status
1. View real-time queue statistics
2. See pending articles with status indicators
3. Monitor processing progress
4. Review completed articles

### Manage Queue Items
1. Filter and search for specific articles
2. Review duplicate detection results
3. Manually trigger processing for priority items
4. Remove unwanted articles from queue

### Analyze Performance
1. View queue statistics and metrics
2. Monitor processing efficiency
3. Identify bottlenecks or issues
4. Track deduplication effectiveness

## Error Handling

### Processing Failures
- Clear indication of failed articles
- Retry mechanisms for temporary failures
- Error logging and admin notifications
- Failed articles remain in queue for retry

### Queue Overflow
- Maximum queue size limits
- Automatic cleanup of old processed articles
- Priority system for important articles
- Admin alerts for queue capacity issues

## Performance Optimization

### Efficient Rendering
- Virtualized list for large queues
- Pagination for queue item display
- Efficient update cycles for real-time data
- Optimized query patterns

### Memory Management
- Clean up processed articles periodically
- Efficient state management for filters
- Minimize memory footprint for large queues
- Smart caching for frequently accessed data