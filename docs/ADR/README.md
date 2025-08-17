# ADR 1: Pivot Admin Architecture from Content Type to Workflow-Based Organization
Date: 2025-01-15
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