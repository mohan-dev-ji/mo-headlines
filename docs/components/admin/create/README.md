# Admin Create Components

## Overview

Create workflow components handle multiple content sourcing methods that feed into a unified processing pipeline. Each source type has dedicated components while sharing common patterns and utilities.

## Component Structure

### Source-Specific Components
- **RSS Components**: `RssProducerCard`, `CreateRssModal` - Feed monitoring and automatic article discovery
- **Research Components**: `ResearchSourceCard`, `CreateResearchModal` - Manual article creation with admin input  
- **YouTube Components**: `YouTubeSourceCard`, `CreateYouTubeModal` - Video content with timecode processing
- **Queue Components**: Universal processing interface for all content types

### Shared Utilities
- **StatusIndicator**: Consistent status display across all source types
- **ActionDropdown**: Standardized action menus with source-specific options
- **Modal Patterns**: Common creation and editing interface structure
- **Design Tokens**: Shared styling through brand color system

## RSS Components

### RssProducerCard
- **Purpose**: Display RSS source with dual status tracking
- **Data**: Feed name, URL, category, polling frequency, last check timestamp
- **Status Indicators**: Feed Status (Live/Not Live) + Category Status (Found/Not Found)
- **Actions**: Edit settings, manual poll, delete, enable/disable

### CreateRssModal
- **Form Fields**: Feed title, RSS URL, category selection, refresh interval
- **Validation**: URL format, RSS accessibility, category requirements
- **Integration**: Creates entry in `create_rss` table

## Research Components

### ResearchSourceCard
- **Purpose**: Display manual research sources with processing status
- **Data**: Title, URL, research concept preview, category, creation details
- **Status**: Draft/Ready for Queue/Queued/Completed
- **Actions**: Edit details, add to queue, delete, view concept

### CreateResearchModal
- **Form Fields**: Article title, source URL, research concept/notes, category
- **Validation**: URL accessibility, required fields, duplicate prevention
- **Integration**: Creates entry in `create_research` table

## YouTube Components

### YouTubeSourceCard
- **Purpose**: Display video sources with timecode and transcript status
- **Data**: Video title, channel, timecode range, transcript status, processing state
- **Status**: Transcript Generated/Failed/Processing/Ready for Queue
- **Actions**: Edit timecodes, regenerate transcript, add to queue, delete

### CreateYouTubeModal
- **Form Fields**: YouTube URL, start timecode (HH:MM:SS), end timecode, category
- **Validation**: URL format, timecode logic, video accessibility, transcript availability
- **Integration**: Creates entry in `create_youtube` table, generates transcript

## Queue Components

### QueueInterface
- **Purpose**: Universal processing management for all content types
- **Display**: Mixed content from all sources with source type indicators
- **Filtering**: Title, date, category, source type, status
- **Actions**: Individual processing, bulk operations, deletion

### QueueCard
- **Content**: Title, excerpt, source type, origin producer, processing status
- **Status Tracking**: Waiting/Processing/Completed/Failed with real-time updates
- **Actions**: Process item, delete, view details

## Shared Patterns

### Status Management
- **Visual Consistency**: Shared status indicator styling across all components
- **Real-time Updates**: Live status changes without page refresh
- **Error Handling**: Clear failure messaging with retry options

### Form Validation
- **Zod Schemas**: Centralized validation
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
- **Source Creation**: Components create entries in respective source tables
- **Queue Integration**: Sources add items to unified `create_queue` table
- **Status Synchronization**: Components reflect processing state changes

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