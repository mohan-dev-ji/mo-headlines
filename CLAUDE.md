# Mo Headlines - AI-Verified Tech News Platform

## Project Overview

**Mission:** Deliver AI-verified tech news by automatically fact-checking stories across multiple sources, ensuring readers get accurate, balanced reporting on breaking developments.

**Core Value Proposition:** Every story is automatically cross-referenced against 3+ sources using AI to identify common facts, eliminate bias, and present balanced perspectives - solving the problem of conflicting reports and misinformation in fast-moving tech news.

**Target Users:**
- Primary: Tech professionals (developers, PMs, investors) needing accurate news quickly
- Secondary: Tech enthusiasts tired of clickbait and conflicting reports
- Use cases: Morning briefings, work research, staying informed without doom-scrolling

## Technical Stack

**Frontend:**
- Next.js 15.3 (App Router)
- React with TypeScript
- Tailwind CSS + Radix UI + shadcn/ui
- Lucide React (icons)
- Zod (validation)

**Backend & Database:**
- Convex (database & backend functions)
- Clerk (authentication)
- Perplexity Pro API (AI research)
- rss-parser (RSS feed processing)

**Infrastructure:**
- Hosting: Vercel
- File Storage: Convex file storage

## Design System

### Design Tokens & Semantic Variables


**Color Palette:**
*Semantic design tokens based on Tailwind CSS:*

```css
/* Brand Colors */
--brand-primary: theme('colors.green.600');
--brand-primary-button: theme('colors.blue.600'); /* Fixed: was referencing invalid theme.primary */
--brand-secondary-button: theme('colors.green.800');

/* Background Colors */
--brand-background: theme('colors.zinc.950');
--brand-alt-background: theme('colors.zinc.100');
--brand-card: theme('colors.zinc.800');
--brand-card-dark: theme('colors.zinc.900');
--brand-alt-card: theme('colors.white');

/* Border/Line Colors */
--brand-line: theme('colors.zinc.500');
--brand-alt-line: theme('colors.zinc.300');

/* Text Colors */
--headline-primary: theme('colors.zinc.50');
--headline-secondary: theme('colors.zinc.800');
--body-primary: theme('colors.zinc.300');
--body-secondary: theme('colors.zinc.600');
--body-greyed-out: theme('colors.zinc.400');
--button-black: theme('colors.black');
--button-white: theme('colors.white');

/* Interactive State Colors (add to your existing list) */
--error-red: theme('colors.red.600');
--warning-yellow: theme('colors.yellow.500');
--info-blue: var(--brand-primary-button);

/* Hover States */
--brand-primary-button-hover: theme('colors.blue.700');
--brand-primary-hover: theme('colors.green.700');
```

**Spacing Tokens:**
*Custom spacing values for consistent layout:*

```css
/* Border & Layout */
--radius: 8px;
--border-width: 1px;

/* Spacing Scale */
--space-between-text: 4px;    /* 1 in Tailwind scale */
--space-between-items: 20px;   /* 5 in Tailwind scale */
--padding-md: 20px;           /* 5 in Tailwind scale */
--padding-lg: 32px;           /* 8 in Tailwind scale */
```

**Typography Scale:**
*Using Inter font family with Tailwind's text sizing system:*

```css
/* Font Family */
--font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;

/* Typography Classes (use Tailwind directly) */
/* Headlines: text-4xl, text-3xl, text-2xl, text-xl */
/* Body Text: text-lg, text-base, text-sm */
/* Captions: text-xs */

/* Custom Typography Utilities */
.text-headline-1 { @apply text-4xl font-bold leading-tight; }
.text-headline-2 { @apply text-3xl font-semibold leading-tight; }
.text-headline-3 { @apply text-2xl font-semibold leading-snug; }
.text-headline-4 { @apply text-xl font-medium leading-snug; }
.text-body-lg { @apply text-lg leading-relaxed; }
.text-body-md { @apply text-base leading-normal; }
.text-body-sm { @apply text-sm leading-normal; }
.text-caption { @apply text-xs leading-tight; }
```

