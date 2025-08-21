# Article Display Feature

## Overview

The Article Display feature provides the public-facing interface for consuming Mo Headlines content. Users can browse articles by category, search by topics, read full articles with fact-checking sources, and engage through comments and likes.

## Page Structure

### Homepage Layout
- **Navbar**: Logo/home, category navigation, sign-in/user avatar
- **Hero Section**: Featured content area with brand-primary background
- **Featured Articles**: 3 articles in asymmetric layout
- **Recent Articles**: Chronological list of latest content
- **Footer**: Site information and links

### Featured Article Layout
- **Large Article**: Left side, prominent display with full details
- **Small Articles**: Two vertically stacked on right side
- **Card Types**: Different sizing for featured vs. regular content
- **Responsive**: Adapts to mobile with portrait card layout

### Main Article Feed
- **Desktop**: Landscape article cards in list format
- **Mobile**: Portrait article cards for better mobile experience
- **Chronological Order**: Most recent articles first
- **Infinite Content**: Scrollable feed of all published articles

## Article Page Structure

### Content Layout
- **Header**: Title, category badge, publication date
- **Topics**: Clickable badges under title for discoverability
- **Article Body**: Full content with bold topic keywords as hyperlinks
- **Sources Section**: Fact-checking URLs in distinct background color
- **Comments**: User engagement below article content
- **Footer**: Site navigation and information

### Topic Integration
- **Display**: Badge-style clickable elements under article title
- **Functionality**: Clicking topics navigates to search results
- **Inline Links**: Bold topic keywords within article body text
- **Discovery**: Primary method for finding related content

### Source Attribution
- **Location**: Below article body in dedicated section
- **Styling**: Different background color for visual separation
- **Title**: "Sources" heading for clear identification
- **Links**: Clickable URLs to fact-checking sources

### Related Content (Future)
- **Placement**: Row of portrait article cards after sources
- **Algorithm**: Topic-based content matching
- **Display**: Horizontal scrolling card layout
- **Navigation**: Direct links to related articles

## Search and Discovery

### Category Navigation
- **Method**: Navbar category links navigate to search page
- **Search Page**: List of articles filtered by selected category
- **Layout**: Landscape article cards in vertical list
- **Header**: Category name displayed as search term subheading

### Topic Search
- **Trigger**: Clicking topic badges or inline bold links
- **Behavior**: Same as category navigation to search page
- **Results**: All articles containing matching topic
- **Display**: Search term shown as subheading above results

### Search Results Page
- **Layout**: Vertical list of landscape article cards
- **Context**: Search term displayed as subheading
- **Content**: Title, excerpt, image, date, category for each result
- **Responsive**: Portrait cards on mobile devices

## Article Card Components

### Card Variants
- **Hero Large**: Left side featured article with full details
- **Hero Small**: Right side featured articles with condensed info
- **Landscape**: Standard list view for desktop search/category pages
- **Portrait**: Mobile-optimized and post-article suggestions

### Card Content
- **Title**: Article headline with proper truncation
- **Excerpt**: Brief article summary for preview
- **Image**: Generated or default article image
- **Date**: Publication timestamp
- **Category**: Content classification badge
- **Responsive**: Adapts layout based on screen size

### Card Usage
- **Homepage Hero**: Large + small variants for featured content
- **Desktop Lists**: Landscape cards for category/search results
- **Mobile**: Portrait cards for all list views
- **Suggestions**: Portrait cards for related content sections

## User Engagement

### Authentication Integration
- **Sign-in Requirement**: Comments require user authentication
- **Redirect Flow**: Unauthenticated users redirected to sign-in page
- **User Avatar**: Displayed in navbar when signed in
- **Guest Access**: Full article reading without authentication

### Comment System
- **Location**: Below sources section, before footer
- **Authentication**: Requires sign-in to comment
- **Moderation**: Admin approval required for comment publication
- **Threading**: Basic comment display with user attribution

### User Profile
- **Profile Page**: Username, password, avatar management
- **Comment History**: List of user's published comments
- **Liked Articles**: Collection of user's liked content
- **Settings**: Account management and preferences

## Visual Design System

### Color Scheme
- **Navbar**: Brand-card background for navigation bar
- **Hero Section**: Brand-primary background for featured content
- **Search Headers**: Brand-primary background for result headings
- **Main Content**: Brand-alt-background (off-white) for article areas
- **Text**: Headline-secondary and body-secondary for readability

### Typography
- **Headlines**: Text-headline-secondary for article titles
- **Body Text**: Text-body-secondary for article content
- **Topic Links**: Bold formatting with hyperlink styling
- **Categories**: Badge-style formatting for classification

### Layout Patterns
- **Light Mode**: Consistent light theme across all public pages
- **Responsive**: Mobile-first design with desktop enhancements
- **Card-Based**: Consistent card components for content display
- **Navigation**: Clear category-based browsing structure

## Current Implementation Status

### Existing Features
- **Basic Layout**: Navbar, hero, article feed, footer structure
- **Article Pages**: Full article display with topics and sources
- **Comment System**: User authentication and comment functionality
- **Category Navigation**: Working category-based browsing
- **Topic Search**: Functional topic-based content discovery

### Design Iteration Needs
- **Figma Integration**: Update existing basic design with detailed Figma specifications
- **Card Refinement**: Implement proper card variants for different contexts
- **Visual Polish**: Apply complete design system styling
- **Responsive Enhancement**: Optimize mobile experience

### Future Enhancements
- **Related Articles**: Topic-based content suggestions
- **Advanced Search**: Enhanced discovery mechanisms
- **User Features**: Expanded profile and engagement options
- **Performance**: Optimized loading and infinite scroll
- **SEO**: Enhanced meta tags and search engine optimization

## Technical Integration

### Database Connections
- **Articles**: Display approved articles with full metadata
- **Categories**: Enable category-based navigation and filtering
- **Topics**: Power topic-based search and discovery
- **Comments**: User-generated content with moderation
- **Users**: Authentication and profile management

### Responsive Behavior
- **Breakpoints**: Mobile, tablet, desktop layout variations
- **Card Adaptation**: Portrait vs. landscape based on screen size
- **Navigation**: Hamburger menu for mobile category access
- **Touch Optimization**: Mobile-friendly interaction patterns

### Performance Considerations
- **Image Loading**: Optimized article image display
- **Infinite Scroll**: Efficient content loading for large article lists
- **Caching**: Strategic content caching for improved speed
- **SEO**: Proper meta tags and structured data for search engines