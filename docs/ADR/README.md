# Architecture Decision Records (ADRs)

This directory contains all architectural decisions for The Headlines, documenting the evolution from content-type organization to workflow-based architecture with comprehensive asset management.

## Decision History

### ADR 1: Pivot Admin Architecture from Content Type to Workflow-Based Organization
**Date**: 2025-08-17  
**Status**: Accepted

**Problem**: Original admin organized by content type (RSS Sources, Articles) caused conceptual confusion and didn't scale for multiple content creation methods.

**Solution**: Restructured to workflow-based organization with Create and Review sections, each containing tab systems for different content types and approval states.

**Impact**: Major architectural refactor enabling scalable content source addition and clear workflow separation.

---

### ADR 2: Implement Universal Queue Processing with Normalized Source Data  
**Date**: 2025-08-19  
**Status**: Accepted

**Problem**: Different content sources (RSS, Research, YouTube) required different AI processing approaches and lacked admin content review before expensive AI processing.

**Solution**: Two-stage creation process where sources generate content for admin review before universal queue processing with normalized data structure.

**Impact**: Single AI prompt works for all source types, admin controls AI processing costs, scalable pattern for future sources.

---

### ADR 3: Implement Dedicated Image and Prompt Management System with External Storage
**Date**: 2025-08-28  
**Status**: Accepted

**Problem**: Images stored in database causing performance issues, prompts mixed in articles table preventing analytics, no systematic prompt optimization, missing support for custom image uploads.

**Solution**: 
- Dedicated `prompts` and `images` tables with normalized relationships
- Cloudflare Workers R2 bucket for image CDN delivery
- Third admin section (Images) with comprehensive asset management
- Unified Add Image page with context-aware dual-tab interface (Generate/Select)
- Quality rating system and prompt effectiveness tracking
- Support for AI generation, gallery selection, and device uploads

**Impact**: 
- Major performance improvement through CDN delivery
- Comprehensive prompt engineering analytics and optimization
- Unified image workflow supporting multiple creation contexts
- Scalable asset management independent of content workflow
- Enhanced admin capabilities for visual content optimization

---

# ADR 4: Frontend Redesign with Badge-Based Filtering and Enhanced Source Data

**Date**: 2025-01-03  
**Status**: Accepted

## Context

With the backend infrastructure complete (article creation, AI fact-checking, approval system, image gallery), the frontend needed a complete redesign to match the professional nature of an AI-verified news platform. The original "Mo Headlines" branding and traditional navigation structure didn't align with modern news consumption patterns or the platform's credibility goals. Additionally, the source data structure needed enhancement to support the new article page design.

## Problem

1. **Unprofessional Branding**: "Mo Headlines" using personal nickname unsuitable for serious news platform
2. **Complex Categories**: 5 overlapping categories (AI, Startups, Big Tech, Science, Transport) creating confusion
3. **Traditional Navigation**: Standard navbar forcing page changes, breaking reading flow
4. **Generic Design**: Lacked distinctive visual identity for a modern news platform
5. **Poor Mobile Experience**: Desktop-first design not optimized for mobile news consumption
6. **Insufficient Source Data**: Simple URL strings (`aiSources: string[]`) don't provide enough information for meaningful source cards
7. **Lack of Source Transparency**: Users can't quickly understand source authority without clicking through
8. **Inconsistent Fact-Checking**: No enforcement of minimum source requirements

## Decision

Implement a **complete frontend redesign** with new branding, innovative navigation, and enhanced source data structure:

1. **Rebrand to "The Headlines"**: Professional name appropriate for news platform
2. **Simplify to 3 Categories**: Tech & Science, Finance, Policies (merged keywords)
3. **Badge-Based Filtering**: Replace navbar with filter badges on same page
4. **Card Pattern System**: 3-row repeating layout for visual consistency
5. **Typography Hierarchy**: Abhaya Libre font for newspaper aesthetic (desktop)
6. **Mobile-First Approach**: Dedicated mobile components and responsive design
7. **Enhanced Source Structure**: Transform `aiSources` from string array to object array with metadata
8. **Source Requirements**: Enforce 4-10 sources per article for comprehensive fact-checking

## Solution Details

### Badge Filter System
- **Components**: Logo + 4 badges (Recent, Tech & Science, Finance, Policies)
- **Behavior**: Single active badge, filters articles client-side
- **Visual States**:
  - Active: `bg-cyan-950 text-cyan-400`
  - Inactive: `bg-brand-card text-body-greyed-out`
- **URL Params**: Shareable filter states (e.g., `/?filter=tech-science`)

### Article Card Pattern
```
Row 1: Landscape Card (image left, content right)
Row 2: Landscape Card (content left, image right)
Row 3: Portrait Card | Portrait Card | Portrait Card
[Pattern repeats with Load More]
```

### Enhanced Source Data Structure
```typescript
// Before
articles: {
  aiSources: string[]  // Simple URL array
}

// After
articles: {
  aiSources: Array<{
    url: string;       // Full URL for linking
    domain: string;    // Parsed domain (e.g., "techcrunch")
    title: string;     // Article title for display
  }>
}
```

### Updated Perplexity Prompt
```
"Research thoroughly and cite between 4-10 authoritative sources.
For each source, provide:
- url: Complete source URL
- domain: Domain name only (without www or .com)
- title: Full article title from the source"
```

### Article Page Enhancements
- **Responsive Image Placement**: After paragraph 1 (desktop), top (mobile)
- **Source Cards**: Horizontal carousel showing domain name + article title (4-10 cards)
- **Close Navigation**: Return to filtered home state
- **Related Articles**: "More Headlines" in portrait cards

