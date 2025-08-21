# Review Workflow Feature

## Overview

The Review Workflow manages all AI-generated articles through a comprehensive editorial process. Articles flow from the Create workflow into a structured review system with four distinct stages, each providing specific actions for content management and quality control.

## Workflow Architecture

### Tab System
- **Pending**: Articles awaiting initial review and editorial decision
- **Approved**: Published articles visible on the public website
- **Rejected**: Articles declined during review process
- **Drafts**: Work-in-progress articles requiring further development

### Universal Article Flow
```
Create Workflow → Pending → (Approved/Rejected/Drafts) → Published/Archived
```

### Shared Components
- **Review Cards**: Universal card component displaying article preview across all tabs
- **Article Preview**: Public article page embedded within review interface
- **Edit Modal**: Comprehensive article editing with image generation pipeline
- **Filter System**: Shared filtering and sorting across all review tabs

## Pending Tab

### Purpose
Initial review interface for AI-generated articles requiring editorial approval or further action.

### Article Reception
- **Automatic Arrival**: Articles appear immediately after AI processing completion
- **Initial Status**: All articles start with "pending" status
- **Source Attribution**: Clear indication of RSS/Research/YouTube origin
- **Processing Metadata**: Creation timestamp, source type, AI processing details

### Review Card Display
- **Article Preview**: Title, excerpt, source type indicator, generated image
- **Metadata Summary**: Creation time, source origin, processing status
- **Quick Actions**: Click to open full article preview with action options
- **Visual Design**: Standard review card layout with pending status indicators

### Article Preview Interface
- **Public Page Simulation**: Actual article page rendered within review tab
- **Full Content Display**: Complete article with formatting, topics, sources
- **Action Buttons**: Edit, Approve, Reject, Save as Draft options
- **Responsive Layout**: Resized to fit within tab interface while maintaining readability

### Available Actions
- **Approve**: Move to Approved tab, publish live, status change to "approved"
- **Reject**: Move to Rejected tab, status change to "rejected"
- **Edit**: Open edit modal for content modification before decision
- **Save as Draft**: Move to Drafts tab for future development, status change to "drafts"

## Approved Tab

### Purpose
Management interface for published articles currently visible on the public website.

### Article Management
- **Live Status**: All approved articles are publicly visible
- **Publication Order**: Most recently approved articles appear first on public site
- **Border Indication**: Articles display with approved status color border
- **Real-time Updates**: Changes immediately reflected on public website

### Available Actions
- **Edit**: Modify published content with immediate public site updates
- **Unpublish**: Remove from public visibility (move to drafts or rejected status)
- **View on Site**: Direct link to public article page
- **Metadata Review**: Access to source information and processing details

### Content Modification
- **Live Editing**: Changes to approved articles update public site immediately
- **Version Control**: Maintain edit history for published content tracking
- **Quality Assurance**: Review impact of changes on public presentation

## Rejected Tab

### Purpose
Archive and potential recovery interface for articles declined during review process.

### Article Storage
- **Quality Issues**: Articles rejected due to content quality, accuracy, or relevance concerns
- **Processing Failures**: Articles with AI processing errors or incomplete information
- **Editorial Decisions**: Content deemed inappropriate for publication
- **Archive Function**: Maintain record of rejected content for analysis

### Available Actions
- **Delete**: Permanent removal from system
- **Edit**: Reopen for modification with full action options (approve/reject/save)
- **Re-review**: Return to editorial process after improvements
- **Bulk Cleanup**: Mass deletion of outdated rejected content

### Recovery Process
- **Edit Access**: Full editing capabilities with all status change options
- **Quality Improvement**: Modify content to meet publication standards
- **Resubmission**: Move back to pending or directly approve after editing

## Drafts Tab

### Purpose
Work-in-progress interface for articles requiring further development or future publication.

### Draft Management
- **Incomplete Content**: Articles needing additional research or development
- **Editorial Projects**: Content undergoing extended review or collaboration
- **Template Storage**: Article templates for recurring content types

### Available Actions
- **Edit**: Continue development with full content modification capabilities
- **Save**: Update draft content without status change
- **Approve**: Direct publication to approved status and public visibility
- **Delete**: Remove draft from system

### Development Workflow
- **Iterative Editing**: Multiple revision cycles before publication
- **Collaboration**: Multiple admin review and input capability
- **Content Staging**: Prepare articles for specific publication timing

## Article Editing System

### Edit Modal Interface
- **Content Fields**: Title, body content, topics, source URLs
- **Topic Management**: Bold hyperlink formatting for discoverability
- **Source Attribution**: Maintain fact-checking source links
- **Metadata Display**: Creation time, source type, processing information

