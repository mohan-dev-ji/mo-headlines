# Queue Feature Implementation

## Feature Overview

The Queue feature monitors pending articles awaiting AI processing and fact-checking. It provides real-time visibility into the article processing pipeline with deduplication, filtering, and status tracking capabilities.

## Component Architecture

### Queue Tab (`queue-tab.tsx`)
Main container component for the Queue feature:
- Real-time queue monitoring via listening to the rss_queue table
- Sort by and search controls
- Bulk actions such as Delete, deduplication and AI processing

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
Bulk Action via checkboxes:
- Delete
- Deduplication
- AI processing

### Queue Stats (`queue-stats.tsx`)
Queue performance metrics and statistics:
- Total articles in queue
- Number processed today
- Deduplication effectiveness metrics

## Queue Item Display

### Article Card Layout
- Title
- Description
- Source (rss producer name)
- Published
- Added
- Rss categories
- View article
- Status

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

## Queue Item Actions

### Bulk Operations
- Select multiple articles for bulk actions
- Bulk delete, process or deduplicate

### Individual Actions
- Process now (to trigger AI sumarizing and fact checking work flow)
- Delete

## AI Processing System
- Process articles individually from the item card or in bulk from the bulk actions in RSS Queue
- API call with prompt is sent to Perplexity AI
- Queue item status is set to Processing
- Perplexity API recieves item(s) with the queue items titles and URLs
- Perplexity uses it's Deep Research mode to find between 3-5 news articles or blogs from reputable sources reporting the same story.
- Perplexity Deep Research finds similarity vectors in the source and research material
- Perplexity writes a well balanced journalistic article on these points
- Perplexity writes a prompt for image generation based on the contents of the article
- Perplexity generates the image
- Perplexity returns the Article title, body, date, image, category, urls of fact checking articles into articles table with a Status of Pending
- Queue item status is set to Processed
- AI generated article appears in the Admin dashboard/articles section/pending tab (this tab monitors the articles table)
- The article can be opened in a preview window to Approve, Edit, Save or Delete
- Once approved the article status is set to Approved where all approved articles appear on the live site.



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