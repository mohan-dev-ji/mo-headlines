# Mo Headlines - AI-Verified Tech News Platform

## 📖 Documentation Hub
All project documentation is centralized in `/docs/`:
- **Start here**: [Documentation Index](docs/INDEX.md)
- **Architecture**: [System Design](docs/ARCHITECTURE.md) 
- **Development**: [Guidelines & Patterns](docs/DEVELOPMENT.md)
- **Features**: [Create & Review Workflows](docs/FEATURES.md)
- **Components**: [Admin & Public Components](docs/COMPONENTS.md)

## 🎯 Current Development Phase
- **Phase**: Create Queue UI Polish (ADR 2)
- **Previous**: New architecture with shared queue implemented ✅
- **Current Tasks**:
  1. **RSS UI Cleanup**: Remove development "Clear Tables" button from RSS section
  2. **RSS Refresh Feature**: Add refresh button to RSS actions dropdown that refreshes the RSS feed using existing update function
- **Implementation Details**:
  - Use same function as update button in edit modal to avoid code duplication
  - Refresh button should trigger feed refresh without opening modal

## ✅ Recent Fixes
- ~~**UI Scrolling Bug**: Fixed excessive scrolling in RSS, Research, and YouTube sections using conditional rendering~~ ✅ Fixed
- ~~**Queue Item Cleanup**: Completed queue items are now deleted after AI processing~~ ✅ Fixed
- ~~**Bulk Processing**: Dropdown filter bulk processing not working in create queue~~ ✅ Fixed

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