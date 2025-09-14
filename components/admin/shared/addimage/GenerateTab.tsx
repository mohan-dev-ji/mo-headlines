"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Loader2 } from "lucide-react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { PromptModal } from "../prompts/PromptModal";
import { toast } from "sonner";

interface GenerateTabProps {
  articleId?: Id<"articles"> | "test-article-id"; // Optional for gallery context
  onImageGenerated: (imageData: {
    id?: Id<"images">;
    url: string;
    source: "generated";
    promptId?: Id<"prompts">;
    metadata?: {
      rating?: number;
      model?: string;
      promptText?: string;
    };
  }) => void;
  onRatingChanged?: (rating: number) => void;
  selectedImage?: {
    id?: Id<"images">;
    url: string;
    source: "generated" | "uploaded" | "selected";
    promptId?: Id<"prompts">;
    metadata?: {
      rating?: number;
      model?: string;
      promptText?: string;
    };
  } | null;
}

export function GenerateTab({ 
  articleId, 
  onImageGenerated, 
  onRatingChanged,
  selectedImage 
}: GenerateTabProps) {
  const [selectedPromptText, setSelectedPromptText] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState<Id<"prompts"> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptModalMode, setPromptModalMode] = useState<"create" | "edit">("edit");
  const [rating, setRating] = useState<string>("5");

  // Debug logging for rating changes
  useEffect(() => {
    console.log("GenerateTab: Rating state changed to:", rating);
  }, [rating]);

  // Set rating from selectedImage when it loads (for existing images)
  useEffect(() => {
    if (selectedImage && selectedImage.metadata?.rating && selectedImage.source === "selected") {
      // This is an existing image with a rating, set it in the dropdown
      setRating(selectedImage.metadata.rating.toString());
    }
  }, [selectedImage]);

  // Determine if this is gallery context (no article)
  const isGalleryContext = !articleId || articleId === "test-article-id";
  
  // Fetch prompts for this article (skip if gallery context)
  const prompts = useQuery(
    api.prompts.getPromptsForArticle, 
    isGalleryContext ? "skip" : { articleId: articleId as Id<"articles"> }
  );
  
  // Mutations for standalone prompts
  const generateImage = useAction(api.articles.generateImageWithDallE);

  // Auto-select used prompt (or first prompt if none is marked as used)
  useEffect(() => {
    if (prompts && prompts.length > 0 && !selectedPromptText) {
      // First check if any prompt is marked as used
      const usedPrompt = prompts.find(p => p.isUsed);
      const promptToSelect = usedPrompt || prompts[0];
      
      setSelectedPromptText(promptToSelect.prompt);
      setSelectedPromptId(promptToSelect._id);
    }
    // Gallery context starts with empty prompt - user will create their own
  }, [prompts, selectedPromptText]);

  const handleEditPrompt = () => {
    // Always open modal for both gallery and article contexts
    if (isGalleryContext || (prompts && prompts.length === 0)) {
      setPromptModalMode("create");
    } else {
      setPromptModalMode("edit");
    }
    setShowPromptModal(true);
  };

  const handleGenerate = async () => {
    if (!selectedPromptText.trim()) {
      toast.error("Please create a prompt first");
      return;
    }

    setIsGenerating(true);

    try {
      // Generate image with DALL-E
      const result = await generateImage({
        prompt: selectedPromptText,
      });

      if (result.success && result.imageUrl) {
        // TODO: Upload to Cloudflare and create image record
        // For now, we'll use the temporary URL from DALL-E
        console.log("GenerateTab: About to call onImageGenerated with rating:", rating, "parsed as:", parseInt(rating));
        onImageGenerated({
          url: result.imageUrl,
          source: "generated",
          promptId: selectedPromptId || undefined,
          metadata: {
            rating: parseInt(rating),
            model: "DALL-E 3",
            promptText: selectedPromptText,
          },
        });

        toast.success("Image generated successfully!");
      } else {
        throw new Error("Image generation failed");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(
        `Failed to generate image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (!prompts && !isGalleryContext) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingAnimation size={80} />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 h-full">
        {/* Prompt Section */}
        <div>
          <Label className="text-body-primary text-sm font-medium mb-2 block">Prompt</Label>
          <div className="bg-brand-background border border-brand-line rounded-lg p-4 min-h-[100px] flex items-center">
            <p className="text-body-primary text-sm leading-relaxed">
              {selectedPromptText || (isGalleryContext ? "Click 'Edit Prompt' to create your prompt..." : "No prompt available")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleEditPrompt}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
          >
            Edit Prompt
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
            variant="outline"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Image"
            )}
          </Button>
        </div>

        {/* Preview Section */}
        <div>
          <Label className="text-body-primary text-sm font-medium mb-2 block">Preview</Label>
          <div className="aspect-[16/10] bg-gray-300 rounded-lg flex items-center justify-center">
            {selectedImage && selectedImage.url ? (
              <img
                src={selectedImage.url}
                alt="Generated preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-600 font-medium">Preview</span>
            )}
          </div>
        </div>

        {/* Rating Dropdown */}
        <div>
          <Label className="text-body-primary text-sm font-medium">Rating</Label>
          <Select value={rating} onValueChange={(value) => {
            console.log("GenerateTab: Rating dropdown changed to:", value);
            setRating(value);
            // If there's already a generated image, update its rating
            if (selectedImage && onRatingChanged) {
              onRatingChanged(parseInt(value));
            }
          }}>
            <SelectTrigger className="mt-2 border border-brand-line text-body-primary bg-brand-background">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((ratingValue) => (
                <SelectItem key={ratingValue} value={ratingValue.toString()}>
                  {ratingValue} - {ratingValue <= 3 ? 'Poor' : ratingValue <= 6 ? 'Average' : ratingValue <= 8 ? 'Good' : 'Excellent'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prompt Modal */}
      <PromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        onPromptCreated={(promptId, promptText) => {
          // Handle prompt created/edited
          setShowPromptModal(false);
          
          if (isGalleryContext && promptModalMode === "create" && promptText) {
            // For gallery context, load the created prompt into the Generate tab
            setSelectedPromptText(promptText);
            setSelectedPromptId(promptId);
          } else {
            // Article context - the selected prompt was marked as used in the modal
            // Update the GenerateTab to show the selected prompt
            if (promptText) {
              setSelectedPromptText(promptText);
              setSelectedPromptId(promptId);
            } else {
              // Reset to trigger useEffect to reload prompts and select the used one
              setSelectedPromptText("");
              setSelectedPromptId(null);
            }
          }
        }}
        articleId={isGalleryContext ? ("test-article-id" as Id<"articles">) : (articleId as Id<"articles">)}
        mode={promptModalMode}
        initialPrompt={promptModalMode === "edit" ? selectedPromptText : ""}
      />
    </>
  );
}