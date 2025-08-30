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
- **Phase**: Images UI Implementation & R2 Integration
- **Previous**: ADR 3 Database Schema ✅ Implemented by Claude Code
- **External Services**: Cloudflare R2 bucket ✅ Configured, environment variables ready

## 🖼️ **Images UI Implementation Plan**

### **Goal**: Build polished image management interface matching Figma designs with full R2 integration

**Implementation Focus:**
- Images Gallery with filtering and grid layout
- Context-aware Add Image page (dual-tab interface)
- R2 bucket integration and testing
- Prompt management with editing modal
- Complete workflow from gallery through article editing

### **Available Design References**
**Figma Screens Saved as PNGs:**
- **Image Gallery**: Main grid layout with filtering dropdown `/Users/mohanveraitch/Documents/projects/mo-headlines/_design/Admin/Add Image - Component/Admin - Image Gallery.png`
- **Add Image - Generate Tab (Review Context)**: For article editing workflow `/Users/mohanveraitch/Documents/projects/mo-headlines/_design/Admin/Add Image - Component/Admin - Review and Image Gallery - Add Image - Generate.png`
- **Add Image - Generate Tab (Gallery Context)**: For standalone image creation `/Users/mohanveraitch/Documents/projects/mo-headlines/_design/Admin/Add Image - Component/Admin - Review and Image Gallery - Add Image - Generate.png`
- **Prompt Editor Modal**: Simple textarea interface for prompt editing `/Users/mohanveraitch/Documents/projects/mo-headlines/_design/Admin/Add Image - Component/Prompt-editor-modal.png`
- **Add Image - Select Tab (Review)**: Gallery browser + upload for article context `/Users/mohanveraitch/Documents/projects/mo-headlines/_design/Admin/Add Image - Component/Admin - Review - Add Image - Select.png`
- **Add Image - Select Tab (Gallery)**: Upload only for gallery context `/Users/mohanveraitch/Documents/projects/mo-headlines/_design/Admin/Add Image - Component/Admin - Image Gallery - Add Image - Select.png`
- **Browse Files Dialogue**: File picker interface design `/Users/mohanveraitch/Documents/projects/mo-headlines/_design/Admin/Add Image - Component/Browse-modal.png`

**Implementation Priority Order:**
1. **Images Gallery Foundation** - Grid, filtering, responsive layout
2. **R2 Integration & Testing** - Upload, storage, CDN delivery
3. **Add Image Dual-Tab Interface** - Context-aware workflow
4. **Article Edit Integration** - Complete end-to-end flow

---

## 🎨 **Phase 1: Images Gallery UI Foundation**

### **Goal**: Create polished gallery interface matching Figma designs

**Components to Build:**
```
/components/admin/images/
├── gallery/
│   ├── ImagesGallery.tsx       # Main gallery grid container
│   ├── ImageThumbnail.tsx      # Individual image card with hover
│   ├── GalleryFilters.tsx      # Dropdown sorting (rating, status, date, etc.)
│   ├── EmptyGalleryState.tsx   # Empty state with "Create Image" CTA
│   └── GalleryPagination.tsx   # Pagination if needed
└── shared/
    ├── ImageStatusBadge.tsx    # Status indicators (approved/rejected/pending)
    └── RatingDisplay.tsx       # Star rating visualization
```

**Implementation Details:**
- **Grid Layout**: Google Drive-style responsive grid matching Figma
- **Filtering Dropdown**: Sort by rating (1-10), status, date, category, model, prompt source
- **Hover States**: Show metadata overlay on image hover
- **Loading States**: Skeleton loading for images and grid
- **Error Handling**: Failed image loads, network errors
- **Empty State**: Compelling CTA to create first image

**Key Features:**
- Thumbnail lazy loading for performance
- Multi-select capability with check boxes for bulk actions
- Quick actions (rating, status) on hover
- Search functionality for prompt text
- Responsive design (mobile, tablet, desktop)

