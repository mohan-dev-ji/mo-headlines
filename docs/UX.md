# UX Design System

## Design File Organization

Design files are organized in `/docs/Design/` with the following structure:
- Each major feature has its own folder
- PNG files are named descriptively (e.g., `home-desktop-badge-filter.png`)
- Flows are numbered sequentially with "flow" in the name(e.g., `01-empty-state.png`, `02-with-content.png`)

### Quick Reference
| Feature | Design Folder Path |
|---------|-------------------|
| Home Page | `/docs/Design/Public/Home/` |
| Article Page | `/docs/Design/Public/Article/` |
| Profile Settings | `/docs/Design/Public/Profile Settings/` |
| Admin Create | `/docs/Design/Admin/Create/` |
| Admin Review | `/docs/Design/Admin/Review/` |
| Admin Image Gallery | `/docs/Design/Admin/Image Gallery/` |
| Add Image Component | `/docs/Design/Admin/Add Image - Component/` |

## Design Tokens

### Brand Identity
- **Product Name**: The Headlines (formerly Mo Headlines)
- **Logo Desktop**: "The Headlines" in Abhaya Libre Medium, 40px
- **Logo Mobile**: "The Headlines" in Abhaya Libre Medium, 24px (logo-sm)
- **Typography**: Abhaya Libre Medium for headlines (desktop) and inter for all other text.

### Badge States
- **Active Badge**: `bg-brand-badge-background text-brand-primary`
- **Inactive Badge**: `bg-brand-card text-body-greyed-out`
- **Calendar Icon Badge**: Same styling as other badges, opens modal on mobile
- **Hover State**: Brightness increase, cursor pointer
- **Transition**: 200ms ease-in-out

### Typography Scale
- **Headline Desktop Home**: Abhaya Libre Medium, 40px
- **Headline Desktop Article**: Abhaya Libre Medium, 40px
- **Headline Desktop Profile Settings**: Abhaya Libre Medium, 40px
- **Headline Mobile Home**: Abhaya Libre Medium, 24px
- **Headline Mobile Article**: System font, text-2xl
- **Headline Mobile Profile Settings**: System font, text-2xl
- **Body**: System font, 1rem base
- **Badge Text**: text-base semibold (increased from previous size)

### Brand Colors
- **Primary**: `--brand-primary` (cyan-400) - Main brand accent, success states, selected calendar dates
- **Primary Button**: `--brand-primary-button` (blue-600) - Main action buttons
- **Secondary Button**: `--brand-secondary-button` (green-800) - Secondary actions

### Background Colors
- **Brand Background**: `--brand-background` (zinc-950) - Main admin interface background
- **Brand Card**: `--brand-card` (dark cyan grey) - Standard card containers, sidebar selected
- **Brand Card Dark**: `--brand-card-dark` (zinc-900) - Item cards, modal backgrounds
- **Alt Background**: `--brand-alt-background` (zinc-100) - Public website background
- **Alt Card**: `--brand-alt-card` (white) - Public website cards
- **Badge Background**: `--brand-badge-background` (cyan-950) - home page badge filtering system, selected calendar dates

### Text Colors
- **Headline Primary**: `--headline-primary` (zinc-50) - Main headings on dark backgrounds
- **Headline Secondary**: `--headline-secondary` (zinc-800) - Headings on light backgrounds
- **Body Primary**: `--body-primary` (zinc-300) - Primary text on dark backgrounds
- **Body Secondary**: `--body-secondary` (zinc-400) - Secondary text
- **Body Greyed Out**: `--body-greyed-out` (zinc-600) - Inactive states, placeholders

### Status Indicators
- **Pending**: `--indicator-pending` (zinc-500) - Processing, neutral states
- **Approved**: `--indicator-approved` (green-500) - Success, published content
- **Drafts**: `--indicator-drafts` (amber-500) - Work in progress
- **Rejected**: `--indicator-rejected` (red-500) - Errors, rejected content

### Spacing System
- **Text Spacing**: `--space-between-text` (4px)
- **Item Spacing**: `--space-between-items` (20px)
- **Standard Padding**: `--padding-md` (20px)
- **Large Padding**: `--padding-lg` (32px)
- **Border Radius**: `--radius` (10px)

