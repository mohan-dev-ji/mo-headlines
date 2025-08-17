# Create Workflow Feature

## Overview

The Create Workflow provides multiple content sourcing methods that feed into a unified processing pipeline. All content types normalize through a shared queue system before AI processing and entry into the Review workflow.

## Workflow Architecture

### Tab System
- **RSS Sources**: Automated feed monitoring and article discovery
- **Research**: Manual article creation with custom research context
- **YouTube**: Video content processing with timecode-based extraction
- **Queue**: Unified processing pipeline for all content types

### Universal Processing Flow
```
Create Source → Add to Queue → AI Processing → Review Workflow
```

### Shared Components
- **Status Indicators**: Universal status display patterns across all source types
- **Action Dropdowns**: Standardized action menus with source-specific options
- **Modal Patterns**: Consistent creation and editing interface structure
- **Queue Interface**: Universal processing management for all content types

### Source-Specific Components
- **RSS Producer Cards**: Feed status, polling frequency, category matching display
- **Research Source Cards**: Manual creation status, concept preview, queue readiness
- **YouTube Source Cards**: Video metadata, timecode display, transcript status
- **Create Modals**: Tailored forms for each source type's unique requirements

## RSS Sources Tab

### Purpose
Automated monitoring of RSS feeds with category-based filtering and intelligent article discovery.

### RSS Producer Management
- **Creation**: Name, URL, category selection, polling frequency
- **Status Monitoring**: Dual indicators (Feed Status + Category Status)
- **Automatic Processing**: Scheduled polling based on frequency settings
- **Queue Integration**: Matching articles automatically added to processing queue

### RSS Producer Card Display
- **Feed Information**: RSS source name, URL, category, polling frequency
- **Status Indicators**: Dual status system (Feed Status + Category Status)
- **Recent Activity**: Current article found, last polling timestamp
- **Actions**: Edit RSS settings, manual poll trigger, delete source, enable/disable
- **Visual Design**: Uses shared status indicator patterns with RSS-specific data

### Validation Rules
- **RSS Feed Accessibility**: Real-time validation of feed URLs
- **Category Matching**: Verification that feed contains relevant content
- **Polling Limits**: Frequency constraints to prevent overloading sources
- **Duplicate Prevention**: Hash-based deduplication of similar articles

## Research Tab

### Purpose
Manual article creation with admin-provided research context and source material.

### Research Article Creation Flow
1. **Admin Input**: Title, URL, and research concept/context
2. **Source Storage**: Saved to `create_research` table
3. **Card Display**: Appears in Research tab using producer card component
4. **Manual Queue Addition**: Admin manually adds to Create Queue
5. **AI Processing**: Standard Perplexity workflow using provided context

### Research Source Data
- **Title**: Admin-defined article title
- **URL**: Primary source URL for research
- **Concept**: Research context, notes, or key points to focus on
- **Category**: Content categorization for processing
- **Status**: Draft / Queued / Processing / Completed

### Research Source Card Display
- **Source Information**: Title, URL, research concept preview, category
- **Creation Details**: Admin who created, creation timestamp, last modified
- **Processing Status**: Draft / Ready for Queue / Queued / Completed
- **Actions**: Edit research details, add to queue, delete source, view concept
- **Visual Design**: Simplified status display focused on manual workflow

### Validation Rules
- **URL Verification**: Ensure source URL is accessible
- **Content Requirements**: Title and concept fields mandatory
- **Duplicate Detection**: Prevent duplicate research sources
- **Category Assignment**: Must select valid content category

## YouTube Tab

### Purpose
Video content processing with timecode-based extraction and transcript analysis.

### YouTube Processing Flow
1. **URL Input**: Admin provides YouTube video URL
2. **Timecode Selection**: Manual hrs:mins:secs input for start and end points
3. **Transcript Extraction**: Automatic transcript generation for selected segment
4. **Concept Storage**: Transcript excerpt stored in `concept` field of `create_youtube` table
5. **Queue Processing**: Standard AI workflow using transcript as context

### YouTube Source Data
- **Video URL**: Primary YouTube video link
- **Start Timecode**: Beginning of relevant segment (hrs:mins:secs format)
- **End Timecode**: End of relevant segment (hrs:mins:secs format)
- **Title**: Extracted from video metadata or admin-defined
- **Concept**: Generated transcript of selected timecode range
- **Category**: Content categorization for processing

### Timecode Input Format
- **Format**: HH:MM:SS (e.g., 01:23:45)
- **Validation**: Ensure start time is before end time
- **Duration Limits**: Reasonable segment length constraints
- **Accessibility**: Verify video allows transcript extraction

### YouTube Source Card Display
- **Video Information**: Title, channel name, video duration, upload date
- **Timecode Details**: Start/end timecodes, segment duration, selected range
- **Processing Status**: Transcript Generated / Failed / Processing / Ready for Queue
- **Content Preview**: Transcript excerpt, video thumbnail, category assignment
- **Actions**: Edit timecodes, regenerate transcript, add to queue, delete source
- **Visual Design**: Video-specific metadata with transcript status indicators

