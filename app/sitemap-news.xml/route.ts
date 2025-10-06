import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET() {
  const baseUrl = 'https://theheadlines.io';

  // Fetch approved articles from the last 2 days (Google News requirement)
  const articles = await fetchQuery(api.articles.getAllArticles);
  const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);

  const recentArticles = articles?.filter(article =>
    article.status === "approved" &&
    article._creationTime >= twoDaysAgo
  ) || [];

  // Generate Google News sitemap XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentArticles.map((article) => {
  const pubDate = new Date(article.publishedAt || article._creationTime);
  const formattedDate = pubDate.toISOString();

  return `  <url>
    <loc>${baseUrl}/article/${article._id}</loc>
    <news:news>
      <news:publication>
        <news:name>The Headlines</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${formattedDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`;
}).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