## Component Design Standards

### Buttons
- **Primary Actions**: Use `brand-primary-button` background
- **Secondary Actions**: Use outline variant with `brand-line` borders
- **Destructive Actions**: Use red-600 background
- **Loading States**: Show spinner and disable interaction
- **Text**: Use `button-white` on colored backgrounds

### Cards
- **Create Workflow**: Use `brand-card` background with `brand-line` borders
- **Review Workflow**: Use `brand-card-dark` background
- **Status Borders**: Apply left border using status indicator colors
- **Hover States**: Subtle background lightening
- **Content Spacing**: Use `padding-md` for standard cards

### Review Workflow Components
- **Review Cards**: Universal card component with status-based border styling
  - **Pending**: `--indicator-pending` full border
  - **Approved**: `--indicator-approved` full border  
  - **Rejected**: `--indicator-rejected` full border
  - **Drafts**: `--indicator-drafts` full border
- **Preview Integration**: Embedded live article page with editorial overlay
- **Edit Interface**: Form-based editing with `brand-card-dark` backgrounds
- **Image Generation Modal**: Multi-step workflow (prompt selection → generation → preview → save)

### Forms & Modals
- **Modal Container**: `brand-card` background with `brand-line` borders
- **Input Fields**: `brand-background` with `brand-line` borders
- **Labels**: `body-primary` color, small text size
- **Error Messages**: Red background with 10% opacity, red border
- **Validation**: Show errors below fields, clear on success
- **Submit States**: Disable buttons and show loading text

### Status Indicators
- **Visual Pattern**: Colored dot + text label
- **Border Usage**: Left border on Review workflow cards
- **Text Colors**: Match indicator colors for consistency
- **Icon Support**: Use emojis for quick visual recognition

## Card Layout Specifications

### Desktop Grid Pattern (4-column layout)
- **Main Content Area**: 3 columns for articles (75% width)
- **Right Column**: 1 column for calendar widget and ad space (25% width)
- **Article Pattern**: 3-row cycle (landscape left, landscape right, 3x portrait)

### Mobile Layout
- **Single Column**: Articles stack vertically
- **Badge Scrolling**: Horizontal scroll container for categories + calendar icon
- **Calendar Access**: Full-screen modal triggered by calendar icon badge

### Card Dimensions
- **Landscape Cards**: 16:9 aspect ratio, image 40% width
- **Portrait Cards**: 1:1 aspect ratio, image 100% width
- **Mobile Cards**: Full width, 16:9 image ratio

## Layout Patterns

### Home Page Layout
- **Desktop**: 4-column grid (3 articles + 1 calendar/ads)
- **Badge Filter**: All categories visible without scrolling
- **Calendar Widget**: Persistent in right column with publication indicators
- **Ad Space**: Reserved area below calendar for future monetization

### Mobile Home Layout
- **Single Column**: Articles stack in mobile-optimized cards
- **Horizontal Badges**: Scrollable container with All, Tech, Science, Finance, Policies, Calendar icon
- **Calendar Modal**: Full-screen date picker with month navigation
- **Progressive Disclosure**: Calendar icon discovered through horizontal scrolling

### Admin Interface Structure
- **Sidebar**: Transparent background showing `brand-background`
- **Selected Items**: `brand-card` background in sidebar
- **Main Content**: `brand-card` background for tab containers
- **Item Cards**: `brand-card-dark` background, stacked vertically

### Responsive Behavior
- **Mobile (< 768px)**: Hamburger menu hides sidebar, cards stack vertically
- **Tablet (768px+)**: Sidebar becomes collapsible, cards transition to horizontal
- **Desktop (1024px+)**: Full sidebar always visible, horizontal card layouts

### Create/Review Workflows
- **Tab System**: Shared component with `brand-secondary-button` for active tabs
- **Card Layout**: Three-column structure (Details | Status | Actions)
- **Vertical Stacking**: On mobile, sections stack with clear separation
- **Content Flow**: Create → Queue → Review → Publish

## Calendar Design System

