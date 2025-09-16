# Architecture

## System Overview

Mo Headlines is an AI-verified tech news platform built with a **workflow-based architecture** that separates content creation from editorial review. The system processes articles from multiple sources through a unified pipeline with dedicated asset and prompt management, enhanced with calendar-based discovery and efficient pagination.

### Core Workflow
```
Create Sources → Unified Queue → AI Processing → Editorial Review → Publication
                                      ↓
                  Prompt Generation → Image Creation → Asset Management
                                      ↓
                  Calendar Discovery ← Pagination System ← Article Archive
```

### Key Architectural Principles
- **Source Agnostic**: Universal queue accepts any content source type
- **Editorial Control**: All AI-generated content requires human approval
- **Workflow Separation**: Create, Review, and Images are distinct admin sections
- **Unified Processing**: Single AI prompt handles all source types
- **Asset Management**: Dedicated image storage and analytics pipeline
- **Data Normalization**: Proper separation of articles, prompts, and images
- **Temporal Discovery**: Calendar-based article browsing with combined filtering
- **Performance Optimization**: Pagination system handles archive growth efficiently

---

## Data Architecture

### Content Tables

#### Articles (Core Content)
```typescript
articles: {
  _id: Id<"articles">
  title: string
  body: string
  excerpt?: string
  slug: string
  categoryId: Id<"categories">
  status: "pending" | "approved" | "rejected" | "draft"
  createSource: string              // Source attribution
  sourceUrls: Array<{                // Updated from string[] to object array
    url: string                     // Full source URL
    domain: string                  // Parsed domain name (e.g., "techcrunch")
    title: string                   // Source article title (truncated to 2 lines)
  }>
  imageId?: Id<"images">           // Link to selected image
  viewCount: number
  likeCount?: number               // Added: Cached count for performance
  publishedAt?: number             // Critical for calendar filtering and pagination
  updatedAt: number
  authorId?: Id<"users">
}
```

#### Prompts (AI-Generated and Custom)
```typescript
prompts: {
  _id: Id<"prompts">
  articleId: Id<"articles">        // Links to the article
  prompt: string                     // The actual prompt text
  source: "ai-generated" | "custom" | "edited"
  isUsed: boolean                  // Whether this prompt was used for image generation
  editedFrom?: Id<"prompts">       // If edited, links to original prompt
}
```

#### Images (Asset Management)
```typescript
images: {
  _id: Id<"images">
  articleId: Id<"articles">        // Links to the article it was created for
  promptId: Id<"prompts">          // Links to the prompt used for generation
  cloudflareUrl: string            // The CDN URL for serving
  cloudflareKey: string            // Internal key for management
  status: "pending" | "approved" | "rejected" | "unused"
  rating?: number                  // 1-10 quality score
  model: string                    // e.g., "DALL-E 3"
  generationCost?: number          // Track costs if available
  articleTitle: string             // Denormalized for easier querying
  categoryId: Id<"categories">     // Denormalized for analytics
}
```

#### Likes (User Engagement)
```typescript
likes: {
  _id: Id<"likes">
  userId: string                   // Clerk user ID
  articleId: Id<"articles">        // Linked article
  _creationTime: number            // Automatic Convex field
}
```

#### Categories & User Management
```typescript
categories: {
  _id: Id<"categories">
  name: string
  slug: string
  keywords: string[]              // For RSS filtering
  isActive: boolean
}

users: {
  _id: Id<"users">
  clerkId: string
  username?: string
}

comments: {
  _id: Id<"comments">
  articleId: Id<"articles">
  userId: string
  content: string
  isApproved: boolean
}
```

### Content Creation Tables

#### Universal Queue
```typescript
create_queue: {
  _id: Id<"create_queue">
  sourceType: "rss" | "research" | "youtube"
  title: string                   // Normalized across all sources
  url: string                     // Source URL
  concept: string                 // Content context/excerpt
  createSource: string            // Human-readable source attribution
  status: "waiting" | "processing" | "completed" | "failed"
  queuedAt: number
  processedAt?: number
  errorMessage?: string
}
```

#### Source-Specific Tables
```typescript
create_rss: {
  _id: Id<"create_rss">
  categoryId: Id<"categories">
  feedUrl: string
  maxArticles: number
  pollFrequency: number
  matchedArticles: array          // Generated articles for review
}

create_research: {
  _id: Id<"create_research">
  title: string
  url: string
  concept: string
  categoryId: Id<"categories">
}

create_youtube: {
  _id: Id<"create_youtube">
  videoUrl: string
  videoTitle: string
  transcript: string
  categoryId: Id<"categories">
  timecodeStart: number
  timecodeEnd: number
}
```

---

## Processing Pipeline

### 1. Content Discovery & Generation
- **RSS**: Feeds tested, matching articles generated based on category keywords
- **Research**: Manual title/URL input with research concept
- **YouTube**: Video URL processed, transcript extracted using Supadata.ai, timecode-based content extraction

