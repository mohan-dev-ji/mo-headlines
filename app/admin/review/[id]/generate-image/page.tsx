"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GenerateImagePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const articleId = resolvedParams.id as Id<"articles">;
  const article = useQuery(api.articles.getArticle, { id: articleId });
  const generateImage = useAction(api.articles.generateImageWithDallE);
  const saveImage = useAction(api.articles.saveGeneratedImage);
  
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isCustomPrompt, setIsCustomPrompt] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>("");

  // Initialize with existing image and prompt if available
  useEffect(() => {
    if (article) {
      if (article.imageUrl) {
        setGeneratedImage(article.imageUrl);
      }
      // TODO: Load prompts from new prompts table
      setCurrentPrompt("");
      setSelectedPrompt("");
    }
  }, [article]);

  const handlePromptChange = (value: string) => {
    if (value === "custom") {
      setIsCustomPrompt(true);
      setSelectedPrompt("");
    } else {
      setIsCustomPrompt(false);
      setSelectedPrompt(value);
      setCustomPrompt("");
    }
  };

  const handleGenerateImage = async () => {
    const promptToUse = isCustomPrompt ? customPrompt : selectedPrompt;
    if (!promptToUse) return;
    
    setIsGenerating(true);
    try {
      const result = await generateImage({ prompt: promptToUse });
      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setCurrentPrompt(promptToUse);
        toast.success("Image generated successfully!");
      } else {
        toast.error("Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage || !currentPrompt) return;
    
    try {
      toast.loading("Saving image...");
      await saveImage({ 
        articleId, 
        imageUrl: generatedImage,
        promptUsed: currentPrompt
      });
      toast.success("Image saved successfully!");
      router.push(`/admin/review/edit/${articleId}`);
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/review/edit/${articleId}`);
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="text-headline-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-[var(--padding-md)] px-[var(--padding-md)]">
      {/* Main Content - Centered Card */}
      <div className="py-8 bg-brand-card rounded-md">
        <div className="max-w-2xl mx-auto">
          <div className="bg-brand-card-dark border border-brand-line rounded-lg">
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-brand-line flex items-center justify-between">
              <h1 className="text-lg font-semibold text-headline-primary">Image Generation</h1>
              <Button 
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="text-headline-primary hover:bg-brand-card"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Card Content */}
            <div className="px-6 py-6">
              <div className="space-y-6">
                {/* Prompts Section */}
                <div className="space-y-2">
                  <label className="text-headline-primary font-medium">Prompts</label>
                  <Select value={selectedPrompt} onValueChange={handlePromptChange}>
                    <SelectTrigger className="w-full bg-brand-card border-brand-line text-body-primary">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent className="w-full max-w-none">
                      {/* TODO: Load prompts from new prompts table */}
                      <SelectItem value="custom">
                        Create Custom Prompt
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Prompt Input */}
                {isCustomPrompt && (
                  <div className="space-y-2">
                    <Input
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter your custom image generation prompt..."
                      className="bg-brand-card border-brand-line text-body-primary"
                    />
                  </div>
                )}

                {/* Selected Prompt Display */}
                {(selectedPrompt || customPrompt) && (
                  <div className="bg-brand-card-dark p-4 rounded-lg border border-brand-line">
                    <p className="text-body-primary text-sm leading-relaxed">
                      "{isCustomPrompt ? customPrompt : selectedPrompt}"
                    </p>
                  </div>
                )}

                {/* Generate Image Button */}
                <Button 
                  onClick={handleGenerateImage}
                  disabled={(!selectedPrompt && !customPrompt) || isGenerating}
                  className="w-full bg-white text-black hover:bg-gray-100 font-medium py-3"
                >
                  {isGenerating ? "Generating..." : "Generate Image"}
                </Button>

                {/* Preview Area */}
                <div className="bg-brand-card border-2 border-dashed border-brand-line rounded-lg aspect-[16/10] flex items-center justify-center">
                  {generatedImage ? (
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <span className="text-body-secondary font-medium text-lg">Preview</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Card Footer */}
            <div className="px-6 py-4 border-t border-brand-line flex justify-end gap-3">
              <Button 
                onClick={handleSave}
                disabled={!generatedImage}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </Button>
              
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="text-headline-secondary border-brand-line hover:bg-zinc-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}