### Desktop Calendar Widget
- **Container**: `brand-card` background with `brand-line` borders
- **Header**: Month/year display with navigation arrows
- **Grid Layout**: 7-column calendar grid with day labels
- **Publication Indicators**: Dot system showing article density
  - **Single Article**: Small dot (`w-1.5 h-1.5`)
  - **Multiple Articles**: Additional dots or size variations
  - **High Activity**: Multiple dots or enhanced visual treatment
- **Selected Date**: `bg-brand-badge-background text-brand-primary` (cyan-950/cyan-400)
- **Interactive States**: Hover effects for clickable dates
- **Legend**: Shows total article count and indicator meaning

### Mobile Calendar Modal
- **Full Screen**: Maximizes touch target area and visual clarity
- **Header**: Month navigation with swipe gesture support
- **Touch Targets**: Larger calendar grid optimized for mobile interaction
- **Selected State**: Same brand colors as desktop for consistency
- **Close Action**: Clear apply/cancel functionality

### Calendar Integration
- **Visual Consistency**: Selected dates use same styling as active category badges
- **Combined States**: Both category badge and calendar date can be highlighted simultaneously
- **Reset Pattern**: "All" badge clears both category and date filters
- **URL Persistence**: Date selections maintained in URL parameters

## Pagination Design System

### Load More Pattern
- **Button Styling**: Consistent with design system, centered placement
- **Loading States**: Show spinner during content fetch
- **Progress Indication**: Article count display ("Showing 1-10 of 247 articles")
- **Filter Persistence**: Maintains active category and date filters across loads
- **Pattern Continuity**: 3-row card pattern continues seamlessly across pages

### Visual Feedback
- **Loading Animation**: Skeleton cards or spinner indication
- **Content Transitions**: Smooth addition of new article cards
- **End State**: Clear indication when all articles are loaded
- **Error Handling**: Retry functionality for failed loads

## Interaction Patterns

### Tab System
- **Active State**: `brand-secondary-button` background, `headline-primary` text
- **Inactive State**: No background, `body-greyed-out` text
- **Hover State**: `headline-primary` text color
- **Responsive**: Horizontally scrollable on mobile

### Badge Filter System
- **Desktop Layout**: All badges visible (All, Tech, Science, Finance, Policies)
- **Mobile Layout**: Horizontal scroll with calendar icon as final badge
- **Active States**: `bg-brand-badge-background text-brand-primary`
- **Inactive States**: `bg-brand-card text-body-greyed-out`
- **Typography**: text-base semibold for improved visual hierarchy

### Calendar Interactions
- **Desktop**: Direct click on calendar dates
- **Mobile**: Calendar icon badge opens full-screen modal
- **Date Selection**: Immediate filtering with visual feedback
- **Combined Filtering**: Date and category selections work together
- **Reset Functionality**: "All" badge clears both filter types

### Custom Dropdown Solution
- **Problem Solved**: Prevents card remount issues after modal interactions
- **Implementation**: Custom component with independent state management
- **Styling**: `brand-card-dark` background, `brand-line` borders
- **Actions**: Edit, Run Now, Delete with appropriate colors

### Modal Interactions
- **Opening**: Smooth transition, focus management
- **Form Validation**: Real-time validation with clear error states
- **Closing**: Reset form state, preserve data if needed
- **Success**: Show feedback, close modal, refresh data

### Status Display Patterns
- **Dual Indicators**: RSS sources show Feed Status + Category Status
- **Progressive Disclosure**: Show details only when relevant
- **Visual Hierarchy**: Most important status first
- **Consistent Icons**: Use same icons across similar states

## Implementation Guidelines

### Color Usage
- Always use semantic variables, never hardcoded hex values
- Follow established hierarchy: headline-primary > body-primary > body-greyed-out
- Use status colors consistently across similar components
- Maintain proper contrast ratios for accessibility
- Selected calendar dates use same brand colors as active badges

### Form Standards
- Use React Hook Form + Zod for all forms
- Show validation errors below fields
- Disable submit buttons during loading
- Reset forms on successful submission
- Handle both field-level and form-level errors

### Component Consistency
- Follow established spacing scale for all layouts
- Use shared components for common patterns (tabs, status indicators)
- Implement proper loading and error states
- Ensure keyboard navigation works properly
- Maintain visual consistency between calendar and badge selections

