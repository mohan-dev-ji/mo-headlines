# RSS Source Management & Processing Pipeline

## Overview

The RSS Source Management system is a sophisticated producer-consumer architecture that monitors multiple RSS feeds, intelligently filters content by category, and processes articles through AI fact-checking in efficient batches. This system is designed to minimize API costs while maximizing content quality and processing speed.

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

## Core Components

### 1. RSS Producers (Feed Monitors)

**Purpose:** Monitor individual RSS feeds on customizable schedules

**Key Features:**
- Independent polling schedules per RSS source
- Category-based article filtering with database-stored keywords
- Automatic feed validation and error handling
- Smart content extraction using rss-parser
- Dual status indicators (Feed Status + Category Status)

**Process Flow:**
1. Parse RSS feed using rss-parser to validate feed availability
2. Update Feed Status: Live (feed accessible) or Not Live (feed failed)
3. If Feed = Live: Retrieve category keywords from database and filter articles
4. Update Category Status: Found (article matches any keyword) or Not Found (no matches)
5. If Category = Found: Add first matching article to Convex queue
6. Update RSS source with dual status indicators for admin visibility

**Category Filtering Logic:**
```typescript
// Enhanced filtering with database-stored keywords
const categoryData = await ctx.runQuery(api.categories.getByCategorySlug, {
  slug: source.selectedCategory
});

const relevantArticles = feed.items.filter(item => {
  const searchText = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
  return categoryData.keywords.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );
});
```

**Implementation:**
```typescript
// RSS Producer with dual status checking
export const processIndividualRssSource = internalAction({
  args: { sourceId: v.id("rss_sources") },
  handler: async (ctx, { sourceId }) => {
    try {
      console.log(`🔍 Producer: Checking RSS source ${sourceId}`);
      
      const source = await ctx.runQuery(internal.rss_sources.getById, { id: sourceId });
      if (!source?.isActive) return;

      // STEP 1: Test RSS feed accessibility
      const Parser = require('rss-parser');
      const parser = new Parser();
      
      try {
        const feed = await parser.parseURL(source.url);
        
        // Feed is accessible - update to Live status
        await ctx.runMutation(internal.rss_sources.updateFeedStatus, {
          sourceId,
          feedStatus: "live"
        });
        
        // STEP 2: Filter by selected category
        const categoryData = await ctx.runQuery(api.categories.getByCategorySlug, {
          slug: source.selectedCategory
        });
        
        const relevantArticles = feed.items.filter(item => {
          const searchText = `${item.title} ${item.contentSnippet || ''}`.toLowerCase();
          return categoryData.keywords.some(keyword => 
            searchText.includes(keyword.toLowerCase())
          );
        });
        
        if (relevantArticles.length > 0) {
          const article = relevantArticles[0];
          
          // Category match found - update status and add to queue
          await ctx.runMutation(internal.rss_sources.updateCategoryStatus, {
            sourceId,
            categoryStatus: "found",
            articleTitle: article.title,
            articleUrl: article.link
          });
          
          // Add to processing queue
          await ctx.runMutation(internal.rss_queue.addToQueue, {
            title: article.title,
            url: article.link,
            sourceId: sourceId,
            category: source.selectedCategory,
            description: article.contentSnippet || ''
          });
          
          console.log(`📋 Producer: Added "${article.title}" to queue`);
          
        } else {
          // No articles in category - update status
          await ctx.runMutation(internal.rss_sources.updateCategoryStatus, {
            sourceId,
            categoryStatus: "not_found"
          });
          
          console.log(`📭 Producer: No ${source.selectedCategory} articles found`);
        }
        
      } catch (feedError) {
        // RSS feed failed - update to Not Live status
        await ctx.runMutation(internal.rss_sources.updateFeedStatus, {
          sourceId,
          feedStatus: "not_live"
        });
        
        console.log(`🔴 Producer: RSS feed not accessible for ${sourceId}`);
      }
      
    } catch (error) {
      console.error(`❌ Producer error for ${sourceId}:`, error);
      await ctx.runMutation(internal.rss_sources.updateFeedStatus, {
        sourceId,
        feedStatus: "not_live"
      });
    }
  }
});
```

