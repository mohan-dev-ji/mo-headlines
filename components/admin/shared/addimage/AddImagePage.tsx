"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import { GenerateTab } from "./GenerateTab";
import { SelectTab } from "./SelectTab";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AddImagePageProps {
  // Context detection
  articleId?: Id<"articles">;
  returnUrl?: string;
  
  // Callbacks
  onImageSelected?: (imageId: Id<"images">) => void;
  onCancel?: () => void;
}

interface SelectedImageData {
  id?: Id<"images">;
  url: string;
  source: "generated" | "uploaded" | "selected";
  promptId?: Id<"prompts">;
  metadata?: {
    rating?: number;
    model?: string;
    promptText?: string;
  };
}

export function AddImagePage({
  articleId,
  returnUrl,
  onImageSelected,
  onCancel,
}: AddImagePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Determine context from props or URL params
  const contextArticleId = articleId || (searchParams?.get("articleId") as Id<"articles">);
  const contextReturnUrl = returnUrl || searchParams?.get("returnUrl");
  const isArticleContext = !!contextArticleId;
  const isGalleryContext = !contextArticleId;

  const [activeTab, setActiveTab] = useState<"generate" | "select">("generate");
  const [selectedImage, setSelectedImage] = useState<SelectedImageData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Query article data when in article context to load existing image
  const article = useQuery(
    api.articles.getArticle,
    isArticleContext ? { id: contextArticleId } : "skip"
  );

  // Mutations
  const createStandaloneImage = useMutation(api.images.createStandaloneImage);
  const createStandalonePrompt = useMutation(api.prompts.createStandalonePrompt);
  const attachImageToArticle = useMutation(api.articles.attachImageToArticle);

  // Load existing article image when in article context
  useEffect(() => {
    if (article && article.imageUrl && !selectedImage) {
      // Article has an existing image, load it into the preview
      setSelectedImage({
        url: article.imageUrl,
        source: "selected",
        id: article.imageId || undefined,
        metadata: {
          rating: article.imageRating || undefined,
          model: article.imageModel || undefined,
          promptText: "Previously generated image", // Placeholder - could get from prompt table
        }
      });
    }
  }, [article, selectedImage]);

  const handleImageGenerated = (imageData: SelectedImageData) => {
    console.log("handleImageGenerated called with:", imageData);
    setSelectedImage(imageData);
    toast.success("Image generated successfully!");
  };

  const handleRatingChanged = (newRating: number) => {
    console.log("handleRatingChanged called with:", newRating);
    if (selectedImage) {
      setSelectedImage({
        ...selectedImage,
        metadata: {
          ...selectedImage.metadata,
          rating: newRating,
        },
      });
    }
  };

  const handleImageSelected = (imageData: SelectedImageData) => {
    setSelectedImage(imageData);
    toast.success("Image selected!");
  };

  const handleImageUploaded = (imageData: SelectedImageData) => {
    setSelectedImage(imageData);
    // Don't show toast here since this is called on every form change
  };

  const handleSave = async () => {
    if (!selectedImage) {
      toast.error("No image selected");
      return;
    }

    // For SelectTab, also require prompt
    if (activeTab === "select" && !selectedImage.metadata?.promptText?.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsProcessing(true);
    
    try {
      let finalImageId = selectedImage.id;

      // If image doesn't have an ID yet, we need to upload to R2 and save to database
      if (!selectedImage.id && selectedImage.url && (selectedImage.source === "generated" || selectedImage.source === "uploaded")) {
        toast.info("Uploading image to cloud storage...");

        // Upload to R2
        let uploadResponse;
        
        if (selectedImage.source === "uploaded" && selectedImage.url.startsWith("data:")) {
          // Handle uploaded file (data URL) - convert to blob and upload
          const response = await fetch(selectedImage.url);
          const blob = await response.blob();
          const file = new File([blob], `uploaded-${Date.now()}.${blob.type.split('/')[1]}`, { type: blob.type });
          
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('file', file);
          formData.append('metadata', JSON.stringify({
            model: selectedImage.metadata?.model || "Unknown",
            promptText: selectedImage.metadata?.promptText,
          }));
          
          uploadResponse = await fetch("/api/images/upload", {
            method: "POST",
            body: formData,
          });
        } else {
          // Handle generated image (URL from DALL-E)
          uploadResponse = await fetch("/api/images/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageUrl: selectedImage.url,
              fileName: `generated-${Date.now()}.png`,
              metadata: {
                model: selectedImage.metadata?.model || "DALL-E 3",
                promptText: selectedImage.metadata?.promptText,
              },
            }),
          });
        }

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("Upload API error:", errorText);
          throw new Error(`Failed to upload image to cloud storage: ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();
        
        // Create image record in database with R2 URLs
        toast.info("Saving image to database...");
        
        console.log("About to save image with rating:", selectedImage.metadata?.rating);
        
        // For uploaded images without promptId, we need to create a standalone prompt first
        let promptIdToUse = selectedImage.promptId;
        if (!promptIdToUse && selectedImage.metadata?.promptText) {
          console.log("Creating standalone prompt for uploaded image");
          const promptResult = await createStandalonePrompt({
            prompt: selectedImage.metadata.promptText,
          });
          promptIdToUse = promptResult.promptId;
        }
        
        if (promptIdToUse) {
          const imageResult = await createStandaloneImage({
            promptId: promptIdToUse,
            cloudflareUrl: uploadResult.cloudflareUrl,
            cloudflareKey: uploadResult.cloudflareKey,
            model: selectedImage.metadata?.model || (selectedImage.source === "uploaded" ? "Unknown" : "DALL-E 3"),
            rating: selectedImage.metadata?.rating,
          });
          
          finalImageId = imageResult.imageId;
        }
        
        toast.success("Image saved successfully!");
      }

      if (finalImageId) {
        // If we're in article context, attach the image to the article
        if (isArticleContext && contextArticleId) {
          toast.info("Attaching image to article...");
          await attachImageToArticle({
            articleId: contextArticleId,
            imageId: finalImageId,
          });
          toast.success("Image attached to article!");
        }
        
        onImageSelected?.(finalImageId);
      }

      // Navigation handling
      if (contextReturnUrl) {
        router.push(contextReturnUrl);
      } else if (isGalleryContext) {
        router.push(`/admin/images`);
      } else {
        router.push(`/admin/review/pending`);
      }
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (contextReturnUrl) {
      router.push(contextReturnUrl);
    } else if (isArticleContext) {
      router.push(`/admin/review/pending`);
    } else {
      router.push(`/admin/images`);
    }
  };

  return (
    <div className="container mx-auto min-h-screen">
    {/* Page Background Container */}
    <div className="bg-brand-card-dark rounded-lg p-[var(--padding-md)] min-h-full flex justify-center">
      {/* Modal Container fills height */}
      <div className="w-full max-w-2xl bg-brand-card rounded-lg border border-brand-line flex flex-col h-full">
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-headline-primary">Add Image</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0 text-body-secondary hover:text-headline-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs system takes all remaining space */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "generate" | "select")}
          className="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <TabsList className="shrink-0 grid w-full grid-cols-2 bg-brand-card-dark rounded-0">
            <TabsTrigger value="generate" className="data-[state=active]:bg-brand-card">
              Generate
            </TabsTrigger>
            <TabsTrigger value="select" className="data-[state=active]:bg-brand-card">
              Select
            </TabsTrigger>
          </TabsList>

          {/* Scrollable tab content */}
          <TabsContent
            value="generate"
            className="flex-1 min-h-0 p-6 bg-transparent"
          >
            {isArticleContext ? (
              <GenerateTab
                articleId={contextArticleId!}
                onImageGenerated={handleImageGenerated}
                onRatingChanged={handleRatingChanged}
                selectedImage={selectedImage}
              />
            ) : (
              <GenerateTab
                articleId={"test-article-id" as Id<"articles">}
                onImageGenerated={handleImageGenerated}
                onRatingChanged={handleRatingChanged}
                selectedImage={selectedImage}
              />
            )}
          </TabsContent>

          <TabsContent
            value="select"
            className="flex-1 min-h-0 overflow-auto p-6 bg-transparent"
          >
            <SelectTab
              articleId={contextArticleId}
              showGalleryBrowser={isArticleContext}
              onImageSelected={handleImageSelected}
              onImageUploaded={handleImageUploaded}
              selectedImage={selectedImage}
            />
          </TabsContent>
        </Tabs>

        {/* Modal Footer (always visible) */}
        <div className="shrink-0 flex items-center justify-end gap-3 p-4 border-t border-brand-line">
         
          <Button
            onClick={handleSave}
            disabled={
              !selectedImage || 
              isProcessing ||
              (activeTab === "select" && !selectedImage?.metadata?.promptText?.trim())
            }
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? "Saving..." : "Save"}
          </Button>

          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isProcessing}
            className="text-headline-secondary border-brand-line hover:bg-zinc-200"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
}