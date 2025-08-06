# [Project Name] - [One-line description]

## Quick Context (30-second overview)
**What this does:** [1-2 sentences explaining core purpose]
**Tech stack:** [Main technologies only]
**Current focus:** [What you're building right now]

## Current Task
**Goal:** [Specific thing you're working on]
**Status:** [Where you are in the process]
**Next step:** [Immediate next action]

---

## Core Features (What it does)
### 1. [Feature Name]
- **Purpose:** [Why this exists]
- **How it works:** [2-3 bullet points]
- **User flow:** [Basic steps user takes]

### 2. [Feature Name]
- **Purpose:** [Why this exists] 
- **How it works:** [2-3 bullet points]
- **User flow:** [Basic steps user takes]

## Core Features
### 1. RSS Management
**Purpose:**
- To capture news feeds from reputable sources
**How it works:** 
- rss-parser takes input from users rss feed url
- The items in this response get filtered using the category and keywords from user input
- These items go into a queue for deduplication and to await be processed by Perplexity AI
**User flow:**
- Admin makes an rss source with an active rss feed url and intended category
- This source fetches artciles automatically from the feed every 60m, 1hr etc.
- These articles get stored in a queue to be process individually or in batches

### 2. Sumarizing and fact-checking the latest tech headlines
**Purpose:**
- Use Perplexity Deep Research via it's API to summarize and fact check articles from the rss queue
**How it works:**
- Articles are sent to Perplexity
- Accompanying prompt gives instructions for summarization and fact checking with other sources
- Response is captured in articles convex table
- New articles are not published but flagged as pending to be approved by admin in the articles/pending queue.
- Once approved the article go live and can be seen by publically on website 
**User flow:**
- If fully automated Admin only has to approve articles from pending queue.
- If not fully automated admin looks at articles in the rss queue
- Selects articles to process with Perplexity AI
- Awaits response by new items in the articles/pending queue
- Reads the articles in the pending queue
- Admin to approve, edit or delete articles from Perplexity AI


### 3. Displaying fully fact checked up to date stories on the website
**Purpose:**
- To give the public sumarized headlines and breaking news that have been created from multiple credible sources giving them peace of mind that what they are reading is factually correct.
**How it works:**
- This works as any normal news or blog website
- Anyone online can read all the articles and comments
- only logged in users can leave comments and like articles
**User flow:**
- Users find the website as it reports on trending/breaking developments in the tech industry
- They read an article
- If they decide to comment or like they can log in using google or email.
- User comments and likes article
- User Profile Settings can change username, password, avatar, view their comments and view list of liked articles.

*(Only include 3-4 main features max)*

---

## Component Structure (How it's built)
### Page Structure
```
/main-page
  ├── header-component
  ├── main-content
  │   ├── feature-1-section
  │   └── feature-2-section
  └── footer-component
```

### Key Components
**ComponentName** - Purpose and basic props
**ComponentName** - Purpose and basic props
**ComponentName** - Purpose and basic props

### Data Flow
1. [Step 1 of data movement]
2. [Step 2 of data movement] 
3. [Step 3 of data movement]

---

## Development Guidelines
### File Organization
```
/app
  /[main-routes]
/components  
  /[component-folders]
/lib
  /[utility-folders]
```

### Naming Conventions
- Components: PascalCase
- Files: kebab-case
- Functions: camelCase

### Code Patterns
```typescript
// Example of preferred pattern
interface Props {
  // Define types
}

export default function Component({ props }: Props) {
  // Component logic
}
```

---

## Reference (Schemas & Details)

### Database Schema
```typescript
// Only include tables relevant to current work
table_name: {
  _id: Id<"table_name">
  field: type
  // Keep it minimal
}
```

### API Patterns
```typescript
// Common mutation/query patterns you use
export const commonPattern = mutation({
  args: { },
  handler: async (ctx, args) => {
    // Pattern logic
  }
});
```

### Design Tokens (if UI-heavy)
```css
/* Only the tokens you actually use */
--primary-color: #value;
--spacing-unit: 8px;
```

---

## Implementation Notes
- [Specific gotchas or important decisions]
- [Dependencies or external services]
- [Performance considerations]

## Current Blockers
- [Thing preventing progress]
- [Questions that need answers]