### 2. Centralized Queue System

**Purpose:** Store and manage pending articles with intelligent deduplication

**Database Schema:**
```typescript
// Database schema for batch processing status
batch_status: {
  _id: Id<"batch_status">
  isEnabled: boolean
  frequency: number           // Minutes between batches
  nextBatchTime: number      // Timestamp for next scheduled batch
  lastProcessed: number      // Timestamp of last completed batch
  isProcessing: boolean      // Currently running batch
  createdAt: number
  updatedAt: number
}

// Updated pending_articles for processing state
pending_articles: {
  _id: Id<"pending_articles">
  title: string
  url: string
  sourceId: Id<"rss_sources">
  category: string
  description: string
  foundAt: number
  processed: boolean
  isProcessing: boolean      // Currently being processed in batch
  processedAt?: number
  similarityHash: string
}
```

**Deduplication Logic:**
- Generate similarity hash from article title
- Remove common words (the, a, and, etc.)
- Sort remaining words alphabetically
- Compare hashes to detect duplicate stories
- Reject articles with matching hashes

**Example:**
```typescript
// "OpenAI releases GPT-5" → "gpt5-openai-releases"
// "GPT-5 launched by OpenAI" → "gpt5-launched-openai" 
// Similar hash = duplicate detected
```

### 3. Batch Consumer (AI Processor)

**Purpose:** Process multiple articles efficiently in single API calls

**Scheduling:**
- Runs every 15 minutes via cron job
- Configurable timing based on processing needs
- Manual override capability for urgent processing

**Batch Processing Logic:**
1. Retrieve all unprocessed articles from queue
2. Group articles by category for context
3. Send multiple articles to Perplexity in single API call
4. Parse AI response and create verified articles
5. Mark queue items as processed
6. Update RSS source statuses

**Single API Call Example:**
```json
{
  "messages": [{
    "role": "user",
    "content": "I have 3 articles from the last 15 minutes:
    
    1. 'OpenAI releases GPT-5' - https://techcrunch.com/gpt5
    2. 'Apple M4 benchmarks' - https://arstechnica.com/m4  
    3. 'Meta VR headset' - https://theverge.com/meta-vr
    
    Please fact-check each against 3+ sources and create verified summaries."
  }]
}
```

## RSS Source Configuration

### Enhanced Categories & Keywords System

Each RSS source selects one category, and articles are filtered using all 10 keywords for that category, dramatically improving discovery accuracy compared to single-word matching.

**Available Categories:**

**1. AI & Machine Learning**
- **Slug:** `ai-ml`
- **Keywords:** `artificial intelligence, machine learning, neural network, deep learning, large language model, llm, chatbot, generative ai, computer vision, natural language processing`
- **Best RSS Sources:** TechCrunch AI, The Information AI, AI News, OpenAI Blog

**2. Startups & Funding** 
- **Slug:** `startups-funding`
- **Keywords:** `startup, venture capital, series a, series b, seed funding, ipo, acquisition, merger, unicorn, valuation`
- **Best RSS Sources:** TechCrunch Startups, VentureBeat, Crunchbase News, PitchBook

**3. Big Tech & Platforms**
- **Slug:** `big-tech` 
- **Keywords:** `apple, google, microsoft, amazon, meta, netflix, tesla, nvidia, openai, anthropic`
- **Best RSS Sources:** The Verge, Ars Technica, 9to5Mac, Android Police

**4. Science & Research**
- **Slug:** `science-research`
- **Keywords:** `breakthrough, research, study, discovery, clinical trial, peer review, laboratory, experiment, innovation, scientific`
- **Best RSS Sources:** Science Daily, Nature News, MIT News, Phys.org

