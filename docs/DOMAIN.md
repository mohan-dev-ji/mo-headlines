# Domain Model

## Core Entities

### Articles
- **Purpose**: Main content pieces with AI-verified fact-checking
- **Status**: Pending, approved, rejected, drafts
- **Structure**: Title, body, excerpt, category, topics, source URLs
- **Topics**: 5-10 single-token nouns per article for discoverability
- **Sources**: Fact-checking URLs displayed at end of article body

### Categories
- **Fixed Set**: AI, Startups, Big Tech, Science, Transport
- **Keywords**: Each category has extensive keyword lists for precise RSS filtering
- **Management**: Updated via `seedCategories.ts` script with safety flags
- **Navigation**: Listed in home page navbar for browsing
- **RSS Filtering**: Keywords used to match relevant articles from RSS feeds

### Users
- **Admin**: Access to admin dashboard for content creation and review
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

### User Interactions
- **Admin**: Full create, review, edit, approve permissions
- **Public**: Read access, conditional comment/like permissions
- **Authentication**: Role-based access control

### Content Discovery
- **Category Browsing**: Navbar navigation by content type
- **Topic Search**: Single-token search across all articles
- **Source Attribution**: Transparent content origin tracking

## Business Rules

### Content Workflow
- All content flows: Creation → Queue → Processing → Review → Publication
- RSS sources find and generate articles that admin can review before adding to queue
- Only approved articles visible to public
- Admin approval required for all content publication

### RSS Article Generation
- **Feed Processing**: RSS sources test feeds and find matching articles based on category keywords
- **Article Review**: Generated RSS articles appear in RSS tab for admin review
- **Queue Addition**: Admin selects articles to add to universal processing queue
- **Lifecycle**: RSS articles deleted after queue addition to prevent duplication

### Universal Queue Processing
- **Normalized Fields**: All sources provide title, URL, concept, createSource for consistent processing
- **Single AI Prompt**: Universal prompt handles all source types using normalized queue data
- **Processing Strategy**: Individual or batch processing with status tracking
- **Result**: Articles created with pending status for review workflow

### Topic System
- Topics must be single tokens (no spaces)
- 5-10 topics generated per article during AI processing
- Topics become searchable hyperlinks for content discovery

### Category Management
- **Predefined Categories**: AI, Startups, Big Tech, Science, Transport
- **Keyword System**: Extensive keyword lists for accurate RSS content filtering
- **Update Process**: `seedCategories.ts` script with safety flags (`force: true` required)
- **Operations**: Create, update, deactivate categories with keyword management
- **RSS Integration**: Keywords automatically filter relevant articles from feeds

### User Permissions
- Admin dashboard access restricted to authenticated admins
- Public article access unrestricted
- Comment/like features require user sign-in

## Data Flow

### Content Lifecycle
1. **Creation**: Admin creates source (RSS/Research/YouTube)
2. **Article Generation**: RSS finds articles, Research/YouTube create entries
3. **Queue Addition**: Admin selects articles to add to universal queue
4. **Processing**: AI processes queue items using normalized data structure
5. **Review**: Admin evaluates processed content
6. **Publication**: Approved articles become publicly visible

### RSS Workflow
1. **Source Creation**: Admin configures RSS feed with category selection
2. **Article Discovery**: Feed tested and matching articles generated
3. **Admin Review**: Articles appear in RSS tab for selection
4. **Queue Integration**: Selected articles normalized and added to processing queue

### Universal Processing
- **Data Normalization**: All source types provide title, URL, concept, createSource
- **AI Processing**: Single prompt handles all sources using normalized queue structure
- **Quality Control**: Consistent fact-checking and content standards across all sources

### User Journey
- **Discovery**: Browse by category or search by topic
- **Consumption**: Read fact-checked articles with source attribution
- **Engagement**: Comment and like with authentication

### Search Mechanisms
- **Category Navigation**: Browse content by subject area
- **Topic Search**: Find related articles via single-token topics
- **Keyword Matching**: RSS content discovery via category keywords