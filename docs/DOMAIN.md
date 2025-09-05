# Domain Model

## Core Entities

### Articles
- **Purpose**: Main content pieces with AI-verified fact-checking
- **Status**: Pending, approved, rejected, drafts
- **Structure**: Title, body, excerpt, category, topics, source URLs
- **Topics**: 5-10 single-token nouns per article for discoverability
- **Sources**: Fact-checking URLs displayed at end of article body
- **Images**: Optional link to selected image asset
- **Prompts**: Linked AI-generated prompts for image creation

### Prompts
- **Purpose**: AI-generated and custom prompts for image generation with usage tracking
- **Source Types**: AI-generated (from Perplexity), custom (admin-created), edited (refined prompts)
- **Usage Tracking**: Boolean flag indicating whether prompt was used for actual image generation
- **Relationships**: Each prompt linked to specific article, images reference specific prompts
- **Analytics**: Track which prompt types and patterns lead to successful image generation

### Images
- **Purpose**: AI-generated visual assets for articles with quality tracking
- **Status**: Pending, approved, rejected, unused
- **Rating**: 1-10 quality scoring system for prompt effectiveness
- **Storage**: Cloudflare Workers bucket for CDN delivery
- **Metadata**: Complete generation data including prompts, models, costs
- **Analytics**: Article association and category tracking for insights
- **Prompt Link**: Direct relationship to specific prompt used for generation

### Categories
- **Simplified Set**: Tech & Science, Finance, Policies
- **Previous System**: ~~AI, Startups, Big Tech, Science, Transport~~ (deprecated)
- **Keywords**: Comprehensive keyword lists merged from previous 5 categories
- **Management**: Updated via `seedCategories.ts` script with safety flags
- **Navigation**: Badge-based filtering on home page (Recent, Tech & Science, Finance, Policies)
- **Visual Identity**: Each category associated with gradient color pools

### Users
- **Admin**: Access to admin dashboard for content creation, review, and image management
- **Public**: Can view all articles, sign in to comment and like
- **Authentication**: Clerk-based system with role separation

### Content Sources
- **RSS Sources**: Automated feed monitoring with category filtering and article generation
- **Research Sources**: Manual article creation with admin input
- **YouTube Sources**: Video content with timecode-based processing
- **Queue Items**: Unified processing pipeline for all source types with normalized attributes (title, URL, concept, createSource)

### User Engagement
- **Comments**: User-generated content requiring approval
- **Likes**: Article engagement tracking for signed-in users

## Entity Relationships

### Article Connections
- **Categories**: Each article belongs to one category
- **Topics**: Bold hyperlinks directing to search page with matching articles
- **Sources**: Multiple fact-checking URLs attributed per article
- **Origin**: Clear attribution to RSS/Research/YouTube source via createSource field
- **Images**: Optional relationship to selected image asset
- **Prompts**: One-to-many relationship with AI-generated prompts for image creation

### Prompt Connections
- **Articles**: Each prompt belongs to a specific article
- **Images**: Prompts can be used by multiple images (if regenerated)
- **Source Tracking**: Clear identification of prompt origin (AI, custom, edited)
- **Usage Analytics**: Track which prompts lead to actual image generation
- **Edit History**: Edited prompts maintain reference to original prompts

### Image Connections
- **Articles**: Each image linked to the article it was created for
- **Prompts**: Direct reference to the specific prompt used for generation
- **Categories**: Denormalized category for analytics and filtering
- **Generation Data**: Complete metadata about creation process and effectiveness

### User Interactions
- **Admin**: Full create, review, edit, approve permissions across content, images, and prompts
- **Public**: Read access, conditional comment/like permissions
- **Authentication**: Role-based access control

### Content Discovery
- **Category Browsing**: Navbar navigation by content type
- **Source Attribution**: Transparent content origin tracking
- **Image Gallery**: Visual asset browsing with quality and usage analytics
- **Prompt Analytics**: Track effectiveness patterns across prompt types

### Visual Identity System
- **Gradient Backgrounds**: 20 pre-defined animated gradients
- **Assignment Logic**: Deterministic gradient per article based on ID
- **Animation**: CSS-based brightness pulsing (10s cycles)
- **Category Theming**: Optional gradient pools per category
- **Performance**: GPU-accelerated CSS animations

## Business Rules

### Content Workflow
- All content flows: Creation → Queue → Processing → Review → Publication
- RSS sources find and generate articles that admin can review before adding to queue
- Only approved articles visible to public
- Admin approval required for all content publication

