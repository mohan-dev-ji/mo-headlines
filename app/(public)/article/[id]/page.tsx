"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Trash2 } from "lucide-react";
import { isAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CommentSection } from "@/components/public/CommentSection";
import ReactMarkdown from "react-markdown";

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const article = useQuery(api.articles.getArticle, { id: resolvedParams.id as Id<"articles"> });
  const deleteArticle = useMutation(api.articles.deleteArticle);
  const { user } = useUser();
  const router = useRouter();


  const handleDelete = async () => {
    try {
      await deleteArticle({ id: resolvedParams.id as Id<"articles"> });
      router.push("/");
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };


  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <LoadingAnimation size={60} className="py-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-card">
      <div className="max-w-2xl mx-auto px-4 py-8 bg-brand-background">
      {/* Banner Image */}
      {article.imageUrl && (
        <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
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
        <h1 className="text-4xl font-extrabold mb-4 text-headline-primary">{article.title}</h1>
        
        <div className="flex items-center gap-4 text-body-primary mb-8">
          <span className="capitalize">{article.category?.name}</span>
          <span>•</span>
          <span>{new Date(article._creationTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>


        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          {/* Fallback: If ReactMarkdown fails, show as formatted text */}
          {!article.body && (
            <div className="text-body-primary italic">No article content available</div>
          )}
          
          {article.body && (
            <>
              
              {/* ReactMarkdown version */}
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
            {article.body}
          </ReactMarkdown>
            </>
          )}
        </div>

        {/* Sources Section */}
        {article.sourceUrls && article.sourceUrls.length > 0 && (
          <div className="mt-8 p-6 bg-brand-card rounded-lg border-brand-line">
            <h3 className="text-lg font-semibold mb-4 text-headline-primary">Sources</h3>
            <div className="space-y-3">
              {article.sourceUrls.map((url, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-sm text-body-primary mt-1 font-medium">
                    [{index + 1}]
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-primary hover:text-headline-primary underline break-all text-sm leading-relaxed transition-colors"
                  >
                    {url}
                  </a>
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
