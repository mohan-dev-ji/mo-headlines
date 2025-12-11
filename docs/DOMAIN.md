# Domain Model

## Product Overview

**The Headlines** (formerly Mo Headlines) is an AI-verified tech news platform delivering accurate, fact-checked technology news through automated source verification and intelligent content synthesis.

### Product Goals
- Timely, trustworthy news with AI fact-checked synthesis exclusively from YouTube sources
- Browse by category using badge-based filtering system
- Scalable content pipeline supporting only YouTube processing

### User Types
- **Reader**: Consumes articles, explores topics, comments and like articles
- **Editor/Admin**: Creates content through youtube video discovery. Review, edit and publish articles.

### Design Philosophy
- Simplified 4-category system (Tech, Science, Finance, Policies)
- Badge-based filtering replaces traditional navigation
- Calendar-based discovery for temporal content browsing
- Mobile-first responsive design with newspaper typography

## Core Entities

### Articles
- **Purpose**: Main content pieces with AI-verified fact-checking
- **Status**: Pending, approved, rejected
- **Structure**: Title, body, excerpt, category, topics, source URLs
- **Topics**: 5-10 single-token nouns per article for discoverability
- **Sources**: Fact-checking sources with URL, domain, and title displayed as cards
- **Images**: Optional link to selected image asset
- **Prompts**: Linked AI-generated prompts for image creation
- **Publication Date**: Critical for calendar filtering and temporal discovery
- **Archive Access**: Historical articles discoverable through calendar interface

### Prompts
- **Purpose**: AI-generated and custom prompts for image generation with usage tracking
- **Source Types**: AI-generated (from Gemini), custom (admin-created), edited (refined prompts)
- **Usage Tracking**: Boolean flag indicating whether prompt was used for actual image generation
- **Relationships**: Each prompt linked to specific article, images reference specific prompts
- **Analytics**: Track which prompt types and patterns lead to successful image generation

### Images
- **Purpose**: AI-generated visual assets for articles with quality tracking
- **Status**: Pending, approved, rejected, unused
- **Rating**: 1-10 quality scoring system for prompt effectiveness
- **Storage**: Cloudflare Workers bucket for CDN delivery
- **Metadata**: Complete generation data including prompts, costs
- **Analytics**: Article association and category tracking for insights
- **Prompt Link**: Direct relationship to specific prompt used for generation

### Categories
- **Current Set**: All, Tech, Science, Finance, Policies (5 categories)
- **Previous System**: ~~AI, Startups, Big Tech, Science, Transport~~ (deprecated)
- **Management**: Updated via `seedCategories.ts` script with safety flags
- **Navigation**: Badge-based filtering on home page with horizontal scrolling on mobile
- **Visual Identity**: Each category associated with gradient color pools
- **Combined Filtering**: Works with calendar date selection for precise content discovery

### Calendar Discovery
- **Publication Tracking**: Articles indexed by publication date for temporal browsing
- **Visual Indicators**: Calendar days marked with dots showing article density
- **Activity Density**: Multiple dots or enhanced indicators for high-publication days
- **Month Navigation**: Previous/next month controls for archive exploration
- **Combined Filtering**: Date selection works with category filters for precision discovery
- **Mobile Access**: Full-screen modal with touch-optimized calendar interface

### Pagination System
- **Progressive Loading**: Initial 10-article load with "Load More" functionality
- **Filter Persistence**: Pagination maintains active category and date filter combinations
- **Pattern Consistency**: 3-row card layout continues across paginated loads
- **Performance**: Efficient loading regardless of total archive size
- **State Management**: URL parameters preserve pagination state with filters

### Users
- **Admin**: Access to admin dashboard for content creation, review, and image management
- **Public**: Can view all articles, sign in to comment and like
- **Authentication**: Clerk-based system with role separation

### Content Sources
- **YouTube Sources**: Video content processing. This is the sole content input source.
- **Queue Items**: Individual topics extracted from a YouTube video, queued for article generation.

### User Engagement
- **Comments**: User-generated content requiring approval
- **Likes**: Article engagement tracking for signed-in users

## Entity Relationships

### Article Connections
- **Categories**: Each article belongs to one category
- **Topics**: Bold hyperlinks directing to search page with matching articles
- **Sources**: Multiple enriched source objects (URL, domain, title) per article
- **Origin**: Clear attribution to YouTube source via createSource field
- **Images**: Optional relationship to selected image asset
- **Prompts**: One-to-many relationship with AI-generated prompts for image creation
- **Publication Date**: Links article to calendar discovery system
- **Archive Position**: Temporal positioning within category and overall content timeline

