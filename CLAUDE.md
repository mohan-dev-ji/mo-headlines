# The Headlines - Production Site Controller

## 📖 Project Documentation
**Complete documentation is in `/docs/`** - Start with [docs/index.md](docs/index.md) for full context and navigation to all specifications.

## ✅ Project Status: Live in Production
**Site**: The Headlines is deployed and running on Vercel
**Current Phase**: SEO Technical Foundation

---

## ✅ COMPLETED: ADR 6 - Documentation Architecture Refactoring

---

## 🚨 IMMEDIATE TASK: SEO Technical Implementation

### Phase 1: Core Technical Changes

#### 1. Meta Tags & Open Graph
- [ ] Add meta tags to article pages (`app/article/[slug]/page.tsx`)
  - title, description, og:image, twitter:card
  - article:published_time, article:section
- [ ] Add meta tags to home page (`app/page.tsx`)

#### 2. Structured Data (Schema.org)
- [ ] Add NewsArticle JSON-LD to article pages
- [ ] Add Organization schema to home page

#### 3. Sitemaps
- [ ] Create `/app/sitemap.xml/route.ts` - dynamic sitemap
- [ ] Create `/app/sitemap-news.xml/route.ts` - Google News sitemap
- [ ] Update `/public/robots.txt` with sitemap references

#### 4. Image Optimization
- [ ] Convert `<img>` to Next.js `<Image>` component
- [ ] Add priority loading for above-fold images

---