### 2. Admin Review & Queue Addition
- Generated content appears in respective tabs (RSS/Research/YouTube)
- Admin reviews and selects content to add to universal queue
- Source-specific articles deleted after queue addition (prevents duplication)

### 3. AI Processing
- **Unified Prompt**: Single Perplexity API call processes all source types
- **Normalized Input**: Queue provides consistent data structure (title, url, concept, createSource)
- **Quality Output**: Fact-checked articles with embedded citations
- **Source Enrichment**: Each source includes URL, domain, title, and excerpt for transparency
- **Prompt Generation**: AI creates 3 image prompts stored in prompts table
- **Processing Modes**: Individual or batch processing

### 4. Editorial Review
- AI-generated articles appear with `status: "pending"`
- AI-generated prompts appear linked to articles for image generation
- Admin can approve, reject, edit, or save as draft
- Only approved articles become publicly visible

### 5. Image Generation & Management Pipeline
- **Prompt Selection**: Admin chooses from AI-generated prompts or creates custom ones
- **Prompt Editing**: EditPromptModal allows refinement of prompts before generation
- **Generation**: DALL-E 3 API call generates images based on selected/edited prompt
- **Storage**: Images uploaded to Cloudflare Workers bucket for CDN delivery
- **Metadata**: Complete generation data stored in images table with prompt relationships
- **Approval**: Images rated (1-10) and approved/rejected independently of articles

### 6. Publication & Discovery
- Approved articles with images automatically appear on public website
- Images served from Cloudflare CDN for optimal performance
- **Calendar Discovery**: Articles browsable by publication date via desktop calendar widget
- **Mobile Calendar**: Full-screen modal for date-based filtering
- **Combined Filtering**: Date and category filters work together
- **Pagination**: Progressive loading of 10-article chunks with filter persistence
- SEO optimization, social sharing, user engagement features

---

## Component Architecture

### Admin Layout Structure
```
/components/admin/
├── create/
│   ├── rss/                    # RSS-specific components
│   ├── research/               # Research-specific components  
│   ├── youtube/                # YouTube-specific components
│   └── shared/                 # Create workflow utilities
├── review/
│   ├── pending/                # Pending approval
│   ├── approved/               # Published content
│   ├── rejected/               # Declined content
│   ├── drafts/                 # Work in progress
│   └── shared/                 # Review workflow utilities
├── images/
│   ├── gallery/                # Image grid and filtering
│   ├── detail/                 # Individual image pages
│   ├── prompts/                # Prompt editing and management
│   └── shared/                 # Image workflow utilities
└── shared/                     # Cross-workflow components
```

### Public Layout Structure
```
/components/public/
├── home/
│   ├── badge-filter-bar/       # Category filtering with horizontal scroll
│   ├── calendar/               # Desktop calendar widget and mobile modal
│   ├── cards/                  # Article card variants
│   ├── pagination/             # Load more functionality
│   └── layout/                 # 4-column grid management
├── article/                    # Article page components
├── profile/                    # User profile components
└── shared/                     # Cross-page components
```

## Visual Design Architecture

### Typography System
- **Headlines**: Abhaya Libre Medium (Google Fonts, desktop only)
- **Body**: System font stack
- **Responsive**: Different font sizes per breakpoint

### Layout System
- **Desktop**: 4-column grid (3 columns articles + 1 column calendar/ads)
- **Mobile**: Single column with horizontal badge scrolling
- **Responsive Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (1024px+)

### Badge Filter Architecture
- **Desktop**: All badges visible (All, Tech, Science, Finance, Policies)
- **Mobile**: Horizontal scroll with calendar icon as final badge
- **Client-side filtering**: No page reload, URL parameter sync
- **Combined Filtering**: Date + category work together
- **Visual Consistency**: Selected dates use same styling as active badges

### Calendar Integration Architecture
- **Desktop**: Persistent widget in right column
- **Mobile**: Full-screen modal triggered by calendar icon badge
- **Publication Indicators**: Dot system showing article density per day
- **Month Navigation**: Previous/next controls with current month default
- **Brand Consistency**: Selected dates use cyan-400 text, cyan-950 background

### Pagination Architecture
- **Initial Load**: 10 most recent articles
- **Progressive Loading**: Load more button adds 10-article chunks
- **Filter Persistence**: Pagination maintains active date and category filters
- **Pattern Consistency**: 3-row card pattern continues across paginated loads
- **Performance**: Efficient queries regardless of archive size

### Shared Service Boundaries

#### Create Workflow Services
- **Queue Management**: Universal queue operations across all source types
- **Tab System**: Navigation between RSS/Research/YouTube/Queue tabs
- **Status Indicators**: Consistent status display across sources

#### Review Workflow Services  
- **Tab System**: Navigation between Pending/Approved/Rejected/Drafts
- **Article Actions**: Edit, approve, reject, publish operations
- **Prompt Management**: Access to AI-generated prompts for image creation
- **Filtering & Search**: Content discovery within review workflow

