# Components

## Create Components

### RSS Components
- **CreateRSSModal**: Category dropdown, enter feed url, specify maximum articles, poll frequency
- **RssArticleCard**: Shows title, URL, excerpt, feed source, add-to-queue action

### Research Components
- **CreateResearchModal**: Title, URL, concept input, category selection
- **ResearchSourceCard**: Shows title, URL, concept preview, add-to-queue action

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

## Review Components

### Review Cards
- **ReviewCard**: Universal article preview with status-based borders
- **ArticlePreview**: Embedded public article page view

### Tab Components
- **PendingTab**: List of pending articles with approve/reject actions
- **ApprovedTab**: List of published articles with edit/unpublish actions
- **RejectedTab**: List of rejected articles with delete/edit actions
- **DraftsTab**: List of draft articles with edit/approve actions

### Editing Components
- **EditArticleModal**: Article editing with image generation pipeline
- **ImageGenerationPipeline**: AI prompt selection, image generation, storage

### Shared Review Components
- **ReviewTabSystem**: Tab navigation for Pending/Approved/Rejected/Drafts
- **FilterSystem**: Shared filtering across all review tabs
- **BulkActions**: Multi-select operations

## Shared Admin Components
- **AdminSidebar**: Navigation between Create and Review workflows