### Design System
- **Primary Color**: cyan-400
- **Badge Active Background**: cyan-950
- **Card Background**: cyan-grey derivative
- **Typography**: Abhaya Libre (headlines, desktop only)

## Impact

### Positive
- **Professional Identity**: "The Headlines" commands respect as news platform
- **Improved UX**: No page reloads, instant filtering, better content discovery
- **Simplified Mental Model**: 3 clear categories vs 5 overlapping ones
- **Mobile Excellence**: Dedicated mobile components and touch-optimized UI
- **Distinctive Design**: Badge filters unique among news sites
- **Better Performance**: Client-side filtering faster than page navigation
- **Source Transparency**: Users can quickly scan source authority and relevance
- **Increased Trust**: 4-10 sources show thorough fact-checking
- **Future-Proof Schema**: Source structure can be extended with more metadata

### Negative
- **Learning Curve**: Badge filtering less familiar than traditional navigation
- **SEO Considerations**: Single-page filtering requires careful implementation
- **Migration Required**: Existing articles need source data transformation
- **Increased Storage**: Source objects require more database space than URL strings

### Mitigation
- Clear visual states for active/inactive badges
- Implement proper meta tags and structured data for SEO
- Add tooltips or first-time user guidance if needed
- Simple migration script to transform existing source data with fallbacks
- Database storage impact minimal with text-only fields

## Implementation Plan

### Phase 0: Data Structure Migration (1 day)
- Update article schema for enhanced sources
- Modify Perplexity prompt for 4-10 sources with metadata
- Create migration script for existing articles
- Test new source structure in admin

### Phase 1: Category Migration (1 day)
- Update to 3 categories with merged keywords
- Migrate existing articles

### Phase 2: Core Frontend (4-5 days)
- Badge filter system
- Article card components (3 types + mobile)
- Article page with enhanced source cards
- Load More functionality

### Phase 3: Polish & Deploy (3 days)
- Profile settings page
- Responsive optimization
- Production deployment

### Phase 4: Admin Updates (2 days, post-launch)
- Responsive sidebar
- Mobile-optimized modals

## Alternatives Considered

1. **Traditional Category Pages**: Would require page loads, slower UX
2. **Dropdown Filters**: Less discoverable, requires extra clicks
3. **Keep 5 Categories**: Too much overlap, harder to navigate
4. **Tabs Instead of Badges**: Implies separate content sections rather than filters
5. **Keep Simple URL Array**: Would require second API call or complex frontend parsing
6. **Source Excerpts**: Considered adding excerpts but would make cards too large
7. **3 Source Minimum**: Too few for credibility; 10+ sources would overwhelm carousel

## References

- Figma designs in `/docs/Design/` folders
- Badge filter pattern inspired by modern content platforms
- Typography choice based on newspaper heritage sites
- Source card design based on news aggregator patterns

## Decision Makers

- Project Owner: Mo
- Design Direction: Based on Figma prototyping
- Technical Validation: Confirmed during planning review
- Source Requirements: Based on journalism standards for fact-checking

## Notes

This redesign positions "The Headlines" as a modern, professional news platform while maintaining excellent performance and user experience. The badge filtering system provides a unique but intuitive navigation pattern that keeps users engaged with content rather than navigating between pages. The enhanced source structure ensures transparency and builds trust through visible fact-checking while keeping the UI clean and scannable.

---

**Next ADR Topic**: Admin interface responsive design strategy

---

## Architectural Evolution

### Phase 1: Content-Type Organization → Workflow-Based Architecture
- **Problem**: Scaling content creation methods
- **Solution**: Create/Review workflow separation
- **Result**: Extensible architecture for multiple source types

### Phase 2: Direct Processing → Universal Queue System  
- **Problem**: Inconsistent AI processing across source types
- **Solution**: Normalized queue with admin review gates
- **Result**: Consistent quality and cost control

### Phase 3: Mixed Concerns → Normalized Asset Management
- **Problem**: Performance, analytics, and workflow limitations
- **Solution**: Dedicated tables, external storage, unified interfaces
- **Result**: Professional asset management with optimization capabilities

### Phase 4: Traditional Navigation → Badge-Based Filtering
- **Problem**: Page-based navigation disrupting reading flow
- **Solution**: Client-side filtering with badge UI
- **Result**: Seamless content discovery without page loads

## Design Principles Established

1. **Workflow Separation**: Clear boundaries between Create, Review, and Images workflows
2. **Data Normalization**: Proper entity separation with foreign key relationships
3. **Context Awareness**: Components adapt behavior based on usage context without duplication
4. **External Integration**: Strategic use of external services (Cloudflare) for specialized capabilities
5. **Analytics First**: Design for data collection and optimization from the beginning
6. **Unified Interfaces**: Shared components that work across multiple contexts
7. **Progressive Enhancement**: Architecture supports future enhancements without breaking changes

## Future Considerations

These ADRs establish patterns for:
- **Additional Content Sources**: Twitter, podcasts, conferences following queue normalization
- **Multi-Model Support**: Image generation beyond DALL-E 3 with model comparison analytics
- **Advanced Analytics**: Automated prompt pattern analysis and recommendation systems
- **Asset Optimization**: Performance monitoring and cost optimization across external services
- **Workflow Extensions**: Additional admin sections following established patterns

---

**Next ADR Topic**: Admin interface responsive design strategy