---

## 🔌 **Phase 2: R2 Integration & Testing**

### **Goal**: Connect gallery to Cloudflare R2 bucket with reliable upload/retrieval

**Environment Variables Ready:**
```bash
CLOUDFLARE_R2_ACCESS_KEY_ID=configured ✅
CLOUDFLARE_R2_SECRET_ACCESS_KEY=configured ✅  
CLOUDFLARE_ACCOUNT_ID=configured ✅
CLOUDFLARE_R2_BUCKET_NAME=mo-headlines-images ✅
CLOUDFLARE_R2_ENDPOINT=configured ✅
```

**Integration Tasks:**
1. **Install Dependencies**: `@aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
2. **Create Utility Functions**: `/lib/cloudflare.ts` for upload/delete/URL generation
3. **API Route**: `/app/api/images/upload/route.ts` for file handling
4. **Upload Hook**: `/hooks/useImageUpload.ts` for React integration
5. **Test Functionality**: Upload, view, delete cycle with real images

**Testing Scenarios:**
- Upload various image formats (JPEG, PNG, WebP)
- Test file size limits and validation
- Verify CDN delivery and caching
- Error handling for failed uploads
- Batch upload capabilities

**Success Criteria:**
- Images upload successfully to R2 bucket
- Public URLs work immediately
- Gallery displays uploaded images correctly
- Error states handled gracefully

---

## 🖱️ **Phase 3: Add Image Dual-Tab Interface**

### **Goal**: Build context-aware Add Image page with Generate and Select tabs

**Route Structure:**
```
/app/admin/images/add/page.tsx    # Main Add Image page
```

**Components to Build:**
```
/components/admin/shared/addimage/
├── AddImagePage.tsx              # Main container with context detection
├── GenerateTab.tsx               # AI generation and prompt management  
├── SelectTab.tsx                 # Gallery browser + file upload
├── ImagePreview.tsx              # Unified preview for all image sources
└── TabNavigation.tsx             # Shared tab switching component

/components/admin/shared/prompts/
├── PromptModal.tsx               # Simple textarea editor (matches Figma)
├── PromptSelector.tsx            # Dropdown for available prompts
└── PromptDisplay.tsx             # Read-only prompt preview
```

### **Generate Tab Implementation**

**Article Edit Context** (`?articleId=xyz`):
- **Prompt Dropdown**: Shows AI-generated prompts from Perplexity for this article
- **Buttons**: "Create Prompt", "Edit Prompt" (enabled when prompt selected), "Generate Image"
- **Preview**: Generated image display with metadata input

**Gallery Context** (no articleId):
- **Empty Prompt State**: No pre-existing prompts available
- **Buttons**: "Create Prompt", "Edit Prompt" (disabled), "Generate Image"
- **Preview**: Generated image display with metadata input

**Key Features:**
- DALL-E 3 integration for image generation
- Real-time prompt preview
- Loading states during generation
- Error handling for API failures
- Prompt history tracking

### **Select Tab Implementation**

**Article Edit Context**:
- **Browse Gallery Button**: Opens gallery selector modal (matches Figma)
- **Upload Files Button**: File picker for device uploads
- **Preview**: Selected/uploaded image with prompt and rating input

**Gallery Context**:  
- **Upload Files Button**: File picker for device uploads (only option)
- **No Browse Gallery**: Already in gallery, no need to browse
- **Preview**: Uploaded image with prompt and rating input

**Key Features:**
- File drag-and-drop support
- Multi-file upload capability
- Image validation and compression
- Metadata input (prompt, rating, article association)

### **Context-Aware Logic**

**URL Pattern Detection:**
```typescript
// Article context: /admin/images/add?articleId=xyz
// Gallery context: /admin/images/add