### Prompt Management Workflow
- AI processing generates 3 prompts per article stored in prompts table
- Prompts marked with source type: "ai-generated", "custom", or "edited"
- Admin can edit prompts before image generation, creating new "edited" prompt record
- Only prompts used for actual image generation marked as `isUsed: true`
- Prompt effectiveness tracked through image ratings and approval status

### Image Management Workflow
- Images generated during article editing process using specific prompts
- All images stored in dedicated Cloudflare Workers bucket
- Complete metadata tracked including prompt relationships and generation costs
- Independent approval workflow from article approval
- Quality rating system (1-10) for prompt effectiveness analysis
- Images directly linked to prompts used for generation

### RSS Article Generation
- **Feed Processing**: RSS sources test feeds and find matching articles based on category keywords
- **Article Review**: Generated RSS articles appear in RSS tab for admin review
- **Queue Addition**: Admin selects articles to add to universal processing queue
- **Lifecycle**: RSS articles deleted after queue addition to prevent duplication

### Universal Queue Processing
- **Normalized Fields**: All sources provide title, URL, concept, createSource for consistent processing
- **Single AI Prompt**: Universal prompt handles all source types using normalized queue data
- **Processing Strategy**: Individual or batch processing with status tracking
- **AI Output**: Articles created with pending status + 3 prompts stored in prompts table
- **Prompt Generation**: Each processed article gets 3 AI-generated prompts for image creation

### Category Management
- **Predefined Categories**: The categories are changing as the project gets built
- **Keyword System**: Extensive keyword lists for accurate RSS content filtering
- **Update Process**: `seedCategories.ts` script with safety flags (`force: true` required)
- **Operations**: Create, update, deactivate categories with keyword management
- **RSS Integration**: Keywords automatically filter relevant articles from feeds

### User Permissions
- Admin dashboard access restricted to authenticated admins
- Public article access unrestricted
- Comment/like features require user sign-in
- Image gallery and prompt analytics restricted to admin users

## Data Flow

### Content Lifecycle
1. **Creation**: Admin creates source (RSS/Research/YouTube)
2. **Article Generation**: RSS finds articles, Research/YouTube create entries
3. **Queue Addition**: Admin selects articles to add to universal queue
4. **Processing**: AI processes queue items using normalized data structure
5. **Prompt Generation**: AI creates 3 prompts per article in prompts table
6. **Review**: Admin evaluates processed content and available prompts
7. **Publication**: Approved articles become publicly visible

### Prompt Lifecycle
1. **Generation**: Perplexity AI creates 3 prompts per processed article
2. **Storage**: Prompts stored in dedicated table linked to articles
3. **Selection**: Admin chooses prompt for image generation or creates custom prompt
4. **Editing**: Optional prompt refinement via EditPromptModal creates new edited prompt
5. **Usage**: Selected prompt used for image generation, marked as `isUsed: true`
6. **Analytics**: Prompt effectiveness tracked through image ratings and approval rates

### Image Lifecycle
1. **Prompt Selection**: Admin chooses from available prompts (AI/custom/edited)
2. **Generation**: Images created via DALL-E 3 API using selected prompt
3. **Storage**: Images uploaded to Cloudflare Workers bucket
4. **Metadata**: Complete generation data stored with prompt relationships
5. **Rating**: Admin rates image quality (1-10) for prompt effectiveness
6. **Approval**: Independent approve/reject workflow
7. **Analytics**: Data available in Images admin section for prompt optimization

### RSS Workflow
1. **Source Creation**: Admin configures RSS feed with category selection
2. **Article Discovery**: Feed tested and matching articles generated
3. **Admin Review**: Articles appear in RSS tab for selection
4. **Queue Integration**: Selected articles normalized and added to processing queue

### Universal Processing
- **Data Normalization**: All source types provide title, URL, concept, createSource
- **AI Processing**: Single prompt handles all sources using normalized queue structure
- **Quality Control**: Consistent fact-checking and content standards across all sources
- **Prompt Output**: Standardized 3-prompt generation for all processed articles

### User Journey
- **Discovery**: Browse by category or search by topic
- **Consumption**: Read fact-checked articles with source attribution
- **Engagement**: Comment and like with authentication

### Asset Management
- **Image Delivery**: Cloudflare CDN serves all images for optimal performance
- **Quality Analysis**: Admin reviews image generation effectiveness via gallery interface
- **Prompt Optimization**: Rating and approval data guides future prompt strategies
- **Effectiveness Tracking**: Analyze which prompt types and patterns produce best results

### Search Mechanisms
- **Category Navigation**: Browse content by badge filtering system
- **Keyword Matching**: RSS content discovery via category keywords
- **Image Gallery**: Filter images by rating, status, category, model, and date
- **Prompt Analytics**: Filter and analyze prompts by source type and effectiveness