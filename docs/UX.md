# UX Design System

## Design Tokens

### Brand Colors
- **Primary**: `--brand-primary` (green-600) - Main brand accent, success states
- **Primary Button**: `--brand-primary-button` (blue-600) - Main action buttons
- **Secondary Button**: `--brand-secondary-button` (green-800) - Secondary actions

### Background Colors
- **Brand Background**: `--brand-background` (zinc-950) - Main admin interface background
- **Brand Card**: `--brand-card` (zinc-800) - Standard card containers, sidebar selected
- **Brand Card Dark**: `--brand-card-dark` (zinc-900) - Item cards, modal backgrounds
- **Alt Background**: `--brand-alt-background` (zinc-100) - Public website background
- **Alt Card**: `--brand-alt-card` (white) - Public website cards

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
  - **Pending**: `--indicator-pending` left border
  - **Approved**: `--indicator-approved` left border  
  - **Rejected**: `--indicator-rejected` left border
  - **Drafts**: `--indicator-drafts` left border
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

## Layout Patterns

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

## Interaction Patterns

### Tab System
- **Active State**: `brand-secondary-button` background, `headline-primary` text
- **Inactive State**: No background, `body-greyed-out` text
- **Hover State**: `headline-primary` text color
- **Responsive**: Horizontally scrollable on mobile

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

### Figma Links
- **[Admin Dashboard Layout](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-5043&t=qDk6WcgOLP0HMkjl-1)** - Overall admin interface structure

### Create RSS Source Flow
2. **[Empty RSS section](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4815&t=qDk6WcgOLP0HMkjl-1)** - Empty RSS section showing no sources
3. **[Create RSS source modal](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4839&t=qDk6WcgOLP0HMkjl-1)** - Feed details input form
4. **[RSS source created](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4978&t=qDk6WcgOLP0HMkjl-1)** - New RSS source appears in list

### Create Research Source Flow
2. **[Empty Research section](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4823&t=qDk6WcgOLP0HMkjl-1)** - Empty Research section showing no sources
3. **[Create Research source modal](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4923&t=qDk6WcgOLP0HMkjl-1)** - Enter URL or title to be researched
4. **[Research source created](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-5015&t=qDk6WcgOLP0HMkjl-1)** - New Research source appears in list

### Create YouTube Source Flow
1. **[Empty Youtube section](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4831&t=qDk6WcgOLP0HMkjl-1)** - Empty YouTube section showing no sources
2. **[Create YouTube source modal](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4880&t=qDk6WcgOLP0HMkjl-1)** - Video URL and timecode input
3. **[YouTube source created](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4987&t=qDk6WcgOLP0HMkjl-1)** - New source appears in list

### Create Queue
- **[Create Queue Layout](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4721&t=qDk6WcgOLP0HMkjl-1)** - Shared Queue for all created sources

### Review Workflow
- **[Review Pending Tab](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5471&t=85oVoQlA9tmvqKG3-1)** - Pending articles awaiting review
- **[Review Approved Tab](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5491&t=85oVoQlA9tmvqKG3-1)** - Published articles
- **[Review Drafts Tab](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5511&t=85oVoQlA9tmvqKG3-1)** - Draft articles in progress
- **[Review Rejected Tab](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-6107&t=85oVoQlA9tmvqKG3-1)** - Rejected articles
- **[Article Preview Page](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5596&t=85oVoQlA9tmvqKG3-1)** - Live article preview with editorial actions
- **[Article Edit Page](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5531&t=85oVoQlA9tmvqKG3-1)** - Field editing and image generation integration
- **[Image Generation Page](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5567&t=85oVoQlA9tmvqKG3-1)** - Prompt selection and DALL-E workflow

## Implementation Guidelines

### Color Usage
- Always use semantic variables, never hardcoded hex values
- Follow established hierarchy: headline-primary > body-primary > body-greyed-out
- Use status colors consistently across similar components
- Maintain proper contrast ratios for accessibility

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

### Responsive Design
- Mobile-first approach with progressive enhancement
- Test all interactions on touch devices
- Ensure adequate tap targets (minimum 44px)
- Use appropriate font sizes for different screen sizes

## Responsive Design Guidelines

### Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

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

For detailed visual specifications, refer to the Figma designs:

### Admin Dashboard
- **[Admin Dashboard Layout](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-5043&t=qDk6WcgOLP0HMkjl-1)** - Overall admin interface structure

### Create RSS Source Flow
2. **[Empty RSS section](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4815&t=qDk6WcgOLP0HMkjl-1)** - Empty RSS section showing no sources
3. **[Create RSS source modal](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4839&t=qDk6WcgOLP0HMkjl-1)** - Feed details input form
4. **[RSS source created](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4978&t=qDk6WcgOLP0HMkjl-1)** - New RSS source appears in list

### Create Research Source Flow
2. **[Empty Research section](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4823&t=qDk6WcgOLP0HMkjl-1)** - Empty Research section showing no sources
3. **[Create Research source modal](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4923&t=qDk6WcgOLP0HMkjl-1)** - Enter URL or title to be researched
4. **[Research source created](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-5015&t=qDk6WcgOLP0HMkjl-1)** - New Research source appears in list

### Create YouTube Source Flow
1. **[Empty Youtube section](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4831&t=qDk6WcgOLP0HMkjl-1)** - Empty YouTube section showing no sources
2. **[Create YouTube source modal](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4880&t=qDk6WcgOLP0HMkjl-1)** - Video URL and timecode input
3. **[YouTube source created](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4987&t=qDk6WcgOLP0HMkjl-1)** - New source appears in list

### Create Queue
- **[Create Queue Layout](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=280-4721&t=qDk6WcgOLP0HMkjl-1)** - Shared Queue for all created sources

### Review Workflow
- **[Review Pending Tab](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5471&t=85oVoQlA9tmvqKG3-1)** - Pending articles awaiting review
- **[Review Approved Tab](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5491&t=85oVoQlA9tmvqKG3-1)** - Published articles
- **[Review Drafts Tab](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5511&t=85oVoQlA9tmvqKG3-1)** - Draft articles in progress
- **[Review Rejected Tab](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-6107&t=85oVoQlA9tmvqKG3-1)** - Rejected articles
- **[Article Preview Page](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5596&t=85oVoQlA9tmvqKG3-1)** - Live article preview with editorial actions
- **[Article Edit Page](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5531&t=85oVoQlA9tmvqKG3-1)** - Field editing and image generation integration
- **[Image Generation Page](https://www.figma.com/design/cbb3NHa8gC0ho3iTt2wEvs/Mo-Headlines?node-id=313-5567&t=85oVoQlA9tmvqKG3-1)** - Prompt selection and DALL-E workflow

## Component Consistency
- Always use semantic color variables, never hardcoded values
- Follow established component structure from DEVELOPMENT.md
- Implement proper loading and error states for all interactive components
- Ensure accessibility with proper contrast ratios and focus indicators 