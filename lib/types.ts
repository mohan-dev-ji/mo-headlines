// Shared TypeScript types for the Mo Headlines platform

export type APIResponse<T> = {
  data?: T;
  error?: string;
  code?: string;
};

export type ArticleStatus = "draft" | "pending" | "approved" | "rejected";

export type PromptType = "research" | "synthesis" | "factcheck";