### Validation Rules
- **URL Verification**: Valid YouTube URL format and accessibility
- **Timecode Logic**: Start time must be before end time
- **Transcript Availability**: Video must allow transcript extraction
- **Segment Length**: Reasonable duration limits for processing
- **Error Handling**: Clear messaging for transcript extraction failures

## Queue Tab

### Purpose
Unified processing pipeline managing content from all source types with filtering and bulk operations.

### Queue Interface
- **Mixed Display**: All source types shown together in chronological order
- **Source Identification**: Clear labeling of RSS / Research / YouTube origins
- **Filter Options**: Title, date, category, source type, status
- **Bulk Operations**: Select multiple items for batch processing or deletion
- **Real-time Updates**: Live status changes during processing

### Queue Item Display
- **Content Preview**: Title, excerpt, source type indicator
- **Source Details**: Origin producer name, creation timestamp
- **Processing Status**: Waiting / Processing / Completed / Failed
- **Actions**: Individual process, delete, view details
- **Selection**: Checkbox for bulk operations

### Filter and Sort Options
- **By Title**: Alphabetical sorting
- **By Date**: Newest/oldest first
- **By Category**: Group by content category
- **By Source Type**: RSS / Research / YouTube grouping
- **By Status**: Processing status filtering
- **Search**: Text search across titles and descriptions

### Processing Management
- **Individual Processing**: Single-item AI processing with status tracking
- **Bulk Operations**: Multi-select for batch deletion
- **Error Recovery**: Failed items remain in queue for retry
- **Progress Tracking**: Real-time status updates during processing

## Status Flow Management

### Item Lifecycle
1. **Created**: Source created in respective tab (RSS/Research/YouTube)
2. **Ready**: Available for queue addition
3. **Queued**: Added to processing queue
4. **Processing**: Currently being processed by AI
5. **Completed**: Successfully processed, article created
6. **Failed**: Processing failed, available for retry

### Status Indicators
- **Visual Feedback**: Color-coded status badges
- **Progress States**: Clear progression through workflow
- **Error Messages**: Specific failure reasons when applicable
- **Recovery Options**: Retry mechanisms for failed items

### Real-time Updates
- **Live Status**: Queue status updates without page refresh
- **Processing Feedback**: Progress indicators during AI processing
- **Completion Notifications**: Success/failure messaging
- **Auto-refresh**: Periodic queue state updates

## Error Handling and Validation

### RSS Source Errors
- **Feed Accessibility**: "RSS feed not accessible" with retry options
- **Category Matching**: "No articles found in selected category"
- **Parsing Errors**: "Invalid RSS format" with troubleshooting
- **Network Issues**: Temporary vs. permanent failure distinction

### Research Source Errors
- **URL Validation**: "Invalid or inaccessible URL"
- **Content Requirements**: "Title and concept required"
- **Duplicate Prevention**: "Similar research source already exists"

### YouTube Source Errors
- **URL Format**: "Invalid YouTube URL"
- **Transcript Extraction**: "Transcript unavailable for this video"
- **Timecode Validation**: "End time must be after start time"
- **Video Accessibility**: "Video is private or unavailable"

### Queue Processing Errors
- **AI Processing Failures**: Specific Perplexity API error messages
- **Network Timeouts**: Retry logic with exponential backoff
- **Content Validation**: Missing required fields or malformed data
- **Rate Limiting**: Queue throttling during high-volume processing

## Integration Points

### Review Workflow Handoff
- **Article Creation**: Successful processing creates article with "pending" status
- **Metadata Transfer**: Source URLs, categories, topics carried forward
- **Attribution**: Clear linkage to original source type and producer
- **Quality Markers**: AI-generated vs. manually created designation

### Database Integration
- **Source Tables**: `create_rss`, `create_research`, `create_youtube`
- **Queue Table**: `create_queue` with unified structure
- **Article Table**: `articles` with source attribution
- **Status Tracking**: Consistent status field across all tables

### Component Architecture
- **Source-Specific Cards**: `RssProducerCard`, `ResearchSourceCard`, `YouTubeSourceCard`
- **Source-Specific Modals**: `CreateRssModal`, `CreateResearchModal`, `CreateYouTubeModal`
- **Shared Utilities**: `StatusIndicator`, `ActionDropdown`, `useSourceActions` hook
- **Queue Components**: Universal processing interface for all content types

### Design Consistency
- **Visual Patterns**: Shared design tokens and layout structures
- **Status Systems**: Consistent status indicator styling across source types
- **Action Patterns**: Standardized dropdown menus with source-appropriate options
- **Modal Structure**: Common modal layout with source-specific form fields

## Future Enhancements

### Additional Source Types
- **Twitter Threads**: Social media content processing
- **Podcast Transcripts**: Audio content with timecode selection
- **Conference Talks**: Event-based content extraction
- **Academic Papers**: Research publication processing

### Automation Improvements
- **Smart Timecode Detection**: Automatic segment identification for YouTube
- **Content Suggestions**: AI-powered research topic recommendations
- **Batch Import**: Multiple source creation from spreadsheets
- **Scheduled Processing**: Automatic queue processing at set intervals

### Analytics and Insights
- **Source Performance**: Success rates by source type
- **Processing Metrics**: Average processing times and costs
- **Content Quality**: AI-generated article quality scoring
- **Usage Patterns**: Most effective content source identification