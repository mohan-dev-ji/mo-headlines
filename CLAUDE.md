# The Headlines - Production Deployment Guide

## 📖 Project Documentation
**All implementation details are in `/docs/`** - Always refer to these for specifications

## ✅ Completed Phases (0-5) of ADR 4
- **Phase 0**: ✅ Source data migration with enhanced sourceUrls schema
- **Phase 1**: ✅ Categories simplified to 5: All, Tech, Science, Finance, Policies 
- **Phase 2**: ✅ Home page components with badge filters and card layouts
- **Phase 3**: ✅ Article page with source transparency
- **Phase 4**: ✅ Profile settings with likes and comments
- **Phase 5**: ✅ Production deployment and end-to-end testing

---

## 🚀 Phase 6: Calendar Discovery & Pagination System
*Current Focus - Final major feature enhancement*

### Implementation Overview
**Reference**: [ADR 5](docs/ADR/README.md#adr-5) for complete specification

**Goal**: Add calendar-based article discovery with combined date + category filtering and efficient pagination system.

### 6.1 Data Layer Updates
**Reference**: [ARCHITECTURE.md](docs/ARCHITECTURE.md#data-architecture)
- Use already existing `articles._creationTime` for (calendar queries)
- Create efficient date aggregation queries for calendar indicators
- Implement combined filter queries (date + category)
- Add pagination support with filter persistence

### 6.2 Desktop Calendar Widget
**Reference**: [COMPONENTS.md](docs/COMPONENTS.md#calendar-components) & [UX.md](docs/UX.md#calendar-design-system)
- **ArticleCalendar**: Right column widget with publication indicators
- **PublicationIndicators**: Dot system showing article density per day
- **MonthNavigation**: Previous/next controls with current month default
- **Selected states**: cyan-400 text, cyan-950 background (same as badges)

### 6.3 Mobile Calendar System
**Reference**: [UX.md](docs/UX.md#mobile-home-layout)
- **Horizontal Badge Scrolling**: Convert badge filter to scroll container
- **CalendarIconBadge**: Final badge in scroll, styled identically to others
- **CalendarModal**: Full-screen date picker with touch optimization
- **Mode indication**: Calendar icon stays highlighted when date filtering active

### 6.4 Combined Filtering Logic
**Reference**: [DOMAIN.md](docs/DOMAIN.md#calendar-discovery-workflow)
- **Date + Category**: Filters work together, not exclusively
- **Badge behavior**: "All" badge clears both date and category filters
- **URL persistence**: Both filters maintained in URL parameters
- **Visual consistency**: Selected dates use same brand colors as active badges

### 6.5 Pagination System
**Reference**: [FEATURES.md](docs/FEATURES.md#pagination-system)
- **Initial load**: 10 most recent articles matching active filters
- **LoadMoreButton**: Progressive loading of 10-article chunks
- **Filter persistence**: Pagination maintains date + category combinations
- **Pattern continuity**: 3-row card layout continues across paginated loads

### 6.6 Layout Updates
**Reference**: [UX.md](docs/UX.md#home-page-layout)
- **Desktop**: 4-column grid (3 articles + 1 calendar/ads)
- **Mobile**: Single column with horizontal badge scrolling
- **Badge typography**: text-base semibold for improved hierarchy
- **Ad space**: Reserved area below calendar for future monetization

## 🎯 Implementation Priority Order
1. **Database queries**: Date filtering and pagination support
2. **Desktop calendar**: ArticleCalendar component with indicators
3. **Mobile badges**: Horizontal scrolling with calendar icon
4. **Mobile modal**: Full-screen CalendarModal component
5. **Combined filtering**: Integration with existing badge system
6. **Pagination**: LoadMoreButton with filter persistence

## 📋 Key Requirements
- **Visual consistency**: Calendar selections use badge brand colors
- **Filter combination**: Date + category work together
- **Performance**: Efficient queries for calendar indicators and pagination
- **Mobile UX**: Progressive disclosure through horizontal badge scrolling
- **URL state**: Both filters maintained in shareable URLs

## 🔧 Technical References
- **Components**: [COMPONENTS.md](docs/COMPONENTS.md) - Calendar and pagination components
- **Design System**: [UX.md](docs/UX.md) - Visual specifications and responsive behavior
- **Architecture**: [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Data queries and performance optimization
- **Domain Logic**: [DOMAIN.md](docs/DOMAIN.md) - Business rules and filtering workflows

---

## 🎨 Design Resources

**Figma Exports** in `/docs/Design/`:
- `/Public/Home/` - Calendar integration, 4-column layout
- Calendar designs integrated within home page mockups

**Design Tokens** in `globals.css`:
```css
--brand-primary: cyan-400
--brand-badge-background: cyan-950
--brand-card: cyan-grey derivative
--body-greyed-out: zinc-600
```

## 🚨 Critical Standards

1. **TypeScript**: Fix ALL errors before committing
2. **Responsive**: Test calendar on mobile and desktop
3. **Documentation**: Follow specifications in `/docs/`
4. **Performance**: Efficient calendar queries and pagination
5. **Visual consistency**: Selected dates match badge styling

---

**Remember**: This document is an overview. Always check `/docs/` for detailed specifications before implementing any feature. The documentation is the source of truth.