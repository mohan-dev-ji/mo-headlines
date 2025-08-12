# Prompts and AI Contracts

Source: `convex/rssQueue.ts`

## Output contract
- title: string
- body: markdown string
- excerpt: string
- category: one of active categories
- sourceUrls: string[]
- imageGenPrompts: string[3]
- topics: string[5..10] (single-token, unique)

## Invariants
- Topics are single-token and unique; server sanitizes
- Each topic must appear as **Topic** at least once in body
- Only topics are bolded; no extra bolds

## Failure handling
- Non-OK responses throw with status and snippet
- Non-JSON or missing fields throws