### Responsive Design
- Mobile-first approach with progressive enhancement
- Test all interactions on touch devices
- Ensure adequate tap targets (minimum 44px)
- Use appropriate font sizes for different screen sizes
- Horizontal badge scrolling with clear visual indicators

## Responsive Design Guidelines

### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Home Page Responsive Behavior

#### Mobile (< 768px)
- **Layout**: Single column article layout
- **Badges**: Horizontal scroll container with calendar icon at end
- **Calendar**: Full-screen modal with touch-optimized interface
- **Cards**: Stack vertically with mobile-specific styling
- **Padding**: Use `padding-md` (20px)

#### Tablet (768px - 1024px) 
- **Layout**: Transitional layout between mobile and desktop
- **Badges**: May show more badges without scrolling
- **Calendar**: Modal or widget depending on space
- **Cards**: Begin transitioning to horizontal layout
- **Padding**: Use `padding-md` to `padding-lg`

#### Desktop (1024px+)
- **Layout**: 4-column grid (3 articles + 1 calendar/ads)
- **Badges**: All badges visible without scrolling
- **Calendar**: Persistent widget in right column
- **Cards**: Full horizontal layout with 3-row pattern
- **Padding**: Use `padding-lg` (32px)

### Admin Dashboard Responsive Behavior

#### Mobile (< 768px)
- **Sidebar**: Hidden behind hamburger menu
- **Navbar**: Burger menu icon reveals sidebar overlay
- **Cards**: Stack vertically (Details → Status → Actions)
- **Tab system**: Horizontally scrollable
- **Padding**: Use `padding-md` (20px)

#### Tablet (768px - 1024px) 
- **Sidebar**: Collapsible, icons only when collapsed
- **Cards**: Begin transitioning to horizontal layout
- **Tab system**: Full width tabs
- **Padding**: Use `padding-md` to `padding-lg`

#### Desktop (1024px+)
- **Sidebar**: Full width sidebar always visible
- **Cards**: Full horizontal layout (Details | Status | Actions)
- **Tab system**: Full tab interface
- **Padding**: Use `padding-lg` (32px)

## Design References

All design files are stored as PNGs in the `/docs/Design/` directory for Claude Code accessibility.

### Admin Interface Designs
- **Add Image Component**: `/docs/Design/Admin/Add Image - Component/`
- **Create RSS Producer**: `/docs/Design/Admin/Create/RSS`
- **Create YouTube Producer**: `/docs/Design/Admin/Create/YouTube`
- **Create Research Producer**: `/docs/Design/Admin/Create/Research`
- **Create Shared Queue**: `/docs/Design/Admin/Create/Queue`
- **Image Gallery**: `/docs/Design/Admin/Image Gallery/`
- **Review Workflow**: `/docs/Design/Admin/Review/`

### Public Website Designs
- **Article Page**: `/docs/Design/Public/Article/`
- **Home Page**: `/docs/Design/Public/Home/`
- **Profile Settings**: `/docs/Design/Public/Profile Settings/`

### Component Specifications

#### Home Page Components
**Design Files**: `/docs/Design/Public/Home/`
- Badge filter system with horizontal scrolling and calendar icon
- 4-column desktop layout with calendar widget
- Article cards in 3-row pattern layout
- Mobile-specific card designs with full-screen calendar modal

#### Calendar Components
**Design Files**: Calendar designs integrated within home page designs
- Desktop widget with publication indicators and dot system
- Mobile full-screen modal with month navigation
- Brand-consistent selected states (cyan-400/cyan-950)
- Combined filtering visual states

#### Article Page Components
**Design Files**: `/docs/Design/Public/Article/`
- Responsive image placement
- Source cards carousel
- More Headlines section

#### Profile Settings Components
**Design Files**: `/docs/Design/Public/Profile Settings/`
- Tab system for Comments/Liked Posts
- User activity cards

## Component Consistency
- Always use semantic color variables, never hardcoded values
- Follow established component structure from DEVELOPMENT.md
- Implement proper loading and error states for all interactive components
- Ensure accessibility with proper contrast ratios and focus indicators
- Maintain visual consistency between calendar selections and badge filters
- Use consistent publication indicators across desktop and mobile calendar interfaces