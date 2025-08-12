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
import { Pencil, Trash2 } from "lucide-react";
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

  // Normalize a token: trim and strip leading/trailing non-token chars; allow internal -, +, ., #
  const normalizeToken = (input: string): string => {
    return (input || "")
      .trim()
      .replace(/^[^A-Za-z0-9#+.-]+|[^A-Za-z0-9#+.-]+$/g, "");
  };

  // Recursively extract text from React nodes (handles nested elements)
  const extractText = (node: any): string => {
    if (node == null) return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node && typeof node === "object" && (node as any).props && (node as any).props.children) {
      return extractText((node as any).props.children);
    }
    return "";
  };

  const handleDelete = async () => {
    try {
      await deleteArticle({ id: resolvedParams.id as Id<"articles"> });
      router.push("/");
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  const topicSearch = (topic: string) => {
    console.log("Topic search clicked:", topic);
    // Future: Navigate to search page or filter articles by topic
  };

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <LoadingAnimation size={60} className="py-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Banner Image */}
      {article.imageUrl && (
        <div className="relative w-full h-[300px] mb-8 rounded-lg overflow-hidden">
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
        <h1 className="text-4xl font-extrabold mb-4">{article.title}</h1>
        
        <div className="flex items-center gap-4 text-gray-600 mb-8">
          <span className="capitalize">{article.category?.name}</span>
          <span>•</span>
          <span>{new Date(article._creationTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>

        {/* Topics */}
        {article.topics && article.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.topics.map((topic, index) => (
              topic && (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {topic}
                </span>
              )
            ))}
          </div>
        )}

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          {/* Fallback: If ReactMarkdown fails, show as formatted text */}
          {!article.body && (
            <div className="text-gray-500 italic">No article content available</div>
          )}
          
          {article.body && (
            <>
              
              {/* ReactMarkdown version */}
              <ReactMarkdown
            components={{
              p: ({children, ...props}) => (
                <p className="mb-4 leading-relaxed text-gray-700" {...props}>
                  {children}
                </p>
              ),
              strong: ({children, ...props}) => {
                const rawText = extractText(children);
                const token = normalizeToken(rawText);
                const tokenLower = token.toLowerCase();
                const topicsSet = new Set(
                  (article.topics || [])
                    .map((t: string) => normalizeToken(t).toLowerCase())
                    .filter(Boolean)
                );

                if (token && topicsSet.has(tokenLower)) {
                  return (
                    <button
                      onClick={() => topicSearch(token)}
                      className={`font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none p-0 inline ${
                        (props as any)?.className || ""
                      }`}
                    >
                      {children}
                    </button>
                  );
                }
                
                return <strong className="font-bold text-gray-900" {...props}>{children}</strong>;
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
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Sources</h3>
            <div className="space-y-3">
              {article.sourceUrls.map((url, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-sm text-gray-500 mt-1 font-medium">
                    [{index + 1}]
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all text-sm leading-relaxed transition-colors"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
            {article.isAutoGenerated && (
              <p className="text-xs text-gray-500 mt-4 italic">
                This article was fact-checked using AI verification across multiple sources.
              </p>
            )}
          </div>
        )}

        {/* Edit and Delete Buttons - Only visible to admin */}
        {isAdmin(user?.id) && (
          <div className="mt-8 flex justify-end gap-4">
            <Link href={`/admin/articles/${resolvedParams.id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Article
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Article
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the article
                    and remove the data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </article>

      <div className="max-w-3xl mx-auto mt-16">
        <CommentSection articleId={article._id} />
      </div>
    </div>
  );
}
