"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CommentSection } from "@/components/public/CommentSection";
import ReactMarkdown from "react-markdown";

interface ArticleBodyWithImageProps {
  body?: string;
  imageUrl?: string;
  imageAlt: string;
}

function ArticleBodyWithImage({ body, imageUrl, imageAlt }: ArticleBodyWithImageProps) {
  if (!body) {
    return <div className="text-body-primary italic">No article content available</div>;
  }

  // Split content into paragraphs for desktop image insertion
  const paragraphs = body.split('\n\n');
  const firstParagraph = paragraphs[0];
  const restOfContent = paragraphs.slice(1).join('\n\n');

  return (
    <div className="prose prose-lg max-w-none">
      {/* First paragraph */}
      <ReactMarkdown
        components={{
          p: ({children, ...props}) => (
            <p className="mb-4 leading-relaxed text-body-primary" {...props}>
              {children}
            </p>
          ),
        }}
      >
        {firstParagraph}
      </ReactMarkdown>

      {/* Desktop Image - Shows after first paragraph on desktop only */}
      {imageUrl && (
        <div className="relative w-full aspect-video my-8 rounded-lg overflow-hidden hidden md:block">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Rest of content */}
      {restOfContent && (
        <ReactMarkdown
          components={{
            p: ({children, ...props}) => (
              <p className="mb-4 leading-relaxed text-body-primary" {...props}>
                {children}
              </p>
            ),
            h3: ({children, ...props}) => (
              <h3 className="text-lg font-semibold mt-6 mb-4 text-headline-primary" {...props}>
                {children}
              </h3>
            ),
            h2: ({children, ...props}) => (
              <h2 className="text-xl font-semibold mt-6 mb-4 text-headline-primary" {...props}>
                {children}
              </h2>
            ),
            strong: ({children, ...props}) => {
              return <strong className="font-bold text-body-primary" {...props}>{children}</strong>;
            }
          }}
        >
          {restOfContent}
        </ReactMarkdown>
      )}
    </div>
  );
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const article = useQuery(api.articles.getArticle, { id: resolvedParams.id as Id<"articles"> });
  const relatedArticles = useQuery(
    api.articles.getArticlesByCategory, 
    article?.categoryId ? { categoryId: article.categoryId } : "skip"
  );
  const router = useRouter();

  // Filter out current article, get approved articles, sort by most recent, and get first 4
  const moreHeadlines = relatedArticles
    ?.filter(a => a._id !== article?._id && a.status === "approved")
    .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
    .slice(0, 4) || [];


  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <LoadingAnimation size={60} className="py-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-card-dark py-page-y">
      {/* Article Content */}
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
      {/* Mobile Banner Image - Shows at top on mobile only */}
      {article.imageUrl && (
        <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden md:hidden">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Content */}
      <article className="prose prose-lg max-w-none">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-4xl text-headline-primary font-abhaya-libre md:text-4xl flex-1 pr-4">{article.title}</h1>
          {/* Close Button - Desktop only, next to title */}
          <div className="hidden md:block">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="icon"
              className="bg-brand-card hover:bg-white/20 rounded-lg"
            >
              <X className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Close Button - Fixed position */}
        <div className="fixed top-6 right-6 z-10 md:hidden">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="icon"
            className="bg-white/90 hover:bg-white rounded-lg shadow-lg"
          >
            <X className="h-6 w-6 text-zinc-600" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 text-body-primary mb-6">
          <span className="capitalize">{article.category?.name}</span>
          <span>•</span>
          <span>Published on {new Date(article._creationTime).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long', 
            year: 'numeric'
          })}</span>
        </div>

        {/* Sources Carousel - Right under date */}
        {article.sourceUrls && article.sourceUrls.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-headline-primary">Sources</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {article.sourceUrls.map((source, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-48 p-4 bg-brand-card rounded-lg hover:bg-brand-card/80 transition-colors"
                >
                  <a
                    href={typeof source === 'string' ? source : source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="text-sm font-medium text-body-primary mb-2">
                      {typeof source === 'string' ? 
                        new URL(source).hostname.replace('www.', '') : 
                        source.domain
                      }
                    </div>
                    <div className="text-sm text-headline-primary line-clamp-2 leading-tight">
                      {typeof source === 'string' ? 
                        source : 
                        source.title || source.url
                      }
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Article Body with Desktop Image Insertion */}
        <ArticleBodyWithImage 
          body={article.body} 
          imageUrl={article.imageUrl || undefined}
          imageAlt={article.title}
        />

        {/* More Headlines Section */}
        {moreHeadlines.length > 0 && (
          <div className="mt-16 rounded-lg">
            <h2 className="text-2xl font-bold mb-8 text-headline-primary font-abhaya-libre">More Headlines</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moreHeadlines.map((relatedArticle) => (
                <div 
                  key={relatedArticle._id}
                  onClick={() => router.push(`/article/${relatedArticle._id}`)}
                  className="cursor-pointer group bg-brand-card rounded-lg overflow-hidden hover:bg-brand-card/80 transition-colors flex flex-col h-64"
                >
                  <div className="relative h-1/2 rounded-t-lg overflow-hidden bg-brand-card-dark">
                    {relatedArticle.imageUrl && (
                      <Image
                        src={relatedArticle.imageUrl}
                        alt={relatedArticle.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    )}
                  </div>
                  <div className="p-4 space-y-2 h-1/2 flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-headline-primary line-clamp-2 leading-tight">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-xs text-body-primary line-clamp-2 leading-relaxed">
                      {relatedArticle.excerpt || `${relatedArticle.body?.substring(0, 100)}...`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      <div className="max-w-3xl mx-auto mt-16">
        <CommentSection articleId={article._id} />
      </div>
      </div>
    </div>
  );
}
