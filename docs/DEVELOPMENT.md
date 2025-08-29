# Development Guidelines

## Code Standards

### TypeScript Requirements
- All components, functions, and API routes use TypeScript
- Strict type definitions required - no `any` types
- Use const assertions for better type inference
- Define clear interfaces for component props

### 🚨 **CRITICAL: Always Fix TypeScript Errors**
**NEVER leave TypeScript errors unresolved after coding.**

1. **Run `npx tsc --noEmit --project .` after every coding session**
2. **Convex API breaks** if `/convex/` files have TS errors
3. **Add explicit types** instead of letting TypeScript infer `any`
4. **Fix ID type mismatches** with proper `Id<"table">` or `as string` casting
5. **Check imports/exports** are correctly named and paths are valid

### Component Structure
- Follow consistent organization: hooks → derived state → handlers → early returns → JSX
- Handle loading and error states in all data components
- Use early returns for conditional rendering
- Implement proper error boundaries

### Naming Conventions
- **Components**: PascalCase (`CreateRssModal`, `ProducerCard`, `ImagesGallery`, `EditPromptModal`)
- **Files**: kebab-case matching component names (`create-rss-modal.tsx`, `images-gallery.tsx`, `edit-prompt-modal.tsx`)
- **Functions**: camelCase (`handleFormSubmit`, `validateRssUrl`, `updateImageRating`, `editPromptText`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS`, `MAX_QUEUE_SIZE`, `IMAGE_RATINGS`, `PROMPT_SOURCES`)
- **Types**: PascalCase (`CreateRssFormData`, `QueueItem`, `ImageMetadata`, `PromptSource`)

## State Management

### Convex Patterns
- Use reactive queries for real-time data fetching
- Always handle undefined (loading) and null (error) states
- Use conditional queries with "skip" for optional data
- Follow naming convention: queries (`get*`, `list*`), mutations (`create*`, `update*`), actions (`process*`)

### Form Management
- Use React Hook Form with Zod schemas for all forms
- Centralize schema definitions in `/lib/schemas/`
- Implement proper error handling and loading states
- Reset forms on successful submission

### Component State
- Use `useState` for simple local state
- Use `useReducer` for complex state with multiple actions
- Use `useMemo` and `useCallback` for performance optimization
- Avoid unnecessary re-renders with React.memo

## Error Handling

### API Routes
- Return structured error responses with consistent format
- Include error codes and timestamps for debugging
- Handle Zod validation errors specifically
- Log errors for monitoring

### Component Errors
- Implement error boundaries for admin sections
- Provide retry mechanisms for failed operations
- Show specific error messages to users
- Handle network timeouts gracefully

## File Organization

### Project Structure
```
/app
  /admin           # Admin dashboard pages
    /create        # Create workflow pages
    /review        # Review workflow pages
    /images        # Images workflow pages
  /(public)        # Public website pages

/components
  /admin
    /create
      /rss         # RSS-specific components
      /research    # Research components
      /youtube     # YouTube components
      /shared      # Shared create components
    /review
      /pending     # Pending review components
      /approved    # Approved components
      /rejected    # Rejected components
      /drafts      # Draft components
      /shared      # Shared review components
    /images
      /gallery     # Image grid and filtering components
      /detail      # Individual image page components 
      /shared      # Image workflow utilities
    /shared        # Cross-workflow components
      /prompts     # Prompt editing and management components
      /addimage    # Add Image components for article editing and image gallery
      /sidebar     # Admin interface sidebar
  /public          # Public website components
  /ui              # shadcn/ui components

/lib
  /schemas         # Zod validation schemas
  /utils           # Utility functions
  /types           # Shared TypeScript types
  /constants       # App constants

/convex
  /create          # Create workflow functions
  /review          # Review workflow functions
  /images          # Images workflow functions
  /prompts         # Prompts workflow functions
  /shared          # Shared functions
```

### Import Organization
1. React and Next.js imports
2. External libraries (alphabetical)
3. Internal utilities and types
4. Components (alphabetical)
5. Convex imports (last)

## Performance Guidelines

### Optimization Patterns
- Use React.memo for expensive components
- Use useCallback for event handlers passed to children
- Use useMemo for expensive calculations
- Minimize component re-renders

### Image Handling
- Leverage Cloudflare CDN for optimal image delivery
- Implement proper loading states for image grids
- Use appropriate image sizes for thumbnails vs. full display
- Handle failed image loads gracefully

### Data Relationships
- Use efficient queries for normalized data (articles → prompts → images)
- Implement proper indexing for prompt and image filtering
- Cache frequently accessed prompt patterns
- Optimize gallery queries with pagination

### Security Practices
- Validate all inputs with Zod schemas
- Sanitize user-generated content including prompts
- Validate environment variables
- Use proper authentication checks
- Secure Cloudflare Workers bucket access
- Validate prompt content before API calls

## Development Workflow

### Code Quality Standards
- TypeScript types properly defined
- Error handling implemented
- Loading states handled
- Components follow established structure
- Imports organized correctly
- Performance considerations addressed
- Security best practices followed

### Component Development
- Build source-specific components rather than generic ones
- Use shared utilities for common patterns
- Maintain design consistency through shared design tokens
- Implement proper validation for each source type
- Follow established patterns for image handling and display
- Normalize prompt data handling across components

### Data Migration Considerations
- Plan careful migration from existing articles table structure
- Remove deprecated fields (imageGenPrompts, imageStorageId) safely
- Migrate existing images to Cloudflare storage with proper metadata
- Ensure data integrity during prompt table population
- Test relationships between articles, prompts, and images thoroughly

### Testing Approach
- Focus on critical user journeys
- Test error states and edge cases
- Validate form submissions and API integrations
- Ensure responsive design works across breakpoints
- Test image upload and display functionality
- Verify prompt editing and generation workflows
- Test data relationships and referential integrity