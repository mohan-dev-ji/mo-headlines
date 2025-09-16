# Features

## Public Website

### Home Page
- **Badge Filter System**: All, Tech, Science, Finance, Policies with horizontal scrolling and calendar icon on mobile
- **Calendar Integration**: Calendar icon badge on mobile, persistent widget on desktop
- **Article Grid**: 3-row pattern (landscape left, landscape right, 3x portrait) with pagination
- **Desktop Layout**: 4-column grid (3 columns articles + 1 column calendar/ads)
- **Load More**: Progressive loading maintaining pattern consistency
- **Responsive Design**: Dedicated mobile card components

### Calendar-Based Discovery
- **Desktop Calendar Widget**: Right column calendar showing publication dates with dot indicators for content density
- **Mobile Calendar Modal**: Full-screen date picker accessible via calendar icon badge in horizontal scroll
- **Combined Filtering**: Date selection works with category badges - filter by "Finance articles from January 15th"
- **Publication Indicators**: Visual dots on calendar days with articles, multiple dots for high-activity days
- **Selected Date Highlighting**: Calendar dates use same brand colors (cyan-400/cyan-950) as active category badges
- **Month Navigation**: Previous/next month controls with current month default
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

## Create Workflow

### RSS Tab
- **Generate Articles Modal**: Select category, choose saved feed, test feed, import matching articles
- **Article Review**: Generated articles appear as cards for admin review
- **Actions**: Add articles to queue or delete

### Research Tab
- **Create Research Modal**: Input title, URL (optional), research concept, select category
- **Research Sources**: Created research sources appear as cards showing title, URL, and concept
- **Actions**: Edit research sources, add to queue (removes from research tab), or delete
- **Workflow**: Research sources are deleted when added to queue, preventing duplicates

### YouTube Tab
- **Create YouTube Modal**: Input video URL, set timecodes, extract transcript
- **Article Review**: Generated video articles appear as cards for admin review
- **Actions**: Add articles to queue, edit timecodes, regenerate transcript

### Queue Tab
- **Universal Processing**: All source types normalized (title, URL, concept, createSource)
- **Management**: Filter, sort, process individually or in bulk
- **AI Processing**: Single prompt handles all source types, generates 3 image prompts per article

## Review Workflow

### Pending Tab
- **New Articles**: AI-processed articles awaiting editorial review
- **Prompt Access**: AI-generated prompts available for image creation
- **Actions**: Approve, reject, edit, save as draft

### Approved Tab
- **Published Content**: Live articles visible on public website
- **Actions**: Edit (immediate public updates), unpublish

### Rejected Tab
- **Declined Articles**: Archive for potential recovery
- **Actions**: Delete permanently, edit and resubmit

### Drafts Tab
- **Work in Progress**: Articles requiring further development
- **Actions**: Continue editing, approve, delete

### Add Image Interface
- **Generate Tab**: Select prompts (AI-generated if from article, empty if from gallery), create/edit prompts via modal, generate with DALL-E 3
- **Select Tab**: Browse gallery (article context) or upload from device, add custom prompts and ratings  
- **Context Awareness**: Same interface works for article editing and standalone gallery workflows
- **Prompt Modal**: Simple textarea with save/cancel for creating and editing prompts

## Images Workflow

### Gallery View
- **Image Grid**: Google Drive-style thumbnail gallery showing all generated images
- **Sorting Options**: Dropdown filters by rating (1-10), status (approved/rejected), date, category, model
- **Prompt Analytics**: View which prompt types (AI-generated, custom, edited) perform best
- **Quick Actions**: Rate images, approve/reject status, bulk operations

### Image Detail
- **Full Display**: Click thumbnail opens dedicated page with full-size image view
- **Editable Metadata**: Rating (1-10), status (approved/rejected), article association
- **Prompt History**: View original prompt and any edits made before generation
- **Status Management**: Approve/reject workflow independent of article usage

### Prompt Management
- **Edit Prompts**: Refine AI-generated or custom prompts before image generation
- **Prompt Library**: Track all prompts (AI-generated, custom, edited) with usage analytics
- **Effectiveness Tracking**: See which prompts lead to high-rated, approved images
- **Reusability**: Save and reuse successful prompt patterns across articles