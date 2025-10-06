# Architecture

## System Overview

The Headlines is an AI-verified tech news platform with separated content creation and editorial review systems. The architecture supports multiple content sources, AI processing, and asset management with calendar-based discovery and pagination.

### Key Architectural Principles
- **Source Agnostic**: Universal queue accepts any content source type
- **Editorial Control**: All AI-generated content requires human approval
- **Section Separation**: Create, Review, and Images are distinct admin sections
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

## Data Processing

### Content Sources
- **RSS**: Feed parsing and keyword-based article extraction
- **Research**: Manual content input system
- **YouTube**: Video transcript processing via Supadata.ai

### AI Integration
- **Perplexity**: Universal content processing and fact-checking
- **DALL-E 3**: Image generation from prompts
- **Cloudflare**: CDN storage and delivery

### Content States
- **Pending**: Awaiting editorial review
- **Approved**: Published and publicly visible
- **Rejected**: Declined content
- **Draft**: Work in progress

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
- **Body**: Inter
- **Responsive**: Different font sizes per breakpoint

### Layout System
- **Desktop**: 4-column grid (3 columns articles + 1 column calendar/ads)
- **Mobile**: Single column with horizontal badge scrolling
- **Responsive Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (1024px+)

### Pagination Architecture
- **Initial Load**: 10 most recent articles
- **Infinate Scrollling**: In 10-article chunks
- **Filter Persistence**: Pagination maintains active date and category filters
- **Pattern Consistency**: 3-row card pattern continues across paginated loads
- **Performance**: Efficient queries regardless of archive size

### Service Boundaries

#### Admin Services
- **Queue Management**: Universal content processing
- **Tab Navigation**: Section and status navigation
- **Content Operations**: CRUD operations for articles and assets
- **Status Management**: Approval state handling

#### Public Services
- **Content Discovery**: Calendar and category filtering
- **Pagination**: Progressive content loading
- **User Engagement**: Comments and likes

#### Shared Services
- **Authentication**: User and admin access control
- **Form Handling**: Validation and submission
- **Design System**: Consistent UI components

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
- **Features**: Timestamped transcript extraction
- **Processing**: Timecode-based content segments
- **Output**: Structured transcript data
- **Error Handling**: Retry logic for failed extractions

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
- **Database Indexes**: Key indexes on status, creation time, ratings, and categories
- **CDN Delivery**: Cloudflare Workers for image serving
- **Queue Processing**: Batch processing with rate limiting
- **Caching**: Static generation and transcript caching
- **Pagination**: Efficient article loading with filters
- **Calendar**: Cached publication date aggregation


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