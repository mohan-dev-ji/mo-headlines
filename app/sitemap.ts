import { MetadataRoute } from 'next';
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://theheadlines.io';

  // Fetch all approved articles
  const articles = await fetchQuery(api.articles.getAllArticles);
  const approvedArticles = articles?.filter(article => article.status === "approved") || [];

  // Create article URLs
  const articleUrls = approvedArticles.map((article) => ({
    url: `${baseUrl}/article/${article._id}`,
    lastModified: new Date(article._creationTime),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 1.0,
    },
  ];

  return [...staticPages, ...articleUrls];
}