**Spacing Scale:**
*Using Tailwind's default scale (4px base) - update if Figma uses different values:*
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px
- `space-16`: 64px

### RSS Component Color Mapping
```css
/* Modal Components */
Modal background: var(--brand-card)
Modal overlay: rgba(0, 0, 0, 0.75)
Form inputs: var(--brand-background) with var(--brand-line) border

/* Interactive Elements */  
Primary buttons: var(--brand-primary-button)
Success states: var(--brand-primary)
Toggle switches: var(--brand-primary-button) when active
Step indicators: var(--brand-primary-button) when active, var(--body-greyed-out) when inactive

/* Text Hierarchy */
Modal titles: var(--headline-primary) with .text-headline-3
Form labels: var(--body-primary) with .text-body-sm
Input text: var(--headline-primary) with .text-body-md
Button text: var(--button-white) with .text-body-sm
```

### Component Design Standards

**Buttons:**
- Primary: Main actions (Publish, Save, Create)
- Secondary: Secondary actions (Cancel, Edit)
- Outline: Tertiary actions (View, Filter)
- Ghost: Minimal actions (Close, More options)
- Destructive: Delete, Remove actions

**Cards:**
- Default: Standard content containers
- Elevated: Highlighted content (featured articles)
- Outlined: Secondary content areas

**Form Elements:**
- Default state: Clean, accessible inputs
- Focus state: Clear focus indicators
- Error state: Red borders with error messages
- Disabled state: Muted appearance

**Status Indicators:**
- Success: Green variants for approved content
- Warning: Yellow variants for pending review
- Error: Red variants for rejected/failed content
- Info: Blue variants for informational content

### Layout Standards

**Responsive Breakpoints:**
- Mobile: 375px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

**Grid System:**
- Use CSS Grid for complex layouts
- Flexbox for component-level alignment
- Consistent gutters: 16px mobile, 24px tablet, 32px desktop

**Animation Standards:**
- Hover transitions: 150ms ease-in-out
- Page transitions: 300ms ease-out
- Loading states: Consistent Lottie animation across all components
- Micro-interactions: 200ms for feedback

**Loading States:**
- **Always use `LoadingAnimation` component** for all loading states throughout the project
- **Location**: `/components/ui/loading-animation.tsx` - centralized, reusable component
- **Animation Source**: `/public/animations/loading_gray.json` - Lottie animation file
- **Implementation**: `<LoadingAnimation size={60} className="py-8" />`
- **Sizes**: Adjust size prop based on context (40px for small, 60px for medium, 80px for large areas)
- **No CSS Fallbacks**: Component prevents flash by showing empty space while loading, only shows CSS spinner on error
- **Global Caching**: Animation data is cached globally to prevent re-fetching and ensure smooth performance
- **Replace All**: Never use "Loading..." text, skeleton animations, or custom spinners - always use LoadingAnimation

## RSS Categories & Keywords

The system uses 5 predefined categories with 10 keywords each for RSS article filtering:
- **AI & Machine Learning** (ai-ml)
- **Startups & Funding** (startups-funding) 
- **Big Tech & Platforms** (big-tech)
- **Science & Research** (science-research)
- **Electric Vehicles** (electric-vehicles)

Categories are managed via seedCategories script and stored in Convex with keywords for enhanced filtering accuracy.

## Core Features & Architecture

### 1. RSS Source Management
- Admin creates RSS Producer with polling frequency
- System automatically polls feeds for new articles
- Articles filtered by category and processed through AI pipeline

### 2. AI Fact-Checking Pipeline
1. RSS item selected for processing
2. Perplexity API searches for 3+ related articles
3. AI synthesizes common themes using custom prompts
4. Generated article stored for admin review
5. Admin approves/edits/rejects before publishing

### 3. User Experience
- Browse latest verified headlines
- Filter by categories and topic tags
- Read full synthesized articles with source citations
- Comment and like system (requires authentication)
- User profiles with comment/like history

### 4. Admin Dashboard
- RSS source creation and management
- Article review and approval workflow
- Analytics and performance metrics
- Settings configuration
- Prompt management for AI generation

