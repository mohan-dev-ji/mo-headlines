# Mo Headlines - AI-Verified Tech News Platform

## Project Overview

**Mission:** Deliver AI-verified tech news by automatically fact-checking stories across multiple sources, ensuring readers get accurate, balanced reporting on breaking developments.

**Core Value Proposition:** Every story is automatically cross-referenced against 3+ sources using AI to identify common facts, eliminate bias, and present balanced perspectives - solving the problem of conflicting reports and misinformation in fast-moving tech news.

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

**Design Tokens & Semantic Variables:**
- Hard coded in /globals.css
- Tokenized in /tailwind.config.js
- Always use design tokens for styling all UI elements

**Color Palettes and Scaling:**
- Brand colors
- Text colors
- Border colors
- Spacing tokens
- Typography scale

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