### Calendar Connections
- **Article Publication**: Calendar dates linked to articles via publishedAt timestamps
- **Category Integration**: Calendar filtering works with category badge selection
- **Visual Density**: Publication indicators show content volume per day
- **Temporal Navigation**: Month-to-month browsing enables historical content discovery
- **Filter Combination**: Date selection combines with category filters for precision browsing

### Pagination Connections
- **Filter State**: Pagination maintains active category and date filter selections
- **Content Chunks**: 10-article segments preserve visual pattern consistency
- **Archive Scaling**: System handles unlimited content growth through efficient loading
- **User Control**: "Load More" button gives users control over content consumption
- **Performance**: Prevents large data loads while maintaining seamless browsing experience

### Prompt Connections
- **Articles**: Each prompt belongs to a specific article
- **Images**: Prompts can be used by multiple images (if regenerated)
- **Source Tracking**: Clear identification of prompt origin (Gemini AI, custom, edited)
- **Usage Analytics**: Track which prompts lead to actual image generation
- **Edit History**: Edited prompts maintain reference to original prompts

### Image Connections
- **Articles**: Each image linked to the article it was created for
- **Prompts**: Direct reference to the specific prompt used for generation (generated by Gemini)
- **Categories**: Denormalized category for analytics and filtering
- **Generation Data**: Complete metadata about creation process and effectiveness

### User Interactions
- **Admin**: Full create, review, edit, approve permissions across content, images, and prompts
- **Public**: Read access, conditional comment/like permissions
- **Authentication**: Role-based access control

### Content Discovery
- **Category Browsing**: Badge-based navigation by content type
- **Temporal Discovery**: Calendar-based browsing by publication date
- **Combined Discovery**: Category + date filtering for precision content access
- **Source Attribution**: Transparent content origin tracking
- **Image Gallery**: Visual asset browsing with quality and usage analytics
- **Prompt Analytics**: Track effectiveness patterns across prompt types
- **Archive Exploration**: Historical content discovery through calendar navigation

## Business Rules

### Content Workflow
- All content flows: YouTube Source -> Extract Topics -> Queue (individual topics) -> Processing (Gemini AI) -> Review -> Publication
- Only approved articles visible to public
- Admin approval required for all content publication

### Calendar Discovery Workflow
- **Publication Date Required**: All approved articles must have publishedAt timestamp
- **Calendar Indicators**: Days with articles automatically show publication dots
- **Combined Filtering Logic**: Date filter + category filter work together (not exclusive)
- **Archive Access**: Calendar provides access to historical content regardless of age
- **Mobile Calendar Access**: Full-screen modal provides same functionality as desktop widget

### Pagination Workflow
- **Initial Load**: Home page shows 10 most recent articles matching active filters
- **Progressive Loading**: "Load More" button loads additional 10-article chunks
- **Filter Persistence**: Pagination maintains both category and date filter states
- **Pattern Continuity**: 3-row card layout (landscape-left, landscape-right, 3x portrait) continues across loads
- **Performance Optimization**: Efficient queries prevent loading large datasets unnecessarily

### Prompt Management Workflow
- Gemini AI processing generates 3 prompts per article stored in prompts table
- Prompts marked with source type: "ai-generated", "custom", or "edited"
- Admin can edit prompts before image generation, creating new "edited" prompt record
- Only prompts used for actual image generation marked as `isUsed: true`
- Prompt effectiveness tracked through image ratings and approval status

### Image Management Workflow
- Images generated during article editing process using specific prompts (generated by Gemini)
- All images stored in dedicated Cloudflare Workers bucket
- Complete metadata tracked including prompt relationships and generation costs
- Independent approval workflow from article approval
- Quality rating system (1-10) for prompt effectiveness analysis
- Images directly linked to prompts used for generation

### Universal Queue Processing
- **Normalized Fields**: Individual topics extracted from a YouTube video provide title, URL (of the video), concept, createSource for consistent processing.
- **Single AI Prompt**: Universal prompt handles each topic using normalized queue data.
- **Processing Strategy**: Individual or batch processing with status tracking.
- **AI Output**: Articles created with pending status + 3 prompts stored in prompts table.
- **Prompt Generation**: Each processed topic gets 3 Gemini AI-generated prompts for image creation.