## Development Methodology

  ### Incremental Development Approach
  Always follow this step-by-step process when implementing new features:

  1. **Start Small**: Build one component/function at a time
  2. **Test Each Piece**: Verify functionality before proceeding
  3. **Get Feedback**: Confirm direction meets requirements
  4. **Iterate & Improve**: Fix issues immediately as found
  5. **Build Incrementally**: Layer on functionality piece by piece

  ### Implementation Workflow
  For any new feature:
  1. Plan the feature in small, testable chunks
  2. Implement the first piece (usually basic structure/layout)
  3. Test thoroughly and get user feedback
  4. Fix any issues before moving forward
  5. Implement the next logical piece
  6. Repeat until feature is complete

  ### Benefits
  - Catch issues early before they compound
  - Allow for course corrections at each step
  - Ensure each piece works before building on it
  - Maintain code quality throughout development
  - Enable real-time feedback and adjustments

  ### Example: RSS Feature
  ❌ **Wrong**: Build entire RSS system (layout + forms + parsing + UI) at once
  ✅ **Right**:
     1. Basic admin layout → test
     2. RSS page structure → test
     3. Form without parsing → test
     4. Add RSS parsing → test
     5. Add UI polish → test

## Database Schema (Convex)

```typescript
// Core content tables
articles: {
  _id: Id<"articles">
  title: string
  content: string
  imageStorageId?: Id<"_storage">
  excerpt?: string
  category: string
  topics: string[]
  status: "draft" | "pending" | "approved" | "rejected"
  isAutoGenerated: boolean
  isEdited: boolean
  sourceUrls: string[]
  rssSourceOrigin: string[]
  viewCount: number
  publishedAt?: number
  createdAt: number
  updatedAt: number
  authorId?: Id<"users">
  slug: string
}

rss_sources: {
  _id: Id<"rss_sources">
  name: string
  url: string
  category: string
  isActive: boolean
  pollFrequency: number
  numberOfArticles: number
  lastPolled?: number
  createdAt: number
}

rss_items: {
  _id: Id<"rss_items">
  sourceId: Id<"rss_sources">
  title: string
  description: string
  url: string
  publishedAt: number
  processed: boolean
  createdAt: number
}

// User interaction tables
comments: {
  _id: Id<"comments">
  articleId: Id<"articles">
  userId: string
  content: string
  createdAt: number
  updatedAt?: number
  isApproved: boolean
}

users: {
  _id: Id<"users">
  clerkId: string
  username?: string
  createdAt: number
  updatedAt?: number
}

// Configuration tables
categories: {
  _id: Id<"categories">
  name: string
  description: string
  slug: string
  isActive: boolean
}

topics: {
  _id: Id<"topics">
  name: string
  category: string
  slug: string
  isActive: boolean
}

prompts: {
  _id: Id<"prompts">
  type: "research" | "synthesis" | "factcheck"
  content: string
  isActive: boolean
  createdAt: number
  updatedAt?: number
}
```

## Page Structure & Routing

**Public Pages:**
- `/` - Home page with latest headlines
- `/article/[slug]` - Individual article view with comments
- `/search/[category]` - Filtered articles by category/topic
- `/profile/[userId]` - User profile with comments and liked articles

**Admin Dashboard (`/admin/`):**
- `/admin/rss-sources` - Create and manage RSS sources
- `/admin/articles` - Review, approve, edit generated articles
- `/admin/analytics` - Performance metrics and insights
- `/admin/settings` - System configuration
- `/admin/prompts` - Manage AI prompts

## Development Guidelines

### Design System Implementation Rules

1. **Color Usage:**
   - Always use semantic color variables, never hardcoded hex values
   - Use `--text-primary` instead of `--neutral-900`
   - Use `--background-elevated` instead of `--neutral-50`

2. **Typography:**
   - Apply typography tokens consistently: `--text-h1`, `--text-body-md`
   - Never use arbitrary font sizes outside the design system
   - Maintain proper hierarchy: H1 > H2 > H3 > Body > Caption

