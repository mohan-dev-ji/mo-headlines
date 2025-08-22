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
- **Previous**: New architecture with shared queue implemented ✅
- **Current Issues**:
  1. **AI Topic Selection**: Perplexity is selecting 2-word proper nouns ("Acrobat Studio", "Adobe Express") - need single-word only
  2. **Bulk Processing**: Dropdown filter bulk processing not working in create queue
- **Priority Order**:
  1. Fix AI prompt to only select single-word proper noun topics
  2. Fix bulk processing from dropdown filter in create queue
  3. Fix queue stats display (currently shows "loading")
  4. Implement deduplication functionality for queue items
  5. Complete search and filter functionality

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