**5. Electric Vehicles**
- **Slug:** `electric-vehicles`
- **Keywords:** `electric vehicle, ev, tesla, battery, charging station, autonomous driving, self-driving, electric car, lithium, range anxiety`
- **Best RSS Sources:** Electrek, InsideEVs, CleanTechnica, Tesla News

### Polling Frequencies

**High-Volume Sources (15-30 minutes):**
- Breaking news feeds
- Major tech publications
- High-priority categories

**Medium-Volume Sources (45-60 minutes):**
- Specialized publications
- Category-specific feeds
- Industry blogs

**Low-Volume Sources (2-4 hours):**
- Company blogs
- Research publications
- Weekly summary feeds

## Admin Dashboard Interface

### Tab Structure
The RSS Source Management interface uses three main tabs:
- **Producers Tab:** Create and manage individual RSS sources
- **Queue Tab:** Monitor pending articles awaiting processing
- **Consumer Tab:** Configure and monitor batch processing

### Producers Tab Implementation

**Layout Structure:**
```
┌─────────────────────────────────────────────────────┐
│ RSS Source Management                               │
│ [Producers] [Queue] [Consumer]                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [+ Create New Producer]                             │
│                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ │ Producer    │ │ Producer    │ │ Producer    │     │
│ │ Card 1      │ │ Card 2      │ │ Card 3      │     │
│ └─────────────┘ └─────────────┘ └─────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Create New Producer Flow

**Step 1: Button Trigger**
- **Location:** Top of Producer Tab, above all producer cards
- **Button:** `[+ Create New Producer]` - prominent, primary button styling
- **Action:** Opens Create Producer Modal
- **UI Reference:** [Figma Design - Create Producer Button](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=162-3546&t=Lri9CLLY6kRUhM5D-4)

**Step 2: Create Producer Modal**
Modal form with the following fields:

```typescript
interface CreateProducerForm {
  feedTitle: string;          // Display name for the producer
  feedUrl: string;            // RSS feed URL
  category: string;           // Selected from available categories dropdown
  refreshInterval: number;    // Minutes between checks (15, 30, 45, 60)
}
```

**Form Fields:**
1. **Feed Title** (required)
   - Text input
   - Placeholder: "e.g., TechCrunch AI News"
   - Validation: Max 50 characters

2. **Feed URL** (required)  
   - URL input
   - Placeholder: "https://feeds.example.com/rss"
   - Validation: Valid RSS URL format

3. **Category** (required)
   - Dropdown selection
   - Options: AI & ML, Startups & Funding, Big Tech, Science & Research, Electric Vehicles
   - Shows category slug and keyword count

4. **Refresh Interval** (required)
   - Dropdown selection  
   - Options: 15 minutes, 30 minutes, 45 minutes, 60 minutes
   - Default: 30 minutes

**Modal Actions:**
- **Cancel Button:** Close modal without saving
- **Save Button:** Validate form and create producer
- **UI Reference:** [Figma Design - Create Producer Modal](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=162-4152&t=Lri9CLLY6kRUhM5D-4)

**Step 3: Form Validation & Submission**
```typescript
const validateForm = (data: CreateProducerForm) => {
  const errors: string[] = [];
  
  if (!data.feedTitle.trim()) {
    errors.push("Feed title is required");
  }
  
  if (!isValidURL(data.feedUrl)) {
    errors.push("Please enter a valid RSS URL");
  }
  
  if (!data.category) {
    errors.push("Please select a category");
  }
  
  return errors;
};
```

**Step 4: Producer Creation**
On successful validation:
```typescript
const createProducer = async (formData: CreateProducerForm) => {
  const newProducer = await ctx.runMutation(api.rss_sources.create, {
    name: formData.feedTitle,
    url: formData.feedUrl,
    selectedCategory: formData.category,
    pollFrequency: formData.refreshInterval,
    isActive: true,
    feedStatus: null,        // Will be set on first run
    categoryStatus: null,    // Will be set on first run
    createdAt: Date.now()
  });
  
  // Close modal and refresh producer list
  setModalOpen(false);
  // New producer appears in grid
};
```

### Producer Card Display

**Card Layout Structure:**
```
┌─────────────────────────────────────────────────────┐
│ Producer Details    │ Run Results     │ Actions     │
│ (Left Column)       │ (Middle Column) │ (Right Col) │
│                     │                 │             │
│ • Feed Title        │ Last run:       │     ⋮       │
│ • Feed URL          │ Never           │             │
│ • Category          │                 │ [Dropdown]  │
│ • Refresh: 30min    │ Feed Status:    │             │
│                     │ Not checked     │             │
│                     │                 │             │
│                     │ Category Status:│             │
│                     │ Not checked     │             │
└─────────────────────────────────────────────────────┘
```

**Visual Components:**
- Card-based layout showing each RSS source
- **Dual Status Indicators:**
  - **Feed Status:** 🟢 Live / 🔴 Not Live (RSS feed accessibility)
  - **Category Status:** 📰 Article Found / 📭 No Article in Category
- Current article being processed (if any)
- Last successful check timestamp
- Manual actions via 3-dot dropdown menu
- **UI Reference:** [Figma Design - View new Producer](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=162-3740&t=Lri9CLLY6kRUhM5D-4)

**Status Indicator Logic:**
```
RSS Producer Card Display:
┌─────────────────────────────┐
│ TechCrunch AI Feed          │
│ 🟢 Live  📰 Article Found   │  ← Both indicators green
│ "Apple announces M4 chip"   │
│ Last check: 2 min ago       │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Ars Technica Startups      │
│ 🟢 Live  📭 No Articles     │  ← Feed works, no category match
│ Last check: 5 min ago       │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Broken RSS Feed             │
│ 🔴 Not Live                 │  ← Feed failed, no category check
│ Last check: 10 min ago      │
└─────────────────────────────┘
```

**Producer Card Component Structure:**
```typescript
interface ProducerCardProps {
  producer: {
    _id: Id<"rss_sources">;
    name: string;
    url: string;
    selectedCategory: string;
    pollFrequency: number;
    isActive: boolean;
    feedStatus: "live" | "not_live" | null;
    categoryStatus: "found" | "not_found" | null;
    lastChecked?: number;
    currentArticleTitle?: string;
  };
}

