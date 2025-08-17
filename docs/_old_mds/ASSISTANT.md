# Assistant Snapshot

This file gives a concise, canonical view of the app for assistants. Keep this small and updated.

```yaml
assistant_snapshot:
  app:
    name: mo-headlines
    framework: Next.js (App Router)
    routes:
      - path: /
        file: app/page.tsx
      - path: /article/[id]
        file: app/(public)/article/[id]/page.tsx
      - path: /category/[slug]
        file: app/(public)/category/[slug]/page.tsx
      - path: /topic/[slug]
        file: app/(public)/topic/[slug]/page.tsx
      - path: /profile
        file: app/(public)/profile/page.tsx
      - path: /admin
        file: app/admin/page.tsx
      - path: /admin/rss-sources
        file: app/admin/rss-sources/page.tsx
      - path: /admin/articles/[id]/edit
        file: app/admin/articles/[id]/edit/page.tsx

    data:
      store: convex
      schema_file: convex/schema.ts
      tables: [articles, categories, topics, comments, rss_producer, rss_queue]

    services:
      - name: convex
        role: DB + server functions
      - name: perplexity
        role: AI article processing
        used_in: convex/rssQueue.ts
      - name: clerk
        role: auth
        used_in: app routes (useUser)

    env: [PERPLEXITY_API_KEY]

    flows:
      - name: rss_processing
        entry: convex/rssQueue.ts:processQueueItem
        reads: [rss_queue]
        writes: [articles, rss_queue.status]
        prompt_contract:
          output_fields: [title, body, excerpt, category, sourceUrls, imageGenPrompts, topics]

    conventions:
      topics:
        - single_token: true
        - unique: true
        - bold_once_in_body: true
        - clickable_when_bold_exact_match: true
      markdown:
        - only_bold_topics: true
        - no_headings_or_lists_in_body: true

  design:
    roots:
      - _design/
    notes: Screens for admin RSS producer/consumer/queue are kept in _design/Admin/RSS/*

  docs:
    root: docs/
    index: docs/INDEX.md
```

Maintenance guide
- Update tables/routes/services when they change
- Keep prompt contract aligned with `convex/rssQueue.ts`
- Record major behavior decisions in `docs/ADR/`