3. **Spacing:**
   - Use design system spacing scale exclusively
   - Consistent component padding/margins across similar elements
   - Responsive spacing: smaller values on mobile, larger on desktop

4. **Component Variants:**
   - Implement all designed states: default, hover, focus, disabled
   - Use semantic naming for variants that matches their purpose
   - Ensure accessibility compliance (proper contrast, focus indicators)

### UI Component Philosophy: Simplicity Over Complexity

**Rule: When a third-party UI component has known issues, build a custom solution instead of complex workarounds.**

**Principle:** Always choose the simplest solution that works reliably.

**Examples:**
- ✅ **Good:** Build custom dropdown with basic div + state when Radix DropdownMenu has remounting issues
- ❌ **Bad:** Write complex key manipulation, forced remounting, useEffect chains to fix library issues
- ✅ **Good:** Create simple custom components with full control over behavior
- ❌ **Bad:** Layer multiple abstractions to work around library limitations

**Benefits:**
- Predictable behavior - you control every aspect
- Easier debugging - no black box library behavior
- Better performance - no unnecessary complexity
- Maintainable code - future developers understand the logic
- Reusable components - custom solutions can be designed for your specific needs

**When to Apply:**
- Library component has mysterious bugs or issues
- Workaround code becomes more complex than building from scratch
- Component behavior is unpredictable or hard to debug
- Multiple attempts to fix library issues have failed

### Code Style & Patterns

**TypeScript First:** All components, functions, and API routes must use TypeScript with proper type definitions.

**Component Structure:**
```typescript
interface ComponentProps {
  // Define all props with types
}

export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 1. Hooks (useState, useEffect, custom hooks)
  // 2. Derived state and computed values
  // 3. Event handlers
  // 4. Early returns for loading/error states
  // 5. Main JSX return
}
```

**Naming Conventions:**
- Components: PascalCase (`ArticleCard`, `RssSourceForm`)
- Files: kebab-case (`article-card.tsx`, `rss-source-form.tsx`)
- Functions: camelCase (`handleSubmit`, `fetchArticles`)
- Constants: SCREAMING_SNAKE_CASE (`API_ENDPOINTS`, `MAX_ARTICLES`)

### File Organization

```
/app
  /(auth)           # Auth-related pages
  /(public)         # Public pages
  /admin           # Admin dashboard
  /api             # API routes
  /globals.css     # Global styles
  /layout.tsx      # Root layout
/components
  /ui              # shadcn/ui components
  /admin           # Admin-specific components
  /public          # public, website related components
/lib
  /convex          # Convex utilities
  /utils.ts        # General utilities
  /types.ts        # Shared TypeScript types
/convex            # Convex schema and functions
```

### State Management

**Convex Queries:** Use Convex's reactive queries for real-time data fetching
```typescript
const articles = useQuery(api.articles.getPublished);
```

**Form State:** Use React Hook Form with Zod schemas
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {...}
});
```

**Component State:** useState for local component state, useEffect for side effects

### Error Handling

**API Routes:** Always return structured error responses
```typescript
return NextResponse.json(
  { error: "Descriptive error message", code: "ERROR_CODE" },
  { status: 400 }
);
```

**Components:** Implement error boundaries and loading states
```typescript
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

## Category Management

### Development-Level Category Control

Categories are managed through a seed script system that provides full control at the development level:

**Predefined Categories:**
- AI
- Robotics  
- Biotech
- Crypto
- EVs

**Managing Categories:**

1. **Clear All Categories**: Edit `convex/clearAllCategories.ts` Just deletion (rarely needed)
2. **Seed Categories**: Run `npm run seed:categories` Smart, safe updates (recommended)
3. **Reset Categories**: Run `npm run reset:categories` Nuclear option - complete replacement

**Schema**: Categories have `name`, `slug`, `isActive`, and `createdAt` fields.

**Safety Features:**
- Requires authentication to run seed scripts
- Seed script skips existing categories by default
- Reset requires explicit confirmation
- All operations are logged

### Security & Performance

**Authentication:** 
- Use Clerk