### Category Management
- **Predefined Categories**: All, Tech, Science, Finance, Policies (5 total categories)
- **Badge Filtering**: Desktop shows all badges, mobile uses horizontal scrolling
- **Combined Filtering**: Category selection works with calendar date selection
- **Reset Pattern**: "All" badge clears both category and date filters
- **Update Process**: `seedCategories.ts` script with safety flags (`force: true` required)
- **Operations**: Create, update, deactivate categories with keyword management

### User Permissions
- Admin dashboard access restricted to authenticated admins
- Public article access unrestricted
- Comment/like features require user sign-in
- Image gallery and prompt analytics restricted to admin users
- Calendar discovery available to all public users

## Data Flow

### Content Lifecycle
1. **Creation**: Admin provides YouTube URL.
2. **Topic Extraction**: Multiple topics are extracted from the YouTube video.
3. **Queue Addition**: Each extracted topic leads to a separate queue item.
4. **Processing**: Gemini AI processes queue items (individual topics) using normalized data structure.
5. **Prompt Generation**: Gemini AI creates 3 prompts per article (generated from a topic) in prompts table.
6. **Review**: Admin evaluates processed content and available prompts.
7. **Publication**: Approved articles become publicly visible with publication timestamps.

### Calendar Discovery Lifecycle
1. **Publication**: Articles published with publishedAt timestamps
2. **Calendar Integration**: Publication dates automatically indexed for calendar display
3. **Visual Indicators**: Calendar days with articles marked with publication dots
4. **User Discovery**: Users browse calendar to find content from specific dates
5. **Combined Filtering**: Date selection works with category badges for precision discovery
6. **Archive Access**: Historical content becomes discoverable through temporal navigation

### Pagination Lifecycle
1. **Initial Load**: Home page displays 10 most recent articles matching active filters
2. **Filter Application**: Category and/or date filters applied to article query
3. **Progressive Loading**: "Load More" button triggers next 10-article chunk
4. **State Persistence**: Pagination maintains active filter combinations
5. **Pattern Continuity**: Card layout pattern continues seamlessly across loads
6. **Archive Exploration**: Users can progressively load through entire content archive

### Prompt Lifecycle
1. **Generation**: Gemini AI creates 3 prompts per processed article
2. **Storage**: Prompts stored in dedicated table linked to articles
3. **Selection**: Admin chooses prompt for image generation or creates custom prompt
4. **Editing**: Optional prompt refinement via EditPromptModal creates new edited prompt
5. **Usage**: Selected prompt used for image generation, marked as `isUsed: true`
6. **Analytics**: Prompt effectiveness tracked through image ratings and approval rates

### Image Lifecycle
1. **Prompt Selection**: Admin chooses from available prompts (Gemini AI/custom/edited)
2. **Generation**: Images created via an integrated image generation API using selected prompt
3. **Storage**: Images uploaded to Cloudflare Workers bucket
4. **Metadata**: Complete generation data stored with prompt relationships
5. **Rating**: Admin rates image quality (1-10) for prompt effectiveness
6. **Approval**: Independent approve/reject workflow
7. **Analytics**: Data available in Images admin section for prompt optimization

### Universal Processing
- **Data Normalization**: Each extracted topic from YouTube provides title, URL (of the video), concept, createSource.
- **AI Processing**: Single Gemini prompt handles each topic using normalized queue structure.
- **Quality Control**: Consistent fact-checking and content standards across topics from YouTube source.
- **Prompt Output**: Standardized 3-prompt generation for each processed article.

### User Journey
- **Discovery**: Browse by category badges or calendar date selection
- **Combined Discovery**: Use both category and date filters for precision browsing
- **Progressive Loading**: Control content consumption through "Load More" functionality
- **Archive Exploration**: Access historical content through calendar navigation
- **Consumption**: Read fact-checked articles with source attribution
- **Engagement**: Comment and like with authentication

### Asset Management
- **Image Delivery**: Cloudflare CDN serves all images for optimal performance
- **Quality Analysis**: Admin reviews image generation effectiveness via gallery interface
- **Prompt Optimization**: Rating and approval data guides future prompt strategies
- **Effectiveness Tracking**: Analyze which prompt types and patterns produce best results

### Search Mechanisms
- **Category Navigation**: Browse content by badge filtering system
- **Temporal Discovery**: Browse content by calendar date selection
- **Combined Filtering**: Combine category and date for precision discovery
- **Archive Access**: Historical content browsing through calendar interface
- **Image Gallery**: Filter images by rating, status, category, model, and date
- **Prompt Analytics**: Filter and analyze prompts by source type and effectiveness
- **Progressive Loading**: Efficient content discovery through pagination system