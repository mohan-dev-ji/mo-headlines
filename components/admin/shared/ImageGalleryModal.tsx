"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected?: (imageData: {
    id: Id<"images">;
    url: string;
    rating?: number;
    model?: string;
    promptText?: string;
  }) => void;
}

interface ImageData {
  _id: Id<"images">;
  cloudflareUrl: string;
  status: "pending" | "approved" | "rejected" | "unused";
  rating?: number;
  model: string;
  prompt: string;
  promptSource: string;
  article: {
    title: string;
    slug: string;
  };
  category: {
    name: string;
    slug: string;
  } | null;
  _creationTime: number;
  articleTitle?: string;
}

export function ImageGalleryModal({
  isOpen,
  onClose,
  onImageSelected,
}: ImageGalleryModalProps) {
  const [selectedImageId, setSelectedImageId] = useState<Id<"images"> | null>(null);
  
  // Fetch all approved images
  const images = useQuery(api.images.listImages, {
    status: "approved",
    sortBy: "date",
    sortOrder: "desc",
  });

  const handleImageSelect = (imageId: Id<"images">) => {
    setSelectedImageId(selectedImageId === imageId ? null : imageId);
  };

  const handleConfirmSelection = () => {
    if (selectedImageId && images && onImageSelected) {
      const selectedImage = images.find(img => img._id === selectedImageId);
      if (selectedImage) {
        onImageSelected({
          id: selectedImage._id,
          url: selectedImage.cloudflareUrl,
          rating: selectedImage.rating,
          model: selectedImage.model,
          promptText: selectedImage.prompt,
        });
      }
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedImageId(null);
    onClose();
  };

  if (!images) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[800px] bg-brand-card border-brand-line max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-body-primary">Browse Image Gallery</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] bg-brand-card border-brand-line max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-body-primary">Browse Image Gallery</DialogTitle>
          <DialogDescription className="text-body-secondary">
            Select an image from your gallery to use in this article.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          {images.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-body-secondary">No images found in gallery</p>
                <p className="text-body-tertiary text-sm mt-2">Create some images first</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 p-1">
              {images.map((image) => (
                <div
                  key={image._id}
                  className={cn(
                    "relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group",
                    "bg-gray-300 hover:ring-2 hover:ring-blue-400 transition-all duration-200",
                    selectedImageId === image._id && "ring-2 ring-blue-500"
                  )}
                  onClick={() => handleImageSelect(image._id)}
                >
                  <img
                    src={image.cloudflareUrl}
                    alt={image.article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  
                  {/* Selection checkbox */}
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Checkbox
                      checked={selectedImageId === image._id}
                      onCheckedChange={() => handleImageSelect(image._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white/90 border-white/90 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                  </div>

                  {/* Image metadata overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="text-white text-xs truncate">
                      {image.article.title}
                    </div>
                    {image.rating && (
                      <div className="text-yellow-300 text-xs mt-1">
                        ★ {image.rating}/10
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-brand-line text-body-secondary hover:text-body-primary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedImageId}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Select Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}