#### Images Workflow Services
- **Gallery Management**: Grid display with sorting and filtering capabilities
- **Rating System**: 1-10 quality scoring for prompt effectiveness
- **Status Management**: Approve/reject workflow for generated images
- **Prompt Analytics**: Track prompt source types and effectiveness
- **Metadata Display**: Complete generation and usage analytics

#### Public Discovery Services
- **Calendar Management**: Date-based article filtering and discovery
- **Combined Filtering**: Integration of date and category filter systems
- **Pagination Control**: Progressive content loading with state persistence
- **Archive Access**: Efficient browsing of historical content

#### Cross-Workflow Services
- **Admin Sidebar**: Navigation between Create, Review, and Images sections
- **Form Components**: Consistent form patterns and validation
- **Design System**: Shared styling and component tokens

---

## API Integration

### AI Processing (Perplexity)
- **Model**: `sonar-pro` for research capabilities
- **Universal Prompt**: Handles all source types using normalized queue data
- **Output**: Structured markdown with embedded citations + 3 image prompts
- **Prompt Storage**: AI-generated prompts stored in prompts table linked to articles
- **Error Handling**: Retry logic with failure tracking

### AI Processing (DALL-E 3)
- **Model**: `DALL-E 3` for image generation
- **Prompt Sources**: Selected from prompts table (AI-generated, custom, or edited)
- **Output**: Images uploaded to Cloudflare Workers bucket
- **Metadata Storage**: Complete generation data in images table with prompt relationships
- **Error Handling**: Retry logic with failure tracking

### Cloud Storage (Cloudflare Workers)
- **Image Storage**: Dedicated R2 bucket for generated images
- **CDN Delivery**: Global edge caching for optimal performance
- **Asset Management**: Upload, retrieval, and cleanup operations
- **Cost Optimization**: Efficient storage and bandwidth usage

### YouTube Transcript Extraction (Supadata.ai)
- **Service**: Supadata.ai for YouTube video transcript extraction
- **Features**: Timestamped transcript chunks with precise millisecond timing
- **Processing**: Timecode-based segment extraction for targeted content analysis
- **Output**: Structured transcript data with offset and duration metadata
- **Error Handling**: Comprehensive retry logic with fallback mechanisms for missing transcripts

### External Services
- **RSS Parsing**: Feed validation and article extraction
- **Authentication**: Clerk integration for admin access

---

## Security & Performance

### Authentication & Authorization
- **Admin Access**: Clerk-based authentication
- **Role-Based Permissions**: Create vs Review vs Images workflow access
- **API Security**: Rate limiting, input validation, secure key management

### Performance Optimization
- **Database Indexes**: 
  - `articles.status` for review queries
  - `articles.publishedAt` for calendar and pagination queries
  - `images.rating` and `images.status` for gallery sorting
  - `images.categoryId` for analytics
  - `prompts.articleId` and `prompts.isUsed` for prompt queries
  - `create_queue.status` for processing
  - `categories.isActive` for RSS filtering
- **CDN Delivery**: Cloudflare Workers for image serving
- **Queue Processing**: Configurable batch sizes, rate limiting compliance
- **Caching**: Static generation for public articles, transcript caching for YouTube processing
- **Pagination**: Efficient article loading with combined filter support
- **Calendar Optimization**: Cached publication date aggregation for indicator display

### Animation Performance
- **CSS Animations**: GPU-accelerated gradient transitions
- **Intersection Observer**: Pause off-screen animations
- **Reduced Motion**: Respect user preferences
- **Battery Optimization**: Consider mobile battery impact
- **Frame Rate**: Target 60fps for smooth animations

### Scalability Considerations
- **Horizontal Scaling**: Queue processing can move to background workers
- **Source Extensibility**: Plugin architecture for new content types
- **Asset Management**: Cloudflare Workers handles image scaling automatically
- **Data Relationships**: Normalized structure supports complex queries and analytics
- **Archive Growth**: Pagination system handles unlimited article growth
- **Calendar Performance**: Efficient date-based queries with proper indexing
- **Monitoring**: Processing metrics, engagement tracking, error monitoring

---

## Future Architecture

### Planned Extensions
- **Additional Sources**: Twitter threads, podcast transcripts, conference talks
- **Enhanced AI**: Multi-model processing, quality scoring, duplicate detection
- **Advanced Queue**: Priority processing, scheduling, bulk operations
- **Prompt Library**: Template system for reusable prompt patterns
- **Image Analytics**: Automated prompt pattern analysis, success rate metrics
- **Multi-Model Support**: Integration with additional image generation services
- **Calendar Enhancements**: Editorial calendar, content gap analysis, publishing trends
- **Advanced Pagination**: Infinite scroll options, custom page sizes
- **Analytics**: Performance dashboards, content insights, user engagement, calendar usage metrics

### Migration Path
- Current architecture supports adding new source types without breaking changes
- Queue system designed for enhanced processing capabilities
- Component boundaries allow incremental feature additions
- Image management system ready for multi-model support
- Normalized data structure enables advanced analytics and reporting
- Calendar system foundation supports editorial and analytics extensions
- Pagination architecture scales with archive growth and new filtering dimensions