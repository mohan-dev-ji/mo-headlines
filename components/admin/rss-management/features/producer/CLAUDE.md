# Producer Feature Implementation

## Feature Overview

The Producer feature manages individual RSS sources that monitor feeds on customizable schedules. Each producer filters articles by category and adds matching content to the centralized queue for processing.

## Component Architecture

### Producer Tab (`producer-tab.tsx`)
Main container component for the Producer feature:
- Displays overview and create button to make a new RSS producer
- Lists all RSS producers in card format from rss_producer table
- Handles producer creation workflow
- Manages tab-level state

### Create Producer Modal (`create-producer-modal.tsx`)
Form modal for creating new RSS producers:
- Feed Title, URL, Category, Refresh Interval fields
- Uses relational link from the category table to select a category
- Form validation using Zod schemas
- Saves user input to rss_producer table

### Producer Card (`producer-card.tsx`)
Individual RSS producer display component:
- Three-column layout: Details | Status | Actions
- Dual status indicators (Feed Status + Category Status)
- When run sends RSS producer data to rss-parser
- Real-time status updates from rss-parser response
- Feed Status display
- Category Status display

### Producer Card Actions Dropdown (`producer-actions-dropdown.tsx`)
Actions menu for each producer:
- Edit producer settings
- Run Now (manual trigger)
- Delete producer
- Enable/Disable toggle. 
- Enable sets isActive to true and starts a countdown timer starting from the pollFrequency number in rss_producer table.
- Disable sets isActive to false and displays no countdown timer.

## Data Management

### RSS Source Creation
```typescript
interface CreateProducerForm {
  feedTitle: string;          // Display name for the producer
  feedUrl: string;            // RSS feed URL
  category: string;           // Selected from available categories dropdown
  refreshInterval: number;    // Minutes between checks (15, 30, 45, 60)
}
```

### Producer Status Tracking
```typescript
interface ProducerStatus {
  feedStatus: "live" | "not_live" | null;    // RSS feed accessibility
  categoryStatus: "found" | "not_found" | null;  // Article in category found
  lastChecked?: number;
  currentArticleTitle?: string;
  currentArticleUrl?: string;
}
```

## Producer Card Layout

### Three-Column Structure
```
┌─────────────────────────────────────────────────────┐
│ Producer Details    │ Run Results     │ Actions     │
│ (Left Column)       │ (Middle Column) │ (Right Col) │
│                     │                 │             │
│ • Feed Title        │ Last run:       │     ⋮       │
│ • Feed URL          │ Never           │             │
│ • Category          │                 │ [Dropdown]  │
│ • Refresh: 30min    │ Feed Status:    │             │
│                     │ Not checked     │             │
│                     │                 │             │
│                     │ Category Status:│             │
│                     │ Not checked     │             │
└─────────────────────────────────────────────────────┘
```

## Status Indicator Logic

### Feed Status (Primary)
- 🟢 **Live:** RSS feed accessible and parseable
- 🔴 **Not Live:** RSS feed failed or inaccessible
- ⚪ **Not checked:** Initial state before first run

### Category Status (Secondary - only shown if Feed = Live)
- 📰 **Article Found:** At least one article matches selected category
- 📭 **No Article in Category:** Feed is live but no articles match category filter
- ⚪ **Not checked:** Initial state before first run

### Status Display Examples
```
RSS Producer Card Display:
┌─────────────────────────────┐
│ TechCrunch AI Feed          │
│ 🟢 Live  📰 Article Found   │  ← Both indicators green
│ "Apple announces M4 chip"   │
│ Last check: 2 min ago       │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Ars Technica Startups      │
│ 🟢 Live  📭 No Articles     │  ← Feed works, no category match
│ Last check: 5 min ago       │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Broken RSS Feed             │
│ 🔴 Not Live                 │  ← Feed failed, no category check
│ Last check: 10 min ago      │
└─────────────────────────────┘
```

## Form Validation

### Validation Rules
```typescript
const producerSchema = z.object({
  feedTitle: z.string().min(1, "Feed title is required").max(50, "Title too long"),
  feedUrl: z.string().url("Please enter a valid RSS URL"),
  category: z.string().min(1, "Please select a category"),
  refreshInterval: z.number().min(15).max(1440) // 15 minutes to 24 hours
});
```

### Error States
- Invalid URL format
- Inaccessible RSS feed
- Missing required fields
- Network connectivity issues

## Integration Points

### Backend Integration
- **Create Producer:** `api.rss_sources.create`
- **Get Producers:** `api.rss_sources.getAll`
- **Update Status:** `api.rss_sources.updateStatus`
- **Delete Producer:** `api.rss_sources.delete`

### Queue Integration
- Successfully filtered articles added to queue
- Producer status updates when articles queued
- Queue count reflects producer activity

### Real-time Updates
- Status indicators update via Convex queries
- New producers appear immediately after creation
- Actions reflect in real-time across all tabs

## User Workflows

### Create New Producer
1. Click "Create New Producer" button
2. Fill out form (Title, URL, Category, Interval)
3. Form validation and RSS feed testing
4. Success → Producer card appears with initial status
5. Background: Producer begins monitoring on schedule

### Monitor Producer Status
1. View producer cards with dual status indicators
2. Real-time updates show latest check results
3. Current article displayed when found
4. Error states clearly indicated

### Manage Existing Producers
1. Use actions dropdown for each producer
2. Edit settings, manual run, enable/disable
3. Status updates reflect changes immediately
4. Integration with queue shows processing flow

## Error Handling

### RSS Feed Failures
- Clear error messaging in status indicators
- Retry logic for temporary network issues
- Graceful degradation (continues checking other feeds)
- Admin notifications for persistent failures

### Form Validation Errors
- Real-time validation feedback
- Clear error messages for each field
- Prevent submission with invalid data
- User-friendly error descriptions

## Performance Considerations

### Efficient Updates
- Only update changed status indicators
- Batch status updates where possible
- Minimize re-renders during real-time updates
- Efficient card layout for large producer lists

### Memory Management
- Clean up event listeners on unmount
- Efficient Convex query subscriptions
- Prevent memory leaks in status polling