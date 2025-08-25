# Architecture

## System Overview

Mo Headlines is an AI-verified tech news platform built with a **workflow-based architecture** that separates content creation from editorial review. The system processes articles from multiple sources through a unified pipeline.

### Core Workflow
```
Create Sources → Unified Queue → AI Processing → Editorial Review → Publication
```

### Key Architectural Principles
- **Source Agnostic**: Universal queue accepts any content source type
- **Editorial Control**: All AI-generated content requires human approval
- **Workflow Separation**: Create and Review are distinct admin sections
- **Unified Processing**: Single AI prompt handles all source types

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
  aiSources: string[]              // Fact-checking URLs
  imageStorageId?: Id<"_storage">
  imageGenPrompts: string
  viewCount: number
  publishedAt?: number
  updatedAt: number
  authorId?: Id<"users">
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
- **Processing Modes**: Individual or batch processing

### 4. Editorial Review & Publishing
- AI-generated articles appear with `status: "pending"`
- **Article Preview**: Live article page integration for realistic content review
- **Status Management**: Pending → Approved/Rejected/Draft with instant status updates
- **Editorial Control**: Full article editing capabilities with field-level changes
- **Manual Creation**: Create tab provides empty edit page for hand-written articles
- Only approved articles become publicly visible

### 5. Image Generation Pipeline
- **Access**: Image generation available from article edit pages when no image present
- **Prompt Options**: Choose from AI-generated prompts or create custom prompts
- **Generation**: DALL-E 3 API call generates images based on selected prompt
- **Preview & Iterate**: Generated image displayed for review with regeneration option
- **Save**: Approved images attached to articles, return to edit page

### 6. Publication
- Approved articles with images automatically appear on public website
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
│   ├── create/                 # Manual article creation
│   └── shared/                 # Review workflow utilities
└── shared/                     # Cross-workflow components
```

### Shared Service Boundaries

#### Create Workflow Services
- **Queue Management**: Universal queue operations across all source types
- **Tab System**: Navigation between RSS/Research/YouTube/Queue tabs
- **Status Indicators**: Consistent status display across sources

#### Review Workflow Services  
- **Tab System**: Navigation between Pending/Approved/Rejected/Drafts/Create
- **Article Actions**: Edit, approve, reject, publish operations
- **Preview Integration**: Live article page embedding for realistic review
- **Image Generation**: DALL-E integration within editorial workflow
- **Filtering & Search**: Content discovery within review workflow

#### Cross-Workflow Services
- **Admin Sidebar**: Navigation between Create and Review sections
- **Form Components**: Consistent form patterns and validation
- **Design System**: Shared styling and component tokens

---

## API Integration

### AI Processing (Perplexity)
- **Model**: `sonar-pro` for research capabilities
- **Universal Prompt**: Handles all source types using normalized queue data
- **Output**: Structured markdown with embedded citations
- **Error Handling**: Retry logic with failure tracking

### AI Processing (DALL-E 3)
- **Model**: `DALL-E 3` for image generation
- **Prompt Sources**: AI-generated prompts from Perplexity or user-created prompts
- **Output**: JPEG images, 1024x576 resolution, 16:9 aspect ratio
- **Error Handling**: Retry logic with failure tracking

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
- **Role-Based Permissions**: Create vs Review workflow access
- **API Security**: Rate limiting, input validation, secure key management

### Performance Optimization
- **Database Indexes**: 
  - `articles.status` for review queries
  - `create_queue.status` for processing
  - `categories.isActive` for RSS filtering
- **Queue Processing**: Configurable batch sizes, rate limiting compliance
- **Caching**: Static generation for public articles, transcript caching for YouTube processing

### Scalability Considerations
- **Horizontal Scaling**: Queue processing can move to background workers
- **Source Extensibility**: Plugin architecture for new content types
- **Monitoring**: Processing metrics, engagement tracking, error monitoring

---

## Future Architecture

### Planned Extensions
- **Additional Sources**: Twitter threads, podcast transcripts, conference talks
- **Enhanced AI**: Multi-model processing, quality scoring, duplicate detection
- **Advanced Queue**: Priority processing, scheduling, bulk operations
- **Analytics**: Performance dashboards, content insights, user engagement

### Migration Path
- Current architecture supports adding new source types without breaking changes
- Queue system designed for enhanced processing capabilities
- Component boundaries allow incremental feature additions