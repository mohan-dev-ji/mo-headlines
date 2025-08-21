# ADR 1: Pivot Admin Architecture from Content Type to Workflow-Based Organization
Date: 2025-08-17
Status: accepted

## Context
- Original admin sidebar organized by content type: "RSS Sources" and "Articles"
- Planning to add manual article creation feature raised question: where does the create button belong?
- Brainstormed YouTube video processing with timecode-based article generation as future feature
- Current architecture conflates content creation (RSS Sources) with content review (Articles)
- Need scalable pattern to add future sources: Twitter threads, podcast transcripts, conference talks
- RSS Sources sidebar item actually creates articles, causing conceptual confusion
- Articles section mixes creation (drafts) with review (pending/approved/rejected)
- Component folder structure doesn't reflect logical workflow separation

## Decision
- Restructure admin from content-type organization to workflow-based organization
- Replace "RSS Sources" and "Articles" sidebar items with "Create" and "Review" sections
- Create section contains tab system: RSS Sources, Research Articles, YouTube Videos, Queue
- Each creation method gets dedicated workspace within Create section
- Queue serves as shared processing pipeline for all creation methods
- Review section purely handles content approval workflow: pending/approved/rejected
- Align component folder structure with new page hierarchy: `/components/admin/create/` and `/components/admin/review/`
- Create and Review sections navigate directly to tab interface (RSS Sources tab default for Create)
- Main admin dashboard remains single overview page for all sections

## Consequences

### Positive
- Clear separation of concerns: Create vs Review workflows
- Scalable architecture for adding new content sources (Twitter, podcasts, conferences)
- Each creation method has dedicated workspace reducing cognitive overhead
- Queue serves all creation methods eliminating duplication
- Component structure mirrors page structure improving developer experience
- Future-proof for YouTube timecode processing and other innovative sources
- Logical workflow: Create → Queue → Process → Review → Approve
- Direct navigation to functional interfaces without intermediate dashboard pages

### Negative
- Major architectural refactor requiring significant file reorganization
- All existing page routes need restructuring (`/admin/rss-sources/` → `/admin/create/rss/`)
- Component imports require updating throughout codebase
- Navigation and breadcrumb systems need rebuilding
- Temporary disruption during migration period
- Risk of breaking existing RSS functionality during transition

### Implementation Impact
- Move `/app/admin/rss-sources/` to `/app/admin/create/` (default to RSS Sources tab)
- Restructure `/components/admin/rss-management/` to `/components/admin/create/rss/`
- Establish `/components/admin/create/shared/` for queue and batch processing
- Future manual and YouTube creation modules follow same pattern
- Review section becomes pure content approval interface with tab system
- Main dashboard remains centralized overview for all admin sections

# ADR 2: Implement Universal Queue Processing with Normalized Source Data
Date: 2025-08-19
Status: accepted

## Context
- RSS sources originally created articles directly, bypassing admin review of source content
- Planning Research and YouTube sources revealed need for different content creation patterns
- AI processing required different data structures for each source type
- Need single AI prompt that works consistently across all content sources
- Manual research articles need title/URL input with research concept
- YouTube videos need transcript extraction with timecode-based content
- Queue processing should be universal while maintaining source-specific creation workflows

## Decision
- Implement two-stage creation process: Source Generation → Queue Processing
- RSS sources find and generate articles for admin review before queue addition
- Research sources create manual entries for admin review before queue addition
- YouTube sources process videos and create entries for admin review before queue addition
- Universal queue accepts normalized data: title, URL, concept, createSource
- Single AI prompt processes all queue items using normalized fields
- Source-specific articles deleted after queue addition to prevent duplication
- Admin reviews source content before committing to AI processing pipeline

## Consequences

### Positive
- Single AI prompt works for all source types using normalized queue data
- Admin has control over what content enters expensive AI processing
- RSS articles can be reviewed and curated before processing
- Research workflow accommodates manual article creation with context
- YouTube workflow supports timecode-based content extraction
- Scalable pattern for future sources (Twitter, podcasts, conferences)
- Clear separation between content discovery and content processing
- Consistent AI output quality across all source types

### Negative
- Two-step process adds complexity to content creation workflow
- RSS workflow requires additional admin interaction vs. direct processing
- Source tables serve as temporary storage, adding database overhead
- Admin must manage content in both source tables and queue
- Risk of content loss if admin abandons articles between stages

### Implementation Impact
- Modify RSS workflow to generate articles for admin review
- Create universal queue schema with normalized fields (title, URL, concept, createSource)
- Implement source-to-queue migration for all content types
- Update AI processing to use normalized queue data structure
- Build admin interfaces for reviewing source content before queue addition
- Establish cleanup processes for source articles after queue processing