# Project Instructions for Gemini CLI

You are an expert full-stack developer working on "The Headlines," a Next.js and Convex application. You must strictly adhere to the project's architecture, file structure, and coding standards.

---

## 1. Project Context & Architecture

### **Tech Stack**
* **Frontend:** Next.js (App Router), React, TypeScript.
* **Backend:** Convex (Real-time database, queries, mutations, actions).
* **Styling:** Tailwind CSS.
* **Authentication:** Clerk.
* **Image Storage:** Cloudflare R2.
* **AI Model (New Standard):** Google Gemini (All previous models must be removed).

### **Key Architectural Principles**
1.  **Sole Content Source:** After the ADR 7 refactor, the ONLY source of new content will be **YouTube URLs**. All RSS/Research logic must be removed.
2.  **AI Monolith:** **All** AI processing (article synthesis, fact-checking, and image prompt generation) must be consolidated to use a single Gemini API key/endpoint.
3.  **Editorial Control:** All AI-generated content still requires human review/approval before being published.
4.  **File Structure:** All backend logic is in `/convex/`. All components are in `/components/`. Utilities and types are in `/lib/`.

---

## 2. Coding Standards & Conventions (from DEVELOPMENT.md)

### **Languages & Types**
* All code must be **TypeScript** with strict typing. **No `any` types allowed.**
* Run `npx tsc --noEmit` before proposing any changes.

### **Naming Conventions**
* **Components:** `PascalCase` (e.g., `ArticleLayout`).
* **Files:** `kebab-case` (e.g., `article-layout.tsx`).
* **Functions/Variables:** `camelCase` (e.g., `handleUpdateArticle`).
* **Constants:** `SCREAMING_SNAKE_CASE` (e.g., `MAX_ARTICLES_PER_PAGE`).

### **Convex Conventions**
* **Queries:** Must be named `get*` or `list*` (e.g., `listRecentArticles`).
* **Mutations:** Must be named `create*` or `update*` (e.g., `createArticleDraft`).

---

## 3. Mandatory Instructions for ADR 7 Refactor
- ADR doc here:`/Users/mohanveraitch/Documents/projects/mo-headlines/docs/ADR/README.md`

**When implementing the ADR 7 "AI Consolidation to Gemini," you must adhere to the following non-negotiable rules:**

### **Consolidation**
* **Remove Code:** Completely remove all functions, imports, and API route handlers that relate to:
    * `Perplexity` API
    * `Supadata.ai` API
    * `OpenAI` (for article or image generation)
* **Remove Env Vars:** Remove the following environment variables from any configuration files (`.env.local`, `DEPLOYMENT.md`, etc.):
    * `PERPLEXITY_API_KEY`
    * `OPENAI_API_KEY`
    * `SUPADATA_API_KEY`
* **New Integration:** All processing logic must be rewritten to use the new `GEMINI_API_KEY` (or relevant Google Cloud credentials).

### **Data & UI Cleanup**
* **Source Removal:** Identify and remove all code paths, component logic, and admin UI elements related to **RSS Feeds** and **Manual Research/Article** creation, as the only remaining source is YouTube.
* **`articles` Table:** Ensure the `createSource` and `sourceUrls` fields in the `articles` Convex table (as described in `ARCHITECTURE.md`) are properly updated/maintained only for the YouTube source.