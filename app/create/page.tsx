"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormEvent, useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CategorySelector } from "@/components/category-selector";
import { TopicsSelector } from "@/components/topics-selector";
import { Id } from "@/convex/_generated/dataModel";
import { RichTextEditor } from "@/components/rich-text-editor";

// Form schema validation
const formSchema = z.object({
  title: z.string().min(5, "Title too short"),
  body: z.string(),
  categoryId: z.string().min(1, "Please select a category"),
});

export default function CreatePage() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicIds, setTopicIds] = useState<Id<"topics">[]>([]);
  const createArticle = useMutation(api.articles.createArticle);
  const generateUploadUrl = useMutation(api.articles.generateUploadUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
      categoryId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);

      let imageStorageId: string | undefined;
      if (selectedImageFile) {
        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl();
        
        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImageFile.type },
          body: selectedImageFile,
        });
        const { storageId } = await result.json();
        imageStorageId = storageId;
      }

      // Create article with all data including image storage ID
      const { articleId } = await createArticle({
        title: values.title,
        body: values.body,
        categoryId: values.categoryId as Id<"categories">,
        topicIds,
        imageStorageId,
      });

      console.log("Article created with ID:", articleId);
      router.push(`/article/${articleId}`);
    } catch (error) {
      console.error("Error creating article:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Article</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <FormLabel>Banner Image</FormLabel>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
            >
              <input {...getInputProps()} />
              {previewUrl ? (
                <div className="relative w-full h-[400px]">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                  />
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
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter article title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategorySelector
                    value={field.value?.toString() || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Topics */}
          <TopicsSelector
            value={topicIds}
            onChange={setTopicIds}
          />

          {/* Body */}
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article Content</FormLabel>
                <FormControl>
                  <RichTextEditor
                    content={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Article"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
