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
- **RSS Sources**: Automated feed monitoring with category filtering
- **Research Sources**: Manual article creation with admin input
- **YouTube Sources**: Video content with timecode-based processing
- **Queue Items**: Unified processing pipeline for all source types

### User Engagement
- **Comments**: User-generated content requiring approval
- **Likes**: Article engagement tracking for signed-in users

## Entity Relationships

### Article Connections
- **Categories**: Each article belongs to one category
- **Topics**: Bold hyperlinks directing to search page with matching articles
- **Sources**: Multiple fact-checking URLs attributed per article
- **Origin**: Clear attribution to RSS/Research/YouTube source

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
- All content flows: Creation → Processing → Review → Publication
- Only approved articles visible to public
- Admin approval required for all content publication

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
2. **Processing**: Content added to queue for AI fact-checking
3. **Review**: Admin evaluates processed content
4. **Publication**: Approved articles become publicly visible

### User Journey
- **Discovery**: Browse by category or search by topic
- **Consumption**: Read fact-checked articles with source attribution
- **Engagement**: Comment and like with authentication

### Search Mechanisms
- **Category Navigation**: Browse content by subject area
- **Topic Search**: Find related articles via single-token topics
- **Keyword Matching**: RSS content discovery via category keywords