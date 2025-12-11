# Components

## Public Components

### Home Components
- **BadgeFilterBar**: Container for category filter badges
- **FilterBadge**: Individual category badges (All, Tech, Science, Finance, Policies)
- **CalendarIconBadge**: Calendar access for mobile
- **useArticleFilter**: Article filtering and pagination state
- **LoadMoreButton**: Progressive content loading
- **PaginationHandler**: Article chunk management

### Calendar Components
- **ArticleCalendar**: Desktop calendar widget with publication indicators
- **CalendarModal**: Mobile full-screen date picker
- **PublicationIndicators**: Visual article density indicators
- **MonthNavigation**: Calendar month controls
- **DateHighlight**: Selected date highlighting

### Card Components
- **LandscapeCardLeft**: Article card with left image
- **LandscapeCardRight**: Article card with right image
- **PortraitCard**: Vertical article card
- **MobileArticleCard**: Mobile-optimized article card
- **CardLayoutGrid**: Article grid layout manager

### Article Page Components
- **ArticleLayout**: Main article container
- **ArticleHeader**: Article title and metadata
- **ArticleImage**: Responsive article image
- **ArticleContent**: Article text content
- **SourcesCarousel**: Source links carousel
- **SourceCard**: Individual source display
- **CommentsSection**: User comments system
- **MoreHeadlines**: Related articles section

### Profile Components
- **ProfileLayout**: User profile container
- **ProfileTabs**: Comments and likes tabs
- **UserComments**: User comment history
- **LikedPosts**: User liked articles
- **ProfileCard**: Profile item display

### Shared Visual Components
- **BadgeFilter**: Category filter badges
- **FilterStateIndicator**: Active filter display
- **LoadingStates**: Loading components

## Admin Dashboard Components

### Dashboard Layout
- **DashboardPage**: Main container for the dashboard views.
- **EmptyDashboard**: Component shown when there are no articles to manage.

### Article Lists
- **ToApproveList**: Shows articles waiting for review.
- **PublishedList**: Shows articles that are already live.

### Core Workflows
- **ArticlePreviewPage**: A full-page component to preview a generated article.
- **ArticleEditPage**: The main interface for editing article content, title, etc.
- **ImageReGenInterface**: Component/modal for re-generating an article's image.

### Shared Dashboard Components
- **ArticleRow**: A list item component for an article, showing status and actions (Preview, Edit, Publish).
- **PublishButton**: Component to publish an article.
- **RejectButton**: Component to reject an article.

## Admin Settings Components
- **SettingsPage**: Main container for the settings view.
- **SettingsForm**: Form to configure application settings like AI model and YouTube channel.

## Images Components

### Gallery Components
- **ImagesGallery**: Image grid layout
- **ImageThumbnail**: Individual image thumbnails
- **GalleryFilters**: Image filtering interface
- **BulkActions**: Multi-select image operations

### Detail Components
- **ImageDetailPage**: Full-size image display
- **ImageMetadata**: Image metadata editor
- **PromptHistory**: Prompt history display
- **StatusToggle**: Image status management

### Add Image Components
- **AddImagePage**: Image creation interface
- **GenerateTab**: Image generation tab
- **SelectTab**: Image selection tab
- **ImagePreview**: Image preview component

### Prompt Components
- **PromptModal**: Prompt creation interface
- **PromptLibrary**: Prompt management interface
- **PromptAnalytics**: Prompt effectiveness tracking
- **PromptSourceBadge**: Prompt source indicator

### Shared Images Components
- **ImageStatusBadge**: Image status indicators
- **RatingDisplay**: Image rating display
- **PromptPreview**: Prompt preview component

## Shared Admin Components
- **AdminSidebar**: Admin navigation between Dashboard, Settings, and Images.

### Source Cards Carousel
- **SourceCarousel**: Horizontal scrolling source cards
- **SourceCard**: Individual source link display
- **CarouselNavigation**: Scroll controls for source carousel