### Image Generation Pipeline
**Recommended Flow**:
1. **Prompt Selection**: Choose from 3 AI-generated image prompts
2. **Generation Service**: API call to Midjourney or DALL-E 3
3. **Preview Interface**: Display generated image options for selection
4. **Storage Integration**: Save approved images to Cloudflare Workers storage
5. **Article Association**: Link selected image to article for public display

**Image Generation Workflow**:
- **Prompt Display**: Show all 3 generated prompts with descriptions
- **Service Selection**: Choose between available image generation APIs
- **Batch Generation**: Generate multiple options per prompt for variety
- **Quality Review**: Preview and approve images before storage
- **Fallback Options**: Manual image upload if generation fails
- **Storage Management**: Efficient image storage and CDN integration

### Content Validation
- **Format Checking**: Ensure proper markdown formatting and structure
- **Topic Verification**: Validate topic formatting and hyperlink functionality
- **Source Validation**: Verify fact-checking source URLs accessibility
- **Quality Standards**: Content length, readability, and editorial guidelines

## Status Flow Management

### Article Lifecycle
1. **AI Processing**: Article created with "pending" status
2. **Editorial Review**: Admin evaluation and decision
3. **Status Assignment**: Approved/Rejected/Drafts based on review
4. **Content Management**: Ongoing editing and status updates
5. **Publication Control**: Public visibility management

### Status Transitions
- **Pending → Approved**: Editorial approval, immediate publication
- **Pending → Rejected**: Quality issues, archive for potential recovery
- **Pending → Drafts**: Incomplete content, requires development
- **Drafts → Approved**: Completed development, ready for publication
- **Approved → Drafts**: Temporary unpublish, content modification
- **Rejected → Any Status**: Recovery through editing process

### Real-time Updates
- **Status Synchronization**: Immediate reflection across all tabs
- **Public Site Integration**: Live updates to published content
- **Admin Interface**: Real-time status changes without page refresh

## Filtering and Bulk Operations

### Shared Filter System
- **By Title**: Alphabetical sorting and search
- **By Date**: Creation date, approval date, modification date
- **By Category**: Content categorization grouping
- **By Source Type**: RSS/Research/YouTube origin filtering
- **By Status**: Current workflow status
- **Text Search**: Full-text search across titles and content

### Bulk Operations
- **Multi-select**: Checkbox selection across filtered results
- **Bulk Approve**: Mass approval for quality content batches
- **Bulk Reject**: Mass rejection for cleanup operations
- **Bulk Delete**: Permanent removal of multiple articles
- **Bulk Status Change**: Move multiple articles between workflow stages

### Filter Integration
- **Persistent Filters**: Maintain filter settings across tab switches
- **Combined Filtering**: Multiple filter criteria for precise selection
- **Quick Filters**: Preset filter combinations for common operations
- **Export Options**: Generate reports based on filter criteria

## Integration Points

### Create Workflow Handoff
- **Automatic Transfer**: Seamless flow from queue processing to pending review
- **Source Attribution**: Complete metadata preservation from creation source
- **Processing Context**: AI generation details and quality indicators
- **Timeline Tracking**: Creation to review workflow timing analytics

### Public Website Integration
- **Live Publishing**: Immediate content updates on approval
- **Content Synchronization**: Real-time article availability management
- **SEO Integration**: Automatic meta tags and search optimization
- **Performance Monitoring**: Public site impact of content changes

### Database Integration
- **Status Management**: Consistent status tracking across article lifecycle
- **Audit Trail**: Complete history of editorial decisions and changes
- **Performance Metrics**: Review workflow efficiency and quality analytics
- **Content Analytics**: Article engagement and performance tracking

## Future Enhancements

### Editorial Features
- **Collaborative Editing**: Multiple admin simultaneous editing
- **Editorial Comments**: Internal notes and feedback system
- **Approval Workflows**: Multi-stage approval for sensitive content
- **Content Scheduling**: Automated publication timing

### Quality Assurance
- **Content Scoring**: Automatic quality assessment metrics
- **Plagiarism Detection**: Duplicate content identification
- **Fact-check Verification**: Enhanced source validation
- **Reader Feedback Integration**: Public comment influence on editorial decisions

### Analytics and Reporting
- **Editorial Performance**: Review speed and accuracy metrics
- **Content Quality Trends**: Improvement tracking over time
- **Source Effectiveness**: Success rates by content source type
- **Publication Impact**: Article performance correlation with editorial decisions