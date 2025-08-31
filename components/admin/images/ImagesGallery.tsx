"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

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

interface ImagesGalleryProps {
  images: ImageData[];
  isLoading: boolean;
  onImageClick: (imageId: Id<"images">) => void;
}

export function ImagesGallery({ 
  images, 
  isLoading, 
  onImageClick 
}: ImagesGalleryProps) {
  const [selectedImages, setSelectedImages] = useState<Set<Id<"images">>>(new Set());

  const toggleImageSelection = (imageId: Id<"images">) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Create placeholder items if no images (matching Figma design exactly)
  const displayItems = images.length > 0 ? images : Array(16).fill(null);

  return (
    <div className="grid grid-cols-4 gap-6 p-1">
      {displayItems.map((image, index) => {
        const imageId = image?._id || `placeholder-${index}`;
        const isPlaceholder = !image;
        
        return (
          <div
            key={imageId}
            className={cn(
              "relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group",
              isPlaceholder 
                ? "bg-gray-300" 
                : "bg-gray-300 hover:ring-2 hover:ring-blue-400 transition-all duration-200",
              !isPlaceholder && selectedImages.has(image._id) && "ring-2 ring-blue-500"
            )}
            onClick={() => !isPlaceholder && onImageClick(image._id)}
          >
            {isPlaceholder ? (
              /* Placeholder matching Figma design exactly */
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">Image</span>
              </div>
            ) : (
              /* Actual image */
              <>
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
                    checked={selectedImages.has(image._id)}
                    onCheckedChange={() => toggleImageSelection(image._id)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/90 border-white/90 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                </div>

                {/* Image metadata overlay on hover */}
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
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}