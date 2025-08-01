# Queue Feature Implementation

## Feature Overview

The Queue feature monitors pending articles awaiting AI processing and fact-checking. It provides real-time visibility into the article processing pipeline with deduplication, filtering, and status tracking capabilities.

## Component Architecture

### Queue Tab (`queue-tab.tsx`)
Main container component for the Queue feature:
- Real-time queue monitoring with article counts
- Queue statistics and performance metrics
- Filter and search controls
- Queue management actions

### Queue Item Card (`queue-item-card.tsx`)
Individual queue article display component:
- Article title, source, and metadata
- Processing status indicators
- Time in queue tracking
- Similarity/deduplication status

### Queue Filters (`queue-filters.tsx`)
Filter and search controls for the queue:
- Category filtering
- Source filtering
- Processing status filtering
- Date range selection
- Search by title/content

### Queue Stats (`queue-stats.tsx`)
Queue performance metrics and statistics:
- Total articles in queue
- Processing rate statistics
- Average time in queue
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
  foundAt: number;
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
- Bulk category reassignment
- Bulk priority adjustment

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
}
```

### Search Functionality
- Full-text search in article titles and descriptions
- Filter by source, category, status
- Date range filtering
- Advanced search with multiple criteria

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