# Admin Review Components

## Overview

Review workflow components manage AI-generated articles through a comprehensive editorial process. Components handle four distinct review stages with shared patterns for article preview, editing, and status management.

## Component Structure

### Tab-Specific Components
- **Pending Components**: `PendingTab`, `PendingArticleCard` - Initial review and editorial decisions
- **Approved Components**: `ApprovedTab`, `ApprovedArticleCard` - Published content management
- **Rejected Components**: `RejectedTab`, `RejectedArticleCard` - Declined content archive and recovery
- **Drafts Components**: `DraftsTab`, `DraftArticleCard` - Work-in-progress content development

### Shared Components
- **ReviewCard**: Universal article preview across all tabs
- **ArticlePreview**: Public article page embedded within review interface
- **EditArticleModal**: Comprehensive editing with image generation pipeline
- **FilterSystem**: Shared filtering and sorting across all review tabs

## Shared Review Components

### ReviewCard
- **Purpose**: Universal article preview component used across all tabs
- **Content**: Title, excerpt, source type indicator, generated image
- **Metadata**: Creation time, source origin (RSS/Research/YouTube), processing status
- **Status Borders**: Color-coded borders using status indicator design tokens
- **Actions**: Click to open full article preview with tab-specific options

### ArticlePreview
- **Purpose**: Public article page rendered within review tab interface
- **Display**: Full article content as it appears on public website
- **Integration**: Embedded public page resized for tab interface
- **Actions**: Context-sensitive buttons based on current tab (approve/reject/edit/save)
- **Responsive**: Maintains readability while fitting within admin interface

### EditArticleModal
- **Form Fields**: Title, body content, topics (bold hyperlinks), source URLs
- **Image Pipeline**: Select from 3 AI-generated prompts, generate via Midjourney/DALL-E 3
- **Storage Integration**: Save approved images to Cloudflare Workers storage
- **Validation**: Content format, topic formatting, source URL accessibility
- **Actions**: Save changes, approve, reject, save as draft

### FilterSystem
- **Shared Interface**: Consistent filtering across all review tabs
- **Filter Options**: Title, date, category, source type, processing status
- **Bulk Operations**: Multi-select for batch approve/reject/delete
- **Search**: Text search across article titles and content
- **Sorting**: Chronological, alphabetical, status-based organization

## Pending Tab Components

### PendingTab
- **Purpose**: Container for articles awaiting initial review
- **Data Source**: Articles with "pending" status from Create workflow
- **Layout**: List of ReviewCard components with pending status styling
- **Actions**: Approve, reject, edit, save as draft for each article

### PendingArticleCard
- **Extension**: ReviewCard with pending-specific styling and actions
- **Status Display**: Pending status border color from indicator design tokens
- **Actions**: Full editorial decision options available
- **Source Info**: Clear attribution to RSS/Research/YouTube origin

## Approved Tab Components

### ApprovedTab
- **Purpose**: Management interface for published articles
- **Data Source**: Articles with "approved" status visible on public website
- **Real-time Integration**: Changes immediately reflected on public site
- **Actions**: Edit published content, unpublish articles

### ApprovedArticleCard
- **Extension**: ReviewCard with approved status styling
- **Status Display**: Approved status border color, live publication indicator
- **Actions**: Edit (immediate public updates), unpublish, view on site
- **Publication Order**: Most recently approved articles appear first

## Rejected Tab Components

### RejectedTab
- **Purpose**: Archive interface for declined articles
- **Data Source**: Articles with "rejected" status from editorial review
- **Recovery Options**: Edit and resubmit declined content
- **Cleanup**: Bulk deletion of outdated rejected content

### RejectedArticleCard
- **Extension**: ReviewCard with rejected status styling
- **Status Display**: Rejected status border color from design tokens
- **Actions**: Delete permanently, edit with full status options
- **Recovery Flow**: Edit opens modal with approve/reject/save options

## Drafts Tab Components

### DraftsTab
- **Purpose**: Work-in-progress content development interface
- **Data Source**: Articles with "drafts" status requiring further development
- **Development Workflow**: Iterative editing and collaboration
- **Actions**: Continue editing, direct approval, delete drafts

### DraftArticleCard
- **Extension**: ReviewCard with drafts status styling
- **Status Display**: Drafts status border color, work-in-progress indicators
- **Actions**: Edit (continue development), save, approve, delete
- **Collaboration**: Multiple admin review and input capability

## Image Generation Pipeline

### Generation Workflow
1. **Prompt Selection**: Choose from 3 AI-generated prompts in edit modal
2. **Service Integration**: API calls to Midjourney or DALL-E 3
3. **Preview Interface**: Display generated options for admin selection
4. **Storage Process**: Save approved images to Cloudflare Workers
5. **Article Association**: Link selected image to article for public display

### Modal Integration
- **Prompt Display**: Show all 3 prompts with descriptive text
- **Generation Preview**: Display multiple options per prompt
- **Selection Interface**: Easy approval and rejection of generated images
- **Fallback Options**: Manual image upload if generation fails

## Status Flow Management

### Article Transitions
- **Pending → Approved**: Editorial approval, immediate publication
- **Pending → Rejected**: Quality issues, archive for recovery
- **Pending → Drafts**: Incomplete content, requires development
- **Any Status → Any Status**: Flexible editing allows all transitions

### Real-time Updates
- **Status Synchronization**: Immediate reflection across all tabs
- **Public Site Integration**: Live updates for approved content
- **Processing States**: Clear indicators during status changes

## Shared Patterns

### Design System Integration
- **Status Colors**: Border colors from indicator design tokens (pending/approved/rejected/drafts)
- **Card Layout**: Consistent ReviewCard structure across all tabs
- **Modal Styling**: Brand-card backgrounds with brand-line borders
- **Typography**: Headline-primary and body-primary text colors

### Data Management
- **Convex Integration**: Real-time queries for article lists and status updates
- **Filter State**: Persistent filter settings across tab switches
- **Bulk Operations**: Efficient multi-article processing
- **Error Handling**: Graceful failure management with retry options

### User Experience
- **Tab Navigation**: Consistent interface patterns across all review stages
- **Context Actions**: Tab-appropriate action options for each article
- **Visual Feedback**: Clear status indicators and processing states
- **Workflow Efficiency**: Streamlined editorial decision-making process

## Implementation Guidelines

### Component Development
- **Shared Base**: Use ReviewCard as foundation for all tab-specific cards
- **Tab Variants**: Extend base component with tab-specific styling and actions
- **Status Integration**: Leverage design token colors for consistent status display
- **Modal Reuse**: Single EditArticleModal handles all editing scenarios

### Performance Optimization
- **Conditional Rendering**: Efficient tab switching without full re-renders
- **Bulk Processing**: Optimize multi-article operations
- **Image Handling**: Lazy loading for article images and generation previews
- **Real-time Efficiency**: Smart query updates for status changes