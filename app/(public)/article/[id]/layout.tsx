import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const article = await fetchQuery(api.articles.getArticle, {
      id: resolvedParams.id as Id<"articles">
    });

    if (!article) {
      return {
        title: "Article Not Found | The Headlines",
        description: "The requested article could not be found.",
      };
    }

    const publishedDate = new Date(article.publishedAt || article._creationTime).toISOString();
    const excerpt = article.excerpt || article.body?.substring(0, 160) || article.title;

    return {
      title: `${article.title} | The Headlines`,
      description: excerpt,
      openGraph: {
        title: article.title,
        description: excerpt,
        type: "article",
        publishedTime: publishedDate,
        section: article.category?.name,
        images: article.imageUrl ? [
          {
            url: article.imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
          }
        ] : undefined,
        url: `https://theheadlines.io/article/${resolvedParams.id}`,
        siteName: "The Headlines",
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: excerpt,
        images: article.imageUrl ? [article.imageUrl] : undefined,
      },
      other: {
        "article:published_time": publishedDate,
        "article:section": article.category?.name || "News",
      },
    };
  } catch (error) {
    console.error("Error fetching article metadata:", error);
    return {
      title: "The Headlines",
      description: "Professional news aggregation with fact-checking and source transparency",
    };
  }
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
