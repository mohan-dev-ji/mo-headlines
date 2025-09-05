# Architecture

## System Overview

Mo Headlines is an AI-verified tech news platform built with a **workflow-based architecture** that separates content creation from editorial review. The system processes articles from multiple sources through a unified pipeline with dedicated asset and prompt management.

### Core Workflow
```
Create Sources → Unified Queue → AI Processing → Editorial Review → Publication
                                      ↓
                  Prompt Generation → Image Creation → Asset Management
```

### Key Architectural Principles
- **Source Agnostic**: Universal queue accepts any content source type
- **Editorial Control**: All AI-generated content requires human approval
- **Workflow Separation**: Create, Review, and Images are distinct admin sections
- **Unified Processing**: Single AI prompt handles all source types
- **Asset Management**: Dedicated image storage and analytics pipeline
- **Data Normalization**: Proper separation of articles, prompts, and images

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
  imageId?: Id<"images">           // Link to selected image
  viewCount: number
  publishedAt?: number
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

### 6. Publication
- Approved articles with images automatically appear on public website
- Images served from Cloudflare CDN for optimal performance
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

## Visual Design Architecture

### Gradient System
/styles/
├── gradients.module.css         # 20 gradient definitions + animations
/lib/
├── gradients.ts                 # Gradient assignment logic
├── color-utils.ts               # Luminance matching utilities

### Typography System
- **Headlines**: Abhaya Libre Medium (Google Fonts, desktop only)
- **Body**: System font stack
- **Responsive**: Different font sizes per breakpoint

### Badge Filter Architecture
- Client-side filtering (no page reload)
- URL parameter sync for shareability
- Single data source with multiple views

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
  - `images.rating` and `images.status` for gallery sorting
  - `images.categoryId` for analytics
  - `prompts.articleId` and `prompts.isUsed` for prompt queries
  - `create_queue.status` for processing
  - `categories.isActive` for RSS filtering
- **CDN Delivery**: Cloudflare Workers for image serving
- **Queue Processing**: Configurable batch sizes, rate limiting compliance
- **Caching**: Static generation for public articles, transcript caching for YouTube processing

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
- **Analytics**: Performance dashboards, content insights, user engagement

### Migration Path
- Current architecture supports adding new source types without breaking changes
- Queue system designed for enhanced processing capabilities
- Component boundaries allow incremental feature additions
- Image management system ready for multi-model support
- Normalized data structure enables advanced analytics and reporting