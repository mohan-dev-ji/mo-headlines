# Deployment Guide

## Pre-Deployment Checklist

### Frontend Updates
- [ ] Badge filter system functional
- [ ] Responsive design verified
- [ ] Abhaya Libre font loading correctly
- [ ] Animation performance optimized

### Category Migration
- [ ] Categories reduced to 3 (Tech & Science, Finance, Policies)
- [ ] Articles migrated to new categories
- [ ] RSS feeds updated with merged keywords
- [ ] Queue processing tested

### Performance Metrics
- [ ] Core Web Vitals passing
- [ ] Gradient animations at 60fps
- [ ] Load time under 3 seconds
- [ ] Time to Interactive under 5 seconds

## Environment Variables

### Production Convex
```bash
NEXT_PUBLIC_CONVEX_URL=your_production_url
CONVEX_DEPLOYMENT=production
```

### Production Clerk
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
```

### Production Cloudflare R2
```bash
CLOUDFLARE_R2_ACCESS_KEY_ID=xxx
CLOUDFLARE_R2_SECRET_ACCESS_KEY=xxx
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_R2_BUCKET_NAME=the-headlines-images
CLOUDFLARE_R2_ENDPOINT=xxx
```

### Production APIs
```bash
PERPLEXITY_API_KEY=xxx
OPENAI_API_KEY=xxx
SUPADATA_API_KEY=xxx
```

## Vercel Configuration

### Build Settings
- Framework Preset: Next.js
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

### Environment Variables
- Add all production variables above
- Set variable encryption for sensitive keys

### Domain Configuration
- Production: theheadlines.com (or your domain)
- Preview: the-headlines-*.vercel.app

## Post-Deployment Testing

### Functional Testing
- [ ] Badge filters working correctly
- [ ] Gradient animations smooth
- [ ] Article cards loading in pattern
- [ ] Load more functionality
- [ ] Sources carousel scrolling
- [ ] Comments system working
- [ ] Profile pages accessible

### Visual Testing
- [ ] Abhaya Libre font on desktop
- [ ] Responsive layouts working
- [ ] Mobile cards displaying

### Performance Testing
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Test on slow 3G
- [ ] Verify image optimization

## Monitoring Setup

### Analytics
- Google Analytics 4
- Vercel Analytics
- Error tracking (Sentry recommended)

### Performance Monitoring
- Track load more interactions
- Badge filter usage metrics
- Source card click rates

## Rollback Plan

### If Issues Occur
1. Revert to previous deployment in Vercel
2. Check error logs in Vercel Functions
3. Review Convex logs for API issues
4. Restore previous category structure if needed

### Emergency Contacts
- Vercel Support: support.vercel.com
- Convex Support: convex.dev/support
- Cloudflare Support: dash.cloudflare.com