const articleId = searchParams.get('articleId')
const isArticleContext = !!articleId
const isGalleryContext = !articleId
```

**Conditional Rendering:**
- Generate tab: Show AI prompts dropdown if article context
- Select tab: Show gallery browser button if article context
- Navigation: Return to article edit vs. stay in gallery
- Prompt creation: Link to article vs. standalone

---

## 🔄 **Phase 4: Article Edit Integration**

### **Goal**: Integrate Add Image workflow into existing article editing

**Integration Points:**
1. **Article Edit Modal**: Add "Add Image" button that navigates to Add Image page
2. **Context Passing**: Pass `articleId` parameter for proper context
3. **Return Navigation**: Navigate back to article edit with attached image
4. **Image Display**: Show attached image in article edit interface

**Workflow Testing:**
1. **Edit Article** → Click "Add Image" → **Add Image Page** (article context)
2. **Generate/Select Image** → Save with metadata → **Return to Article Edit**
3. **Verify Image Attachment** → Complete article editing → **Publish**

**Success Criteria:**
- Smooth navigation between article edit and image workflows
- Proper context detection and UI adaptation
- Image attachment works correctly
- No data loss during workflow transitions

---

## 🎨 **UI Polish Requirements**

### **Design System Consistency**
- Use established design tokens from `/docs/UX.md`
- Follow component patterns from existing admin sections
- Maintain responsive behavior across all screen sizes
- Implement proper loading and error states

### **Key Design Elements** (Reference Figma PNGs):
- **Gallery Grid**: Clean, consistent spacing with hover effects
- **Tab Interface**: Clear active/inactive states with smooth transitions
- **Prompt Modal**: Simple, focused interface matching design
- **File Upload**: Intuitive drag-and-drop with progress indicators
- **Image Preview**: Consistent preview area across all contexts

### **Accessibility Standards**:
- Keyboard navigation for all interactive elements
- Screen reader support for image galleries
- Proper contrast ratios and focus indicators
- Alt text management for uploaded images

---

## 🚨 **Development Standards**

### **TypeScript Compliance**
- Run `npx tsc --noEmit --project .` after every session
- Fix ALL TypeScript errors before proceeding
- Use proper types for Convex queries and mutations
- Define interfaces for all component props

### **Component Organization**
- Follow `/docs/DEVELOPMENT.md` file structure
- Use shared components in `/components/admin/shared/`
- Implement proper error boundaries
- Handle loading states consistently

### **Testing Approach**
- Test both article and gallery contexts thoroughly
- Verify R2 integration with real file uploads
- Test responsive behavior across breakpoints
- Validate error handling and edge cases

---

## 📋 **Implementation Checklist**

### Phase 1: Gallery UI ✅ Ready to Start
- [ ] Build ImagesGallery component with grid layout
- [ ] Implement GalleryFilters with sorting options
- [ ] Create ImageThumbnail with hover states
- [ ] Add EmptyGalleryState with create CTA
- [ ] Test responsive behavior and loading states

### Phase 2: R2 Integration ✅ Environment Ready  
- [ ] Install AWS SDK dependencies
- [ ] Create Cloudflare utility functions
- [ ] Build upload API route with validation
- [ ] Create useImageUpload hook
- [ ] Test upload/retrieve/delete cycle

### Phase 3: Add Image Interface
- [ ] Build AddImagePage with context detection
- [ ] Implement GenerateTab with prompt management
- [ ] Create SelectTab with conditional gallery browser
- [ ] Build PromptModal matching Figma design
- [ ] Test both article and gallery contexts

### Phase 4: Integration Testing
- [ ] Connect Add Image to article edit workflow
- [ ] Test complete end-to-end user journeys
- [ ] Verify data consistency across workflows
- [ ] Polish UI and fix any UX issues

---

**Tech Stack**: Next.js 15.3, Convex, Cloudflare R2, AWS SDK, shadcn/ui  
**Design Reference**: Figma screens saved as PNGs  
**Last Updated**: August 2025