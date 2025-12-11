# Features

## Public Website

### Home Page
- **Article Grid**: 3-row pattern (landscape left, landscape right, 3x portrait) with pagination
- **Desktop Layout**: 4-column grid (3 columns articles + 1 column calendar/ads)
- **Load More**: Progressive loading maintaining pattern consistency
- **Responsive Design**: Dedicated mobile card components

### Calendar-Based Discovery
- **Combined Filtering**: Date selection works with category badges - filter by "Finance articles from January 15th"
- **Reset Functionality**: "All" badge clears both date and category filters

### Pagination System
- **Progressive Loading**: Initial load shows 10 most recent articles
- **Load More Button**: Users control additional content loading in 10-article chunks
- **Filter Persistence**: Pagination maintains active category and date filter combinations
- **Pattern Consistency**: Card layout pattern continues seamlessly across paginated loads
- **Performance Optimization**: Efficient loading regardless of total archive size

### Article Page
- **Responsive Layout**: Desktop (image after paragraph 1), Mobile (image at top)
- **Sources Carousel**: Horizontal scrolling source cards with parsed domains
- **Typography**: Abhaya Libre font for headlines (desktop only)
- **Related Articles**: "More Headlines" section with small portrait cards
- **Comments**: Authenticated user comments with moderation

### Profile Settings
- **Tab System**: Toggle between Comments and Liked Posts

## Admin Features

### Content Creation
- **YouTube Video Processing**: Sole content input source for automated topic extraction from videos.
- **Article Generation Queue**: Individual topics extracted from YouTube videos are queued for processing into full articles.
- **Gemini AI Processing**: Automated fact-checking and image prompt generation via Gemini for each queued topic.

### Editorial Review
- **Article Approval**: Review AI-processed content before publication
- **Status Management**: Approve, reject, edit, or save as drafts
- **Live Editing**: Immediate updates to published content

### Image Management
- **AI Generation**: Create images using AI-generated or custom prompts
- **Quality Control**: Rate and approve images independently of articles
- **Asset Library**: Browse and manage all generated visual content