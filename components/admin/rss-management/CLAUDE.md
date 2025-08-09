# RSS Management Section

## Section Overview

The RSS Management section implements a sophisticated producer-consumer architecture that monitors multiple RSS feeds, intelligently filters content by category, and processes articles through AI fact-checking in efficient batches. This system minimizes API costs while maximizing content quality and processing speed.

## Architecture Pattern: Producer-Consumer with Smart Batching

### The Problem We Solved
Traditional RSS processing sends each article individually to AI processing, resulting in:
- High API costs (multiple calls for same story)
- Duplicate processing of same news from different sources  
- Poor context for AI fact-checking
- Rate limiting issues with high-volume feeds

### Our Solution
**Producer-Consumer Pattern with Centralized Queue:**
1. **Producers:** Individual RSS sources monitor feeds independently
2. **Queue:** Centralized storage with deduplication in Convex
3. **Consumer:** Batch processor sends multiple articles in single API call
4. **Result:** 80-90% cost reduction + better AI results

## Three-Tab System Coordination

### Design Reference
**Figma Design:** [https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=162-3549&t=gcwkNYsmt5vOpqhc-4]
- Contains complete visual design for the Three-Tab system
- Shows proper styling, spacing, and visual hierarchy

### Producer Tab (Feature)
- **Purpose:** Create and manage individual RSS sources
- **Key Functionality:**
  - RSS source creation with form validation
  - Producer cards with dual status indicators (Feed Status + Category Status)
  - Real-time monitoring and status updates
  - Manual actions (Edit, Run Now, Delete, Disable)

### Queue Tab (Feature)
- **Purpose:** Monitor pending articles awaiting processing
- **Key Functionality:**
  - Real-time queue monitoring with article counts
  - Article deduplication using similarity hashing
  - Queue filtering and sorting capabilities
  - Processing status tracking
  - Manual "Process Now" functionality

### Batch Processing Tab (Feature)
- **Purpose:** Configure and monitor batch processing
- **Key Functionality:**
  - Batch processing controls (ON/OFF toggle, frequency settings)
  - Terminal-style display with real-time updates
  - Processing status with current article list

## Data Flow Between Features

```
Producer → Queue → Batch Processing
   ↓         ↓            ↓
RSS Feed  Pending   AI Processing
Monitor   Articles  Batch Jobs
```
### Producer to Queue Flow
1. Producer monitors RSS feed on schedule
2. Filters articles by category keywords
3. Adds matching articles to centralized queue
4. Updates status indicators
5. Items in queue can be processed individually

### Queue to Batch Processing Flow
1. Batch Processing checks queue on scheduled intervals
2. Sweeps the whole queue as a batch
3. Sends batch to Perplexity API for processing
4. Marks articles through their status field

## Shared State Management

### Real-time Updates
- All tabs use Convex reactive queries for live data
- Status indicators update automatically across tabs
- Queue counts and processing states sync in real-time


## Component Structure

```
/components/admin/rss-management/
├── CLAUDE.md                           # This file
├── rss-management-tabs.tsx             # Main tab container
├── types.ts                            # Shared RSS types
├── hooks/                              # Shared hooks
│   ├── use-rss-sources.ts
│   ├── use-queue-status.ts
│   └── use-batch-processing.ts
├── features/                           # Individual features
│   ├── producer/                       # Producer feature
│   ├── queue/                          # Queue feature
│   └── consumer/                       # Consumer feature
└── utils/                              # Shared utilities
    ├── rss-parser.ts
    ├── similarity-hash.ts
    └── category-filter.ts
```

## Integration Points

### Backend Integration
- **Convex Functions:** `/convex/rss/` contains all RSS-related backend logic
- **Database Schema:** Defined in `/convex/schema.ts`
- **Real-time Queries:** Using Convex reactive queries

### External APIs
- **Perplexity API:** For AI fact-checking and article synthesis
- **RSS Feeds:** Various external RSS sources

## Testing Strategy

### Integration Testing
- Test complete Producer → Queue → Batch Processing flow
- Verify real-time updates across all tabs
- Test error handling and recovery scenarios

### End-to-end Workflows
- Create Producer → Monitor Queue → Process Articles
- Handle RSS feed failures gracefully
- Test deduplication and batch processing

## Common Patterns

### Status Indicators
Dual status system used across features:
- **Feed Status:** 🟢 Live / 🔴 Not Live
- **Category Status:** 📰 Article Found / 📭 No Articles

### Error Handling
- Graceful degradation for individual RSS sources
- Retry logic for temporary failures
- User notifications for persistent issues

### Performance Optimization
- Batch processing to reduce API costs
- Efficient deduplication using similarity hashing
- Staggered RSS checks to prevent overload