# The Headlines - Production Deployment Guide

## 📖 Project Documentation
**All implementation details are in `/docs/`** - Always refer to these for specifications

## ✅ Completed Phases (0-4)
- **Phase 0**: ✅ Source data migration with enhanced sourceUrls schema
- **Phase 1**: ✅ Categories simplified to 4: Tech, Science, Finance, Policies 
- **Phase 2**: ✅ Home page components with badge filters and card layouts
- **Phase 3**: ✅ Article page with source transparency
- **Phase 4**: ✅ Profile settings with likes and comments

---

## 🚀 Phase 5: Production Deployment
*Current Focus - Go live for testing*

### 5.1 Category Configuration
**Master categories data**: `/categories_data.json` 
- Converting from 3 to 4 categories: Tech, Science, Finance, Policies
- Need to remove `_id` and `createdAt` fields (using Convex defaults)
- Split Tech & Science keywords for better distribution

### 5.2 Production Database Setup
- [x] Configure Convex production environment  
- [x] Remove createdAt fields from schema (using _creationTime default)
- [ ] **Current**: Update categories_data.json structure
- [ ] Manual category seeding with new 4-category structure
- [ ] Populate production with development data

### 5.3 API Keys & Environment Setup
- [ ] **Current**: Audit required API keys for Convex prod server
- [ ] Fix R2 bucket image loading in image gallery
- [ ] Verify all environment variables are configured

### 5.4 End-to-End Testing
- [ ] Source creation workflow
- [ ] Content processing pipeline
- [ ] Review and approval flow  
- [ ] Frontend functionality verification

### 5.5 UI Polish
- [ ] Frontend responsive design final pass
- [ ] Backend/admin UI improvements
- [ ] User experience testing

### 5.6 Production Launch
- [ ] Deploy to production
- [ ] Monitor system performance
- [ ] User acceptance testing

## 🎯 Immediate Priorities
1. **Update categories_data.json**: Remove _id/createdAt, split to 4 categories
2. **API keys audit**: Ensure R2 images load properly in production
3. **Workflow testing**: Verify entire content pipeline works end-to-end

---

## 🎨 Design Resources

**Figma Exports** in `/docs/Design/`:
- `/Public/Home/` - Badge filters, card layouts
- `/Public/Article/` - Source cards, layout
- `/Public/Profile Settings/` - Tabs, user content

**Design Tokens** in `globals.css`:
```css
--brand-primary: cyan-400
--brand-badge-background: cyan-950
--brand-card: cyan-grey derivative
--body-greyed-out: zinc-600
```

## 🚨 Critical Standards

1. **TypeScript**: Fix ALL errors before committing
2. **Responsive**: Mobile-first, test all breakpoints
3. **Documentation**: Refer to `/docs/` for specifications
4. **Components**: Follow patterns in [COMPONENTS.md](docs/COMPONENTS.md)

## 📁 File Structure
```
/app/(public)/           # Public routes
/components/public/      # Frontend components
  /home/                # Badge filter, etc.
  /cards/               # Card variants
  /article/             # Article components
  /profile/             # Profile components
```

## ⚡ Quick Start Checklist

**Today's Priority - Phase 0:**
- [ ] Update Convex schema for enhanced sources
- [ ] Modify Perplexity prompt (4-10 sources)
- [ ] Create migration script
- [ ] Test with new article creation

**Next Steps:**
- [ ] Implement category migration (Phase 1)
- [ ] Build badge filter component (Phase 2)
- [ ] Create card components (Phase 2)

---

**Remember**: This document is an overview. Always check `/docs/` for detailed specifications before implementing any feature. The documentation is the source of truth.