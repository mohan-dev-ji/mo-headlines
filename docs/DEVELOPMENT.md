# Development Guidelines

## Code Standards

### TypeScript
- All code uses TypeScript with strict types
- No `any` types allowed
- Run `npx tsc --noEmit --project .` after coding
- Fix all TypeScript errors before committing

### Component Structure
- Consistent organization: hooks → state → handlers → JSX
- Handle loading and error states
- Use early returns for conditionals
- Implement error boundaries

### Naming Conventions
- **Components**: PascalCase
- **Files**: kebab-case
- **Functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types**: PascalCase

## State Management

### Convex
- Use reactive queries for data fetching
- Handle undefined (loading) and null (error) states
- Query naming: `get*`, `list*`, mutations: `create*`, `update*`

### Forms
- React Hook Form with Zod schemas
- Centralize schemas in `/lib/schemas/`
- Handle errors and loading states
- Reset forms on success

### Component State
- `useState` for simple state
- `useReducer` for complex state
- `useMemo`/`useCallback` for optimization

## Error Handling

### API Routes
- Structured error responses
- Include error codes and timestamps
- Handle Zod validation errors
- Log errors for monitoring

### Components
- Error boundaries for admin sections
- Retry mechanisms for failed operations
- Specific error messages
- Handle network timeouts

## File Organization

### Project Structure
- `/app` - Pages (admin and public)
- `/components` - All React components
- `/lib` - Schemas, utils, types, constants
- `/convex` - Backend functions

### Import Organization
1. React and Next.js
2. External libraries
3. Internal utilities and types
4. Components
5. Convex imports

## Performance
- React.memo for expensive components
- useCallback for event handlers
- useMemo for calculations
- Minimize re-renders

## Security
- Validate inputs with Zod schemas
- Sanitize user content
- Validate environment variables
- Proper authentication checks

## Quality Standards
- TypeScript types defined
- Error handling implemented
- Loading states handled
- Imports organized correctly

## Troubleshooting

### Common Issues
- **TypeScript errors**: Run `npx tsc --noEmit` to check
- **Convex API breaks**: Fix TS errors in `/convex/` files
- **Component not rendering**: Check loading/error states
- **Form validation**: Verify Zod schema matches form fields

### Build Issues
- Clear `.next` folder and rebuild
- Check environment variables are set
- Verify all imports are correct
- Run TypeScript check before build