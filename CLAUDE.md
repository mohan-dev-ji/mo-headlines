# Mo Headlines - AI-Verified Tech News Platform

## 📖 Documentation Hub
All project documentation is centralized in `/docs/`:
- **Start here**: [Documentation Index](docs/INDEX.md)
- **Architecture**: [System Design](docs/ARCHITECTURE.md) 
- **Development**: [Guidelines & Patterns](docs/DEVELOPMENT.md)
- **Features**: [Create & Review Workflows](docs/FEATURES.md)
- **Components**: [Admin & Public Components](docs/COMPONENTS.md)

## 🎯 Current Development Phase
- **Phase**: Create Queue UI Implementation (ADR 2)
- **Previous**: AI processing with proper noun topics completed ✅
- **Current Focus**: Build complete queue management interface with filters, stats, and batch operations
- **Priority Order**:
  1. Fix queue stats display (currently shows "loading")
  2. Implement deduplication functionality for queue items
  3. Build batch processing operations (bulk delete, bulk process)
  4. Complete search and filter functionality
  5. Test all queue management features end-to-end

## 🔧 Implementation Context

### Architecture Decisions
- **ADR 1**: Workflow-based admin (Create → Review) ✅ Accepted
- **ADR 2**: Universal queue processing ✅ Accepted
- See [ADR Documentation](docs/adr/README.md) for full rationale

## 🚨 **Development Rule: Zero TypeScript Errors**
Always run `npx tsc --noEmit --project .` and fix ALL errors after coding. TypeScript errors in `/convex/` files break API generation.

---

**Tech Stack**: Next.js 15.3, Convex, Clerk, Perplexity API  
**Last Updated**: August 2025