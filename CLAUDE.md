# Mo Headlines - AI-Verified Tech News Platform

## 📖 Documentation Hub
All project documentation is centralized in `/docs/`:
- **Start here**: [Documentation Index](docs/INDEX.md)
- **Architecture**: [System Design](docs/ARCHITECTURE.md) 
- **Development**: [Guidelines & Patterns](docs/DEVELOPMENT.md)
- **Features**: [Create & Review Workflows](docs/FEATURES.md)
- **Components**: [Admin & Public Components](docs/COMPONENTS.md)
- **Supadata Integration**: [YouTube Transcript Guide](docs/supadata-guide.md)
- **ADR 3**: [Images & Prompts Architecture Decision](docs/adr/README.md)

## 🎯 Current Development Phase
- **Phase**: Major Architecture Overhaul - Images & Prompts System
- **Previous**: YouTube Feature Implementation ✅ Complete
- **External Services**: Supadata.ai ✅ Ready, Cloudflare Workers R2 bucket setup required

## 🖼️ **Images & Prompts Architecture Implementation**

### **Goal**: Implement unified image and prompt management system with context-aware workflows

**Major Changes**: This is a significant architectural overhaul covered by ADR 3, involving:
- New `prompts` table for AI-generated, custom, and edited prompts with article relationships
- New `images` table with Cloudflare R2 storage integration and optional article linking
- Article table cleanup (remove imageGenPrompts, imageStorageId fields)
- Third admin section: Images workflow alongside Create and Review
- Unified Add Image page that works contextually for article editing and gallery workflows

### **Implementation Architecture Overview**

**Add Image Page (Context-Aware):**
- **Article Edit Context**: `/admin/images/add?articleId=xyz` with AI prompts and gallery browse
- **Gallery Context**: `/admin/images/add` with custom prompts and upload only
- **Generate Tab**: AI generation with prompt management (context determines available prompts)
- **Select Tab**: Gallery browser (conditional) and device upload with metadata input
- **Unified Preview**: Same interface for generated, uploaded, and selected images

### **Phase 1: Database Schema Migration**
**Convex Schema Updates** (`/convex/schema.ts`):

```typescript
// New prompts table
prompts: defineTable({
  articleId: v.id("articles"),
  text: v.string(),
  source: v.union(v.literal("ai-generated"), v.literal("custom"), v.literal("edited")),
  isUsed: v.boolean(),
  editedFrom: v.optional(v.id("prompts")),
})
.index("by_article", ["articleId"])
.index("by_usage", ["isUsed"])

// Updated images table  
images: defineTable({
  articleId: v.id("articles"),
  promptId: v.id("prompts"),
  cloudflareUrl: v.string(),
  cloudflareKey: v.string(),
  status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("unused")),
  rating: v.optional(v.number()),
  model: v.string(),
  generationCost: v.optional(v.number()),
  articleTitle: v.string(),
  categoryId: v.id("categories"),
})
.index("by_article", ["articleId"])
.index("by_status", ["status"])
.index("by_rating", ["rating"])

// Updated articles table (remove imageGenPrompts, imageStorageId)
articles: defineTable({
  // ... existing fields
  imageId: v.optional(v.id("images")), // Keep this
  // Remove: imageGenPrompts, imageStorageId
})
```

### **Phase 2: Convex Functions Implementation**
Create new function files:

**`/convex/prompts.ts`**:
- `createPromptsForArticle` (mutation): Store 3 AI-generated prompts from Perplexity
- `getPromptsForArticle` (query): Retrieve prompts for Generate tab dropdown
- `createCustomPrompt` (mutation): Create new prompts via PromptModal
- `editPrompt` (mutation): Create edited version with relationship tracking
- `markPromptAsUsed` (mutation): Mark prompt when used for image generation

**`/convex/images.ts`**:
- `createImage` (mutation): Store metadata after generation/upload with prompt relationship
- `updateImageMetadata` (mutation): Edit rating, status, article association on detail page
- `listImages` (query): Gallery display with comprehensive filtering
- `getImageById` (query): Individual image detail with editable fields
- `getImagesAnalytics` (query): Prompt effectiveness and usage analytics

