# Development Guidelines

## Code Standards

### TypeScript Requirements
- All components, functions, and API routes use TypeScript
- Strict type definitions required - no `any` types
- Use const assertions for better type inference
- Define clear interfaces for component props

### Component Structure
- Follow consistent organization: hooks → derived state → handlers → early returns → JSX
- Handle loading and error states in all data components
- Use early returns for conditional rendering
- Implement proper error boundaries

### Naming Conventions
- **Components**: PascalCase (`CreateRssModal`, `ProducerCard`)
- **Files**: kebab-case matching component names (`create-rss-modal.tsx`)
- **Functions**: camelCase (`handleFormSubmit`, `validateRssUrl`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS`, `MAX_QUEUE_SIZE`)
- **Types**: PascalCase (`CreateRssFormData`, `QueueItem`)

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
    /shared        # Cross-workflow components
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

### Security Practices
- Validate all inputs with Zod schemas
- Sanitize user-generated content
- Validate environment variables
- Use proper authentication checks

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

### Testing Approach
- Focus on critical user journeys
- Test error states and edge cases
- Validate form submissions and API integrations
- Ensure responsive design works across breakpoints