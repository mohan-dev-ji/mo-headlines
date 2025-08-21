# Admin Create Components

## Overview

Create workflow components handle multiple content sourcing methods that feed into a unified processing pipeline. Each source type has dedicated components while sharing common patterns and utilities.

## Component Structure

### Source-Specific Components
- **RSS Components**: `RssArticleCard`, `GenerateArticlesModal` - Manual article generation from RSS feeds
- **Research Components**: `ResearchSourceCard`, `CreateResearchModal` - Manual research article creation  
- **YouTube Components**: `YouTubeSourceCard`, `CreateYouTubeModal` - Video content with timecode processing
- **Queue Components**: Universal processing interface for all content types

### Shared Utilities
- **StatusIndicator**: Consistent status display across all source types
- **ActionDropdown**: Standardized action menus with source-specific options
- **Modal Patterns**: Common creation and editing interface structure
- **Design Tokens**: Shared styling through brand color system

## RSS Components

### RssArticleCard
- **Purpose**: Display individual RSS articles generated from feeds
- **Data**: Category, title, URL, excerpt, feed URL, publication date
- **Actions**: Add to queue, delete article from create_rss, edit details
- **Lifecycle**: Deleted after adding to queue

### GenerateArticlesModal
- **Form Fields**: Category selection, saved feed dropdown (or new feed URL), feed testing
- **Feed Testing**: Shows total articles found and articles matching category keywords
- **Validation**: RSS accessibility, category requirements, feed format
- **Integration**: Creates multiple entries in `create_rss` table based on category filtering

## Research Components

### ResearchSourceCard
- **Purpose**: Display manual research articles created by admin
- **Data**: Title, URL, research concept preview, category, creation details
- **Actions**: Add to queue, delete article, edit details
- **Lifecycle**: Deleted after adding to queue

### CreateResearchModal
- **Form Fields**: Article title, source URL, research concept/notes, category
- **Validation**: URL accessibility, required fields, duplicate prevention
- **Integration**: Creates entry in `create_research` table

## YouTube Components

### YouTubeSourceCard
- **Purpose**: Display video articles with timecode segments and transcript
- **Data**: Video title, channel, timecode range, transcript excerpt, category
- **Actions**: Add to queue, delete article, edit timecodes, regenerate transcript
- **Lifecycle**: Deleted after adding to queue

### CreateYouTubeModal
- **Form Fields**: YouTube URL, start timecode (HH:MM:SS), end timecode, category
- **Validation**: URL format, timecode logic, video accessibility, transcript availability
- **Integration**: Creates entry in `create_youtube` table, generates transcript from timecode range

## Queue Components

### QueueInterface
- **Purpose**: Universal processing management for all content types
- **Display**: Mixed content from all sources with source type indicators
- **Filtering**: Title, date, category, source type, status
- **Actions**: Individual processing, bulk operations, deletion

### QueueCard
- **Content**: Title, URL, concept, createSource, source type, processing status
- **Status Tracking**: Waiting/Processing/Completed/Failed with real-time updates
- **Actions**: Process item, delete, view details
- **Data Sources**: Normalized from RSS articles, research articles, or YouTube articles

## Shared Patterns

### Status Management
- **Visual Consistency**: Shared status indicator styling across all components
- **Real-time Updates**: Live status changes without page refresh
- **Error Handling**: Clear failure messaging with retry options

### Form Validation
- **Zod Schemas**: Centralized validation in `/lib/schemas/`
- **Error Display**: Consistent error messaging below form fields
- **Loading States**: Disable forms during submission with loading indicators

### Design System Integration
- **Color Tokens**: Brand-card backgrounds, brand-line borders
- **Typography**: Headline-primary and body-primary text colors
- **Spacing**: Consistent padding-md and space-between-items usage
- **Modal Structure**: Shared layout with brand-card-dark backgrounds

## Data Flow

### Component Communication
- **Parent-Child Props**: Source data passed down to specific card components
- **Convex Integration**: Real-time queries for source lists and status updates
- **Modal State**: Shared open/close state management patterns

### Processing Pipeline
- **Article Creation**: Modal generates articles in respective source tables
- **Tab Review**: Admin reviews generated articles in source-specific tabs
- **Queue Addition**: Selected articles normalized and added to universal `create_queue`
- **Article Cleanup**: Source articles deleted after queue addition
- **AI Processing**: Queue items processed with universal prompt using normalized data

## Implementation Guidelines

### Component Development
- **Source-Specific**: Build dedicated components for each source type rather than generic ones
- **Shared Utilities**: Extract common patterns into reusable utilities
- **Type Safety**: Use specific TypeScript interfaces for each source type
- **Error Boundaries**: Implement proper error handling for each component

### Performance Considerations
- **React.memo**: Optimize expensive card components
- **useCallback**: Stable event handlers for child components
- **Conditional Queries**: Skip unnecessary data fetching with Convex
- **Loading States**: Proper loading indicators for all async operations