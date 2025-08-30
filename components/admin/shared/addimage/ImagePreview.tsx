"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Image as ImageIcon, 
  Wand2, 
  Upload, 
  FolderOpen, 
  Star, 
  Check, 
  X,
  Loader2
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ImagePreviewProps {
  selectedImage: {
    id?: Id<"images">;
    url: string;
    source: "generated" | "uploaded" | "selected";
    promptId?: Id<"prompts">;
    metadata?: {
      rating?: number;
      model?: string;
      promptText?: string;
      customPrompt?: string;
    };
  } | null;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  context: "article" | "gallery";
}

export function ImagePreview({
  selectedImage,
  onConfirm,
  onCancel,
  isProcessing,
  context,
}: ImagePreviewProps) {
  const getSourceIcon = (source: string) => {
    switch (source) {
      case "generated":
        return <Wand2 className="h-4 w-4" />;
      case "uploaded":
        return <Upload className="h-4 w-4" />;
      case "selected":
        return <FolderOpen className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "generated":
        return "AI Generated";
      case "uploaded":
        return "Uploaded";
      case "selected":
        return "Selected from Gallery";
      default:
        return "Unknown";
    }
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case "generated":
        return "default";
      case "uploaded":
        return "secondary";
      case "selected":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-body-primary">
          Image Preview
        </h3>
        <p className="text-sm text-body-secondary mt-1">
          {selectedImage 
            ? "Review and confirm your image selection"
            : "Select an image to see the preview"
          }
        </p>
      </div>

      {!selectedImage ? (
        /* Empty State */
        <Card className="bg-brand-surface border-brand-line">
          <CardContent className="p-8 text-center">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-body-tertiary opacity-50" />
            <p className="text-body-secondary font-medium mb-2">
              No image selected
            </p>
            <p className="text-sm text-body-tertiary">
              {context === "article" 
                ? "Generate an image or select one from the gallery"
                : "Upload an image or browse existing ones"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Image Preview */
        <div className="space-y-4">
          {/* Image Display */}
          <Card className="bg-brand-surface border-brand-line overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-brand-surface">
                <img
                  src={selectedImage.url}
                  alt="Selected image"
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Metadata */}
          <Card className="bg-brand-surface border-brand-line">
            <CardContent className="p-4 space-y-4">
              {/* Source Information */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSourceIcon(selectedImage.source)}
                  <span className="font-medium text-body-primary">
                    {getSourceLabel(selectedImage.source)}
                  </span>
                </div>
                <Badge variant={getSourceBadgeVariant(selectedImage.source)}>
                  {selectedImage.source}
                </Badge>
              </div>

              {/* Rating */}
              {selectedImage.metadata?.rating && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-body-primary">
                      Quality Rating
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-body-primary">
                        {selectedImage.metadata.rating}/10
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Model Information */}
              {selectedImage.metadata?.model && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-body-primary">
                      Generation Model
                    </span>
                    <Badge variant="outline">
                      {selectedImage.metadata.model}
                    </Badge>
                  </div>
                </>
              )}

              {/* Prompt Text */}
              {(selectedImage.metadata?.promptText || selectedImage.metadata?.customPrompt) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-body-primary">
                      {selectedImage.metadata?.promptText ? "Generation Prompt" : "Description"}
                    </span>
                    <div className="bg-brand-card border border-brand-line rounded-md p-3">
                      <p className="text-sm text-body-secondary leading-relaxed">
                        {selectedImage.metadata?.promptText || selectedImage.metadata?.customPrompt}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 border-brand-line text-body-secondary hover:text-body-primary"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        
        <Button
          onClick={onConfirm}
          disabled={!selectedImage || isProcessing}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              {context === "article" ? "Use This Image" : "Add to Gallery"}
            </>
          )}
        </Button>
      </div>

      {/* Context Info */}
      <div className="bg-brand-surface border border-brand-line rounded-lg p-3">
        <p className="text-xs text-body-tertiary">
          {context === "article" 
            ? "This image will be associated with the current article and can be used for publication."
            : "This image will be added to the gallery and can be reused across multiple articles."
          }
        </p>
      </div>
    </div>
  );
}