### **Phase 3: Cloudflare Workers R2 Integration**
**Setup Requirements**:
- Cloudflare Workers account and R2 bucket configuration
- API keys and bucket access configuration
- Upload/retrieval utilities in `/lib/cloudflare.ts`

**Integration Points**:
- Image upload during generation process
- CDN URL generation for public serving
- Asset cleanup and management utilities

### **Phase 4: AI Processing Updates**
**Update Perplexity Integration**:
- Modify AI processing to generate 3 prompts per article
- Store prompts in prompts table instead of articles table
- Update processing pipeline to handle prompt generation

**Update Image Generation**:
- Use prompts from prompts table instead of articles table
- Link generated images to specific prompts
- Upload to Cloudflare instead of Convex storage

### **Phase 5: Admin Interface Implementation**

**New Images Section** (`/app/admin/images/`):
- `/app/admin/images/page.tsx` - Gallery interface
- `/app/admin/images/[imageId]/page.tsx` - Detail page

**Components** (`/components/admin/images/`):
- `AddImagePage.tsx` - Context-aware workflow with generate/select tabs
- `GenerateTab.tsx` - Prompt management and AI generation with preview
- `SelectTab.tsx` - Gallery browser (conditional) and device upload
- `PromptModal.tsx` - Simple textarea interface for prompt creation/editing
- `ImagesGallery.tsx` - Grid display with comprehensive filtering
- `ImageDetailPage.tsx` - Full view with editable metadata (rating, status, article link)

**Update Review Components**:
- Modify article editing to integrate with unified Add Image page
- Update navigation between article edit and image workflows
- Ensure proper context passing for article association

### **Phase 6: Data Migration**
**Migration Strategy**:
1. **Backup**: Export existing data before schema changes
2. **Prompts**: Extract imageGenPrompts from articles into prompts table  
3. **Images**: Migrate existing images to Cloudflare storage
4. **Cleanup**: Remove deprecated fields from articles table
5. **Testing**: Verify all relationships and functionality

**Migration Scripts** (`/scripts/migrate/`):
- `extract-prompts.ts` - Move imageGenPrompts to prompts table
- `migrate-images.ts` - Upload images to Cloudflare, update URLs
- `cleanup-articles.ts` - Remove deprecated fields safely

### **Phase 7: Integration & Testing**
**Key Integration Points**:
- AdminSidebar navigation to include Images section
- Cross-workflow data consistency (articles ↔ prompts ↔ images)
- Permission and authentication for new admin section
- Performance optimization for gallery and filtering

**Testing Priorities**:
- End-to-end workflow: Create → Queue → Process → Review → Image Generation
- Data integrity across normalized tables
- Cloudflare storage reliability and performance
- Admin interface usability and responsiveness

## ✅ Previous Fixes & Features
- ~~**Article Schema Cleanup**: Removed topics, rssSourceOrigin, isAutoGenerated fields~~ ✅ Fixed
- ~~**YouTube Feature**: Complete implementation with Supadata.ai integration~~ ✅ Fixed
- ~~**Queue Processing**: Bulk operations and cleanup~~ ✅ Fixed
- ~~**RSS Management**: Full CRUD operations and refresh capabilities~~ ✅ Fixed

## 🚨 **Development Rule: Zero TypeScript Errors**
Always run `npx tsc --noEmit --project .` and fix ALL errors after coding. TypeScript errors in `/convex/` files break API generation.

## 🔄 **Migration Checklist**
- [ ] Update Convex schema with prompts and images tables
- [ ] Create new Convex functions for prompts and images
- [ ] Set up Cloudflare Workers R2 bucket and API integration
- [ ] Update AI processing to use prompts table
- [ ] Implement Images admin section components
- [ ] Update existing review workflow for prompt management
- [ ] Create data migration scripts
- [ ] Test end-to-end workflows
- [ ] Update AdminSidebar navigation
- [ ] Performance testing and optimization

---

**Tech Stack**: Next.js 15.3, Convex, Clerk, Perplexity API, Supadata.ai, Cloudflare Workers R2  
**Last Updated**: August 2025