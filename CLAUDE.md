# The Headlines - Frontend Development Guide

## 📖 Project Documentation
**All implementation details are in `/docs/`** - Always refer to these for specifications:
- **[ADR 4](docs/ADR/README.md)** - Frontend redesign decision with source data requirements
- **[Architecture](docs/ARCHITECTURE.md)** - System design and data schemas
- **[Components](docs/COMPONENTS.md)** - Component specifications
- **[UX Design](docs/UX.md)** - Design tokens and patterns
- **[Features](docs/FEATURES.md)** - Feature requirements
- **[Development](docs/DEVELOPMENT.md)** - Code standards and patterns

## 🎯 Current Mission
**Implement ADR 4**: Complete frontend redesign from "Mo Headlines" to "The Headlines" with professional branding, simplified categories, and enhanced source transparency.

## ✅ Completed Work
- **ADR 1-3**: Backend infrastructure complete
  - Create/Review/Images workflows operational
  - AI fact-checking with Perplexity
  - Image generation and gallery with R2 storage
  - RSS, Research, YouTube content sources
- **Admin Interface**: Functional but needs responsive updates (post-launch priority)

## 🚀 Implementation Roadmap

### **Phase 0: Source Data Migration** 🔴 START HERE
*Must complete before article page development*

**Update article schema** - See [ARCHITECTURE.md](docs/ARCHITECTURE.md#data-architecture) for schema
```typescript
// Transform sourceUrls from string[] to object array
sourceUrls: Array<{ url, domain, title }>
```

**Update Perplexity prompt** - See [PROMPTS.md](docs/PROMPTS.md#source-data-structure)
- Require 4-10 sources per article
- Extract URL, domain, and title for each source

**Migrate existing articles** - Simple transformation with fallbacks

---

### **Phase 1: Category Simplification**
*Merge 5 categories into 3 as defined in ADR 4*

- **Tech & Science**: Merge AI, Startups, Big Tech, Science keywords
- **Finance**: New consolidated financial category
- **Policies**: Transport + regulatory content

See [DOMAIN.md](docs/DOMAIN.md#categories) for keyword mappings

---

### **Phase 2: Home Page Components**
*Badge filter system and card layouts*

**Badge Filter** - See [UX.md](docs/UX.md#badge-states) for design tokens
- Recent, Tech & Science, Finance, Policies
- Active: `bg-cyan-950 text-cyan-400`
- Inactive: `bg-brand-card text-body-greyed-out`

**Article Cards** - See [COMPONENTS.md](docs/COMPONENTS.md#card-components) for specs
- LandscapeCardLeft, LandscapeCardRight, PortraitCard
- MobileArticleCard (responsive variant)
- CardLayoutGrid (3-row pattern manager)

**Typography** - Abhaya Libre for desktop headlines only

---

### **Phase 3: Article Page**
*Enhanced with source transparency*

- See FEATURES.md, COMPONENTS.md and UX.md in /docs for requirements

**Layout**
- Responsive image placement
- Close button navigation

**Source Cards**
- Display domain + title (2 lines)
- Horizontal carousel (4-10 cards)
- ~200px width per card

---

### **Phase 4: Profile Settings Page - Clear Action Items**
4.1 Schema Addition

Add likes table with userId, articleId
Create indexes: by_user, by_article, by_user_article (unique)

4.2 Backend Functions

toggleLike mutation - handle like/unlike
getUserLikedArticles query - return full article data
getUserComments query - return comments with article info
isArticleLiked query - check if user liked specific article

4.3 Profile Page Components

ProfileLayout - Main container
ProfileTabs - Toggle between "Comments" and "Liked Posts"
Liked Posts Tab:

Use LandscapeCardLeft component from home page
Display in vertical list
Include unlike button on each card
Empty state: "No liked posts yet"


Comments Tab:

Create new CommentCard component
Show comment text, article title (linked), timestamp
Empty state: "No comments yet"



4.4 Comments Section Testing (Article Page)

Verify comment display shows:

User avatar (Clerk image)
Username
Comment text
Timestamp (_creationTime)
Only approved comments visible


Add comment form for authenticated users
Test comment submission flow

4.5 Like Button Integration

Add heart icon to article pages
Outline when not liked, filled when liked
Click triggers toggleLike mutation
Show sign-in modal if not authenticated

📚 References

Design: /docs/Design/Public/Profile Settings/ folder
Features: See FEATURES.md - Profile Settings section
Components: See COMPONENTS.md - Profile Components section
Article Page: Check comments implementation in COMPONENTS.md

✅ Success Criteria

User can see all their liked articles in a list
User can see all their comments with links to articles
User can unlike articles from profile
Comments show proper user info on article pages
Non-authenticated users see sign-in prompt

---

### **Phase 5: Production Deployment**
*Go live for testing*

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Environment variables checklist
- Vercel configuration
- Post-deployment testing
- Polish backend UI

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