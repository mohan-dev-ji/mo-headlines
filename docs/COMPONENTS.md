# Components

## Public Components

### Home Components
- **BadgeFilterBar**: Container for filter badges with active state management
- **FilterBadge**: Individual badge (Recent, Tech & Science, Finance, Policies)
- **useArticleFilter**: Hook managing filter state and URL params

### Card Components
- **ArticleCardBase**: Base component with gradient background integration
- **LandscapeCardLeft**: Row 1 layout (image left, content right)
- **LandscapeCardRight**: Row 2 layout (content left, image right)
- **PortraitCard**: Row 3 grid cards (3 per row on desktop)
- **MobileArticleCard**: Mobile-specific with expanded metadata
- **CardLayoutGrid**: Manages 3-row pattern repetition with gradients

### Article Page Components
- **ArticleLayout**: Main container with close navigation
- **ArticleHeader**: Title, date, metadata display
- **ArticleImage**: Responsive image with position logic
- **ArticleContent**: Paragraph rendering with proper spacing
- **SourcesCarousel**: Horizontal scroll container for sources
- **SourceCard**: Individual source with domain parsing
- **CommentsSection**: Authenticated commenting system
- **MoreHeadlines**: Related articles with gradient cards

### Profile Components
- **ProfileLayout**: Main profile container
- **ProfileTabs**: Comments/Liked posts toggle system
- **UserComments**: Comment history display
- **LikedPosts**: Saved articles with gradient backgrounds
- **ProfileCard**: Individual item display card

### Shared Visual Components
- **GradientBackground**: Reusable animated gradient system
- **BadgeFilter**: Modified shadcn badge with on/off states
- **LoadMoreButton**: Progressive content loading trigger

## Admin Create Components

### RSS Components
- **CreateRSSModal**: Category dropdown, enter feed url, specify maximum articles, poll frequency
- **RssArticleCard**: Shows title, URL, excerpt, feed source, add-to-queue action

### Research Components
- **CreateResearchModal**: Title, URL (optional), concept input, category selection
- **EditResearchModal**: Edit existing research sources
- **ResearchProducerCard**: Shows title, URL, concept preview, last updated timestamp
- **ResearchActionsDropdown**: Edit, Add to Queue (deletes from research tab), Delete actions

### YouTube Components
- **CreateYouTubeModal**: Video URL, timecode inputs, transcript generation
- **YouTubeSourceCard**: Shows video details, transcript excerpt, add-to-queue action

### Queue Components
- **QueueCard**: Universal card showing title, URL, concept, createSource, process action
- **QueueInterface**: Filtering, sorting, bulk operations

### Shared Create Components
- **CreateTabSystem**: Tab navigation for RSS/Research/YouTube/Queue
- **StatusIndicator**: Universal status display
- **ActionDropdown**: Standard action menus

## Admin Review Components

### Review Cards
- **ReviewCard**: Universal article preview with status-based borders
- **ArticlePreview**: Embedded public article page view

### Tab Components
- **PendingTab**: List of pending articles with approve/reject actions
- **ApprovedTab**: List of published articles with edit/unpublish actions
- **RejectedTab**: List of rejected articles with delete/edit actions
- **DraftsTab**: List of draft articles with edit/approve actions

### Editing Components
- **EditArticleModal**: Article editing with add image page integration
- **AddImagePage**: Context-aware image workflow with generate and select tabs
- **PromptSelector**: Choose from AI-generated prompts (article context) or create new (gallery context)
- **PromptModal**: Simple textarea interface for creating and editing prompts

### Shared Review Components
- **ReviewTabSystem**: Tab navigation for Pending/Approved/Rejected/Drafts
- **FilterSystem**: Shared filtering across all review tabs
- **BulkActions**: Multi-select operations

## Images Components

### Gallery Components
- **ImagesGallery**: Google Drive-style grid layout with thumbnail previews
- **ImageThumbnail**: Individual image cards with hover metadata, rating display
- **GalleryFilters**: Dropdown sorting by rating, status, date, category, model, prompt source
- **BulkActions**: Multi-select operations for rating and status changes

### Detail Components
- **ImageDetailPage**: Full-size image display with editable metadata (rating, status, article association)
- **ImageMetadata**: Complete metadata display with edit capabilities
- **PromptHistory**: Display original prompt and edit history
- **StatusToggle**: Approve/reject status management

### Add Image Components
- **AddImagePage**: Unified image workflow for article editing and gallery contexts
- **GenerateTab**: Prompt selection, editing, and DALL-E 3 generation with preview
- **SelectTab**: Gallery browser (article context) and device upload with metadata input
- **ImagePreview**: Universal preview component for generated, uploaded, and selected images

### Prompt Components
- **PromptModal**: Simple textarea interface for creating and editing prompts with save/cancel
- **PromptLibrary**: Browse and manage all prompts with usage analytics
- **PromptAnalytics**: Track effectiveness of different prompt types
- **PromptSourceBadge**: Visual indicator for AI-generated, custom, or edited prompts

### Shared Images Components
- **ImageStatusBadge**: Visual status indicators (approved/rejected/pending)
- **RatingDisplay**: Consistent rating visualization across components
- **PromptPreview**: Truncated prompt display with expand option

## Shared Admin Components
- **AdminSidebar**: Navigation between Create, Review, and Images workflows