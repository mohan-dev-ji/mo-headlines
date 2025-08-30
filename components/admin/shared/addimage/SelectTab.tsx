"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface SelectTabProps {
  articleId?: Id<"articles">;
  showGalleryBrowser: boolean;
  onImageSelected: (imageData: {
    id?: Id<"images">;
    url: string;
    source: "selected" | "uploaded";
    metadata?: {
      rating?: number;
      promptText?: string;
    };
  }) => void;
  onImageUploaded: (imageData: {
    id?: Id<"images">;
    url: string;
    source: "uploaded";
    metadata?: {
      rating?: number;
      model?: string;
      promptText?: string;
      customPrompt?: string;
    };
  }) => void;
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

export function SelectTab({
  articleId,
  showGalleryBrowser,
  onImageSelected,
  onImageUploaded,
  selectedImage,
}: SelectTabProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [customRating, setCustomRating] = useState<string>("5");
  const [customPrompt, setCustomPrompt] = useState("");
  const [customModel, setCustomModel] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const generateUploadUrl = useMutation(api.articles.generateUploadUrl);

  // Helper function to update parent when we have valid data
  const updateParentIfValid = (prompt: string, rating: string, model: string) => {
    // Only update if we have preview (file selected) and prompt text
    if (uploadPreview && prompt.trim()) {
      onImageUploaded({
        url: uploadPreview, // This is the data URL for preview
        source: "uploaded",
        metadata: {
          rating: parseInt(rating),
          model: model.trim() || undefined,
          promptText: prompt.trim(),
          customPrompt: prompt.trim(),
        },
      });
    }
  };

  // File input handler
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string);
        // Update parent if we have a prompt
        updateParentIfValid(customPrompt, customRating, customModel);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrowseDevice = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleFileSelect(e as any);
    input.click();
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload to Convex storage (temporary - will be moved to Cloudflare later)
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": uploadedFile.type },
        body: uploadedFile,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await response.json();

      // TODO: Create image record in new architecture with custom prompt and rating
      // For now, we'll use the temporary storage ID
      onImageUploaded({
        url: uploadPreview!, // Using preview URL temporarily
        source: "uploaded",
        metadata: {
          rating: parseInt(customRating),
          model: customModel.trim() || undefined,
          promptText: customPrompt.trim() || undefined,
          customPrompt: customPrompt.trim() || undefined,
        },
      });

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(
        `Failed to upload image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Browse Device Button */}
      <div>
        <Button
          onClick={handleBrowseDevice}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
          variant="outline"
        >
          Browse Device
        </Button>
      </div>

      {/* Preview Section */}
      <div>
        <Label className="text-body-primary text-sm font-medium">Preview</Label>
        <div className="mt-2 aspect-[16/10] bg-gray-300 rounded-lg flex items-center justify-center">
          {(selectedImage && selectedImage.url) || uploadPreview ? (
            <img
              src={selectedImage?.url || uploadPreview!}
              alt="Selected preview"
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-600 font-medium">Preview</span>
          )}
        </div>
      </div>

      {/* Prompt Input */}
      <div>
        <Label className="text-body-primary text-sm font-medium">Prompt</Label>
        <Textarea
          placeholder="Type prompt..."
          value={customPrompt}
          onChange={(e) => {
            const newPrompt = e.target.value;
            setCustomPrompt(newPrompt);
            updateParentIfValid(newPrompt, customRating, customModel);
          }}
          className="mt-2 min-h-[80px] border border-brand-line text-body-primary placeholder:text-body-secondary"
        />
      </div>

      {/* Rating Dropdown */}
      <div>
        <Label className="text-body-primary text-sm font-medium">Rating</Label>
        <Select value={customRating} onValueChange={(newRating) => {
          setCustomRating(newRating);
          updateParentIfValid(customPrompt, newRating, customModel);
        }}>
          <SelectTrigger className="mt-2 border border-brand-line text-body-primary">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => (
              <SelectItem key={rating} value={rating.toString()}>
                {rating} - {rating <= 3 ? 'Poor' : rating <= 6 ? 'Average' : rating <= 8 ? 'Good' : 'Excellent'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Input */}
      <div>
        <Label className="text-body-primary text-sm font-medium">Model</Label>
        <Input
          value={customModel}
          onChange={(e) => {
            const newModel = e.target.value;
            setCustomModel(newModel);
            updateParentIfValid(customPrompt, customRating, newModel);
          }}
          placeholder="Type model..."
          className="mt-2 border border-brand-line text-body-primary"
        />
      </div>
    </div>
  );
}