const ProducerCard = ({ producer }: ProducerCardProps) => {
  return (
    <Card className="producer-card">
      {/* Left Column: Producer Details */}
      <div className="producer-details">
        <h3 className="font-semibold">{producer.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{producer.url}</p>
        <div className="category-badge">{producer.selectedCategory}</div>
        <p className="text-xs">Refresh: {producer.pollFrequency}min</p>
      </div>
      
      {/* Middle Column: Run Results */}
      <div className="run-results">
        <div className="result-item">
          <span className="label">Last run:</span>
          <span className="value">{formatLastRun(producer.lastChecked)}</span>
        </div>
        
        <div className="result-item">
          <span className="label">Feed Status:</span>
          <StatusIndicator status={producer.feedStatus} />
        </div>
        
        <div className="result-item">
          <span className="label">Category Status:</span>
          <StatusIndicator status={producer.categoryStatus} />
        </div>
      </div>
      
      {/* Right Column: Actions */}
      <div className="actions">
        <DropdownMenu>
          <DropdownMenuTrigger>⋮</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleEdit(producer._id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRunNow(producer._id)}>
              Run Now
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(producer._id)}>
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDisable(producer._id)}>
              {producer.isActive ? 'Disable' : 'Enable'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
```

**Initial State Display Values**

For newly created producers (before first run):
- **Last run:** "Never"
- **Feed Status:** "Not checked" (with neutral gray indicator)
- **Category Status:** "Not checked" (with neutral gray indicator)
- **Current Article:** Empty/hidden

**Status Indicator Component:**
```typescript
const StatusIndicator = ({ status }: { status: string | null }) => {
  const statusConfig = {
    // Feed Status
    "live": { color: "text-green-500", icon: "🟢", label: "Live" },
    "not_live": { color: "text-red-500", icon: "🔴", label: "Not Live" },
    
    // Category Status  
    "found": { color: "text-green-500", icon: "📰", label: "Article Found" },
    "not_found": { color: "text-yellow-500", icon: "📭", label: "No Articles" },
    
    // Default/Null
    null: { color: "text-gray-500", icon: "⚪", label: "Not checked" }
  };
  
  const config = statusConfig[status] || statusConfig[null];
  
  return (
    <span className={`flex items-center gap-1 text-sm ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
```

**Interactive Features:**
- Edit RSS source settings (URL, category, frequency)
- Run Now: Manual trigger for immediate RSS check
- Delete: Remove RSS source with confirmation
- Disable/Enable: Toggle active status without deletion

**Status Indicators:**
- 🔍 **Checking:** RSS feed currently being parsed and category filtered
- 📋 **Queued:** Article found in category and added to processing queue  
- ⚡ **Processing:** AI fact-checking in progress (batch consumer running)
- ✅ **Completed:** Latest article processed successfully
- ❌ **Error:** RSS feed or processing failure

**Feed Status (Primary):**
- 🟢 **Live:** RSS feed accessible and parseable
- 🔴 **Not Live:** RSS feed failed or inaccessible

**Category Status (Secondary - only shown if Feed = Live):**
- 📰 **Article Found:** At least one article matches selected category
- 📭 **No Article in Category:** Feed is live but no articles match category filter

### Consumer Tab - Batch Processing Interface

**Layout Structure:**
- **Batch Processing Controls** (top section)
- **Terminal Info Display** (bottom section with dark background)

**Batch Processing Controls:**
```typescript
interface BatchProcessingControls {
  enabled: boolean;           // ON/OFF toggle switch
  frequency: number;          // Minutes between batches (15, 30, 45, 60)
  processNow: () => void;     // Manual trigger button
  isProcessing: boolean;      // Disables button, shows spinner
}
```

**Terminal Info Display:**
```typescript
interface TerminalDisplay {
  lastProcessed: string;      // "23 min ago"
  nextBatchIn: string;        // "3 min 42 sec" (real-time countdown)
  queueCount: number;         // "7 articles waiting"
  processingArticles: Array<{
    title: string;
    url: string;
  }>;                         // Currently processing list
}
```

**Terminal Display States:**

*Idle State (batch processing ON):*
```
Last processed: 23 min ago
Next batch in: 3 min 42 sec
7 articles waiting
```

*Processing State:*
```
Last processed: 23 min ago
Next batch in: Processing...
7 articles waiting

Currently processing:
Article Title 1
Article Title 2
Article Title 3
Article Title 4
Article Title 5
```

**Real-Time Updates Required:**
- Countdown timer updates every second
- Queue count updates when articles added/removed
- Processing list updates during batch execution
- Button state changes during processing

### Database Schema for Producer Creation

```typescript
// Updated RSS sources table
rss_sources: {
  _id: Id<"rss_sources">
  name: string
  url: string
  selectedCategory: string    // Category slug for filtering
  pollFrequency: number      // Minutes between checks
  isActive: boolean
  feedStatus: "live" | "not_live" | null    // RSS feed accessibility
  categoryStatus: "found" | "not_found" | null  // Article in category found
  currentArticleTitle?: string
  currentArticleUrl?: string
  lastGeneratedArticleId?: Id<"articles">
  lastChecked?: number
  createdAt: number
  updatedAt?: number
}

// Enhanced categories table with keywords
categories: {
  _id: Id<"categories">
  name: string
  slug: string
  keywords: string[]  // Array of filtering keywords
  isActive: boolean
  createdAt: number
  updatedAt?: number
}
```

**Convex Mutations for Producer Management:**
```typescript
// Create new RSS source
export const createRssSource = mutation({
  args: {
    name: v.string(),
    url: v.string(), 
    selectedCategory: v.string(),
    pollFrequency: v.number()
  },
  handler: async (ctx, args) => {
    const sourceId = await ctx.db.insert("rss_sources", {
      name: args.name,
      url: args.url,
      selectedCategory: args.selectedCategory,
      pollFrequency: args.pollFrequency,
      isActive: true,
      feedStatus: null,           // Will be set on first check
      categoryStatus: null,       // Will be set on first check  
      createdAt: Date.now(),
      lastChecked: null
    });
    
    return sourceId;
  }
});

// Query to get all producers for display
export const getAllRssSources = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rss_sources")
      .order("desc")
      .collect();
  }
});

// Update feed status after RSS check
export const updateFeedStatus = mutation({
  args: {
    sourceId: v.id("rss_sources"),
    feedStatus: v.union(v.literal("live"), v.literal("not_live"))
  },
  handler: async (ctx, { sourceId, feedStatus }) => {
    await ctx.db.patch(sourceId, {
      feedStatus,
      lastChecked: Date.now()
    });
  }
});

// Update category status after filtering
export const updateCategoryStatus = mutation({
  args: {
    sourceId: v.id("rss_sources"),
    categoryStatus: v.union(v.literal("found"), v.literal("not_found")),
    articleTitle: v.optional(v.string()),
    articleUrl: v.optional(v.string())
  },
  handler: async (ctx, { sourceId, categoryStatus, articleTitle, articleUrl }) => {
    await ctx.db.patch(sourceId, {
      categoryStatus,
      currentArticleTitle: articleTitle,
      currentArticleUrl: articleUrl,
      lastChecked: Date.now()
    });
  }
});
```

## Error Handling & Recovery

### RSS Feed Failures

**Common Issues:**
- RSS feed temporarily unavailable
- Malformed XML structure
- Network connectivity problems
- RSS URL changes

**Recovery Mechanisms:**
- Exponential backoff retry logic
- Graceful degradation for individual sources
- Admin notifications for persistent failures
- Automatic RSS URL validation

### API Processing Failures

**Perplexity API Issues:**
- Rate limiting responses
- API service unavailability
- Invalid response formats
- Timeout errors

**Fallback Strategies:**
- Queue preservation during failures
- Individual article processing as backup
- Manual retry capabilities
- Error logging and admin alerts

### Data Integrity Protection

**Queue Management:**
- Prevent duplicate queue entries
- Handle database connectivity issues
- Ensure transactional processing
- Backup and recovery procedures

## Performance Optimization

### Batch Size Optimization

**Dynamic Batch Sizing:**
- Adjust batch size based on API response times
- Category-specific batching for better context
- Maximum batch size limits to prevent timeouts
- Split large batches automatically

### Resource Management

**Memory Optimization:**
- Efficient RSS parsing with streaming
- Queue item cleanup after processing
- Database query optimization
- Connection pooling for external APIs

**Scheduling Optimization:**
- Stagger RSS source checks to prevent overload
- Adaptive polling based on feed update frequency
- Load balancing across processing windows
- Peak hour vs. off-peak scheduling

## Security & Data Privacy

### API Key Management

**Perplexity API Security:**
- Environment variable storage
- Key rotation procedures
- Usage monitoring and alerts
- Rate limiting compliance

### RSS Source Validation

**Feed Security Checks:**
- URL validation and sanitization
- HTTPS enforcement where available
- Malicious content detection
- Source reputation tracking

### Data Handling

**Article Content:**
- Original source attribution
- Content sanitization
- Copyright compliance
- Source URL preservation

## Implementation Checklist

### Database Setup
- [ ] Add `keywords` array field to `categories` table
- [ ] Add `updatedAt` field to `categories` table for keyword management
- [ ] Run enhanced seedCategories script with 5 categories and keywords
- [ ] Add `batch_status` table for processing configuration
- [ ] Add `isProcessing` field to `pending_articles` table  
- [ ] Add `feedStatus` and `categoryStatus` fields to `rss_sources`
- [ ] Add `selectedCategory` field to `rss_sources` (stores category slug)

### Producers Tab Implementation (Current Phase)
- [ ] Create tab structure with Producers, Queue, Consumer tabs
- [ ] Build Producer Tab layout with "Create New Producer" button
- [ ] Implement Create Producer Modal with form validation
- [ ] Add form fields: Feed Title, Feed URL, Category dropdown, Refresh Interval
- [ ] Create producer creation mutation and form submission logic
- [ ] Build Producer Card component with three-column layout
- [ ] Implement dual status indicators (Feed Status + Category Status)
- [ ] Add actions dropdown with Edit, Run Now, Delete, Disable options
- [ ] Set up initial state display for new producers ("Never", "Not checked")
- [ ] Style cards with proper spacing and responsive design

### Component File Structure

**Recommended file organization:**
```
/components/admin/rss-management/
├── rss-source-management.tsx          // Main tab container
├── producer-tab.tsx                   // Producer tab content
├── create-producer-modal.tsx          // Creation modal
├── producer-card.tsx                  // Individual producer card
├── producer-actions-dropdown.tsx      // Actions dropdown menu
└── status-indicator.tsx               // Status display component
```

### RSS Producers (Individual Feed Monitors) - Next Phase
- [ ] Create cron jobs for each RSS source with custom schedules
- [ ] Implement RSS feed accessibility checking (Live/Not Live)
- [ ] Add database query to fetch category keywords by slug
- [ ] Implement enhanced category filtering using all keywords for selected category
- [ ] Update dual status indicators in database
- [ ] Add articles to centralized queue only when any keyword matches

### Centralized Queue System  
- [ ] Implement similarity hashing for deduplication
- [ ] Create queue management mutations (add, remove, mark processed)
- [ ] Add queue status queries for real-time display

### Batch Consumer
- [ ] Create batch processing cron job (configurable frequency)
- [ ] Implement single API call to Perplexity with multiple articles
- [ ] Add processing state management (mark articles as processing)
- [ ] Create verified articles from AI response
- [ ] Update RSS source statuses after processing

### Admin Interface - Additional Features
- [ ] Create Queue tab for monitoring pending articles
- [ ] Create Consumer tab with batch processing controls
- [ ] Implement terminal-style info display with monospace font
- [ ] Add real-time countdown timer (updates every second)
- [ ] Add manual "Process Now" button with spinner states
- [ ] Implement ON/OFF toggle for batch processing
- [ ] Add frequency dropdown (15, 30, 45, 60 minutes)

### Real-Time Features
- [ ] Set up Convex queries for live data updates
- [ ] Implement countdown timer that updates every second  
- [ ] Add queue count real-time updates
- [ ] Show currently processing articles during batch execution
- [ ] Update button states during processing

### Error Handling
- [ ] RSS feed failure handling and retry logic
- [ ] Perplexity API error handling and fallbacks
- [ ] Queue persistence during system failures
- [ ] Admin error notifications and status display

## Claude Code Instructions

When working on this feature:

### Current Phase: Producers Tab UI & Creation Flow

1. **Start with the UI components first** - build the visual structure before adding functionality
2. **Use the existing design system** - follow the established patterns from other admin components  
3. **Focus on the create flow** - get the modal and form working properly before moving to card actions
4. **Mock the data initially** - use sample producer data to build the card layouts
5. **Validate thoroughly** - ensure form validation works before implementing the database mutations

### Implementation Priority

**Phase 1 (Current): UI Setup & Creation Flow**
- [ ] Create Producer Tab layout with create button
- [ ] Build Create Producer Modal with form validation
- [ ] Implement Producer Card display with three-column layout
- [ ] Add producer creation mutation and query
- [ ] Set up actions dropdown (UI only, no functionality yet)

**Phase 2 (Next): Card Functionality**