"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { CategorySelector } from "@/components/category-selector";
import { RichTextEditor } from "@/components/rich-text-editor";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const article = useQuery(api.articles.getArticle, { id: resolvedParams.id as Id<"articles"> });
  const updateArticle = useMutation(api.articles.updateArticle);
  const generateUploadUrl = useMutation(api.articles.generateUploadUrl);
  const createTopic = useMutation(api.topics.createTopic);
  const { user } = useUser();
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [showCurrentImage, setShowCurrentImage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryId, setCategoryId] = useState<Id<"categories"> | null>(null);
  const [bodyContent, setBodyContent] = useState<string>("");

  useEffect(() => {
    if (article) {
      setCategoryId(article.categoryId);
      setBodyContent(article.body);
    }
  }, [article]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
        setShowCurrentImage(false);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
  });

  const handleRemoveImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewUrl(null);
    setSelectedImageFile(null);
    setShowCurrentImage(false);
  }, []);

  const handleCategoryChange = (value: string) => {
    setCategoryId(value as Id<"categories">);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!article || !categoryId) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const topicNames = (formData.get("topics") as string).split(",").map(tag => tag.trim());
      const body = bodyContent;

      console.log("Submitting article with:", {
        title,
        body,
        topicNames,
        categoryId,
      });

      // Get or create topics and collect their IDs
      const topicIds = await Promise.all(
        topicNames.map(async (name) => {
          const { topicId } = await createTopic({ name });
          return topicId;
        })
      );

      let imageStorageId = article.imageStorageId;
      
      // If a new image was selected, upload it
      if (selectedImageFile) {
        const uploadUrl = await generateUploadUrl();
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImageFile.type },
          body: selectedImageFile,
        });
        
        if (!response.ok) {
          throw new Error("Failed to upload image");
        }
        
        const { storageId } = await response.json();
        imageStorageId = storageId;
      } else if (!showCurrentImage) {
        // If the current image was removed, set imageStorageId to undefined
        imageStorageId = undefined;
      }

      await updateArticle({
        id: article._id,
        title,
        categoryId,
        topicIds,
        body,
        imageStorageId,
      });

      // On success, redirect to the article page
      router.push(`/article/${resolvedParams.id}`);
    } catch (error) {
      console.error("Error updating article:", error);
      alert("Failed to update article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!article) {
    return <div className="p-8">Loading article...</div>;
  }

  if (!isAdmin(user?.id)) {
    router.push(`/article/${resolvedParams.id}`);
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2 mb-8">
          <Label>Banner Image</Label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            {previewUrl ? (
              <div className="relative w-full h-[400px]">
                <div className="w-full h-full">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg pointer-events-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-2 hover:bg-white z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : showCurrentImage && article.imageUrl ? (
              <div className="relative w-full h-[400px]">
                <div className="w-full h-full">
                  <Image
                    src={article.imageUrl}
                    alt="Current article image"
                    fill
                    className="object-cover rounded-lg pointer-events-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-2 hover:bg-white z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive
                    ? "Drop the image here"
                    : "Drag and drop an image here, or click to select"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={article.title}
            placeholder="Enter article title"
            required
          />
        </div>

         {/* Topics */}
         <div className="space-y-2">
          <Label htmlFor="topics">Topics (comma-separated)</Label>
          <Input
            id="topics"
            name="topics"
            defaultValue={article.topics?.map(topic => topic?.name || "").join(", ")}
            placeholder="Enter topics, separated by commas"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <CategorySelector
            value={categoryId || ""}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <Label htmlFor="body">Content</Label>
          <RichTextEditor
            content={bodyContent}
            onChange={(content) => {
              console.log("Content changed:", content);
              setBodyContent(content);
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
} 