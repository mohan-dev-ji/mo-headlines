"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { CommentSection } from "@/components/CommentSection";

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
    return <div className="p-8">Loading article...</div>;
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
          <span>{new Date(article.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>

        {/* Topics */}
        {article.topics && article.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {article.topics.map((topic) => (
              topic && (
                <span
                  key={topic._id}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {topic.name}
                </span>
              )
            ))}
          </div>
        )}

        {/* Article Body */}
        <div 
          className="prose prose-lg max-w-none [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:mb-4 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>img]:rounded-lg [&>img]:my-4"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* Edit and Delete Buttons - Only visible to admin */}
        {isAdmin(user?.id) && (
          <div className="mt-8 flex justify-end gap-4">
            <Link href={`/article/${resolvedParams.id}/edit`}>
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
