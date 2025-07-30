import { z } from "zod";

// Refresh interval options
export const refreshIntervalOptions = [
  { value: "1hr", label: "Every Hour", seconds: 3600 },
  { value: "6hr", label: "Every 6 Hours", seconds: 21600 },
  { value: "12hr", label: "Every 12 Hours", seconds: 43200 },
  { value: "24hr", label: "Every 24 Hours", seconds: 86400 },
  { value: "1week", label: "Every Week", seconds: 604800 },
] as const;

// Convert refresh interval to seconds
export function refreshIntervalToSeconds(interval: string): number {
  const option = refreshIntervalOptions.find(opt => opt.value === interval);
  return option ? option.seconds : 86400; // Default to 24 hours
}

// Validate URL format
const urlValidation = z
  .string()
  .url("Must be a valid URL")
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, "URL must use HTTP or HTTPS protocol");

// RSS Source form schema
export const rssSourceSchema = z.object({
  feedTitle: z
    .string()
    .min(1, "Feed title is required")
    .max(100, "Feed title must be less than 100 characters")
    .trim(),
  
  feedURL: urlValidation,
  
  numberOfArticles: z
    .number()
    .min(1, "Must fetch at least 1 article")
    .max(100, "Cannot fetch more than 100 articles"),
  
  category: z
    .string()
    .optional()
    .default(""),
  
  status: z.enum(["active", "inactive"], {
    required_error: "Status is required",
  }),
  
  refreshInterval: z.enum(["1hr", "6hr", "12hr", "24hr", "1week"], {
    required_error: "Refresh interval is required",
  }),
});

export type RSSSourceFormData = z.infer<typeof rssSourceSchema>;

// RSS Feed testing schema
export const testRSSFeedSchema = z.object({
  url: urlValidation,
  category: z.string().optional(),
  numberOfArticles: z.number().min(1).max(100).optional(),
});

export type TestRSSFeedData = z.infer<typeof testRSSFeedSchema>;

// Article selection schema
export const selectedArticleSchema = z.object({
  title: z.string().min(1, "Article title is required"),
  url: urlValidation,
  publishedAt: z.string().min(1, "Published date is required"),
});

export type SelectedArticleData = z.infer<typeof selectedArticleSchema>;

// Complete RSS source creation schema
export const createRSSSourceSchema = rssSourceSchema.extend({
  goldenArticleUrl: z.string().url().optional(),
  goldenArticleTitle: z.string().optional(),
  goldenArticleDate: z.number().optional(),
});

export type CreateRSSSourceData = z.infer<typeof createRSSSourceSchema>;