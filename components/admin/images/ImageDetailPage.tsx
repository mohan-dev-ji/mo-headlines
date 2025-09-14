"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  X,
  Trash2,
  Download,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { format } from "date-fns";

interface ImageDetailPageProps {
  imageId: Id<"images">;
}

export function ImageDetailPage({ imageId }: ImageDetailPageProps) {
  const router = useRouter();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Editable form state
  const [model, setModel] = useState<string>("");
  const [rating, setRating] = useState<string>("");

  // Fetch image data
  const image = useQuery(api.images.getImageById, { imageId });
  const imageInUse = useQuery(api.images.checkImageInUse, { imageId });

  // Mutations
  const updateImageMetadata = useMutation(api.images.updateImageMetadata);
  const deleteImage = useMutation(api.images.deleteImage);

  // Initialize form state when image loads
  useEffect(() => {
    if (image && model === "") {
      setModel(image.model || "");
      setRating(image.rating ? image.rating.toString() : "");
    }
  }, [image, model]);

  const handleModelChange = async (newModel: string) => {
    if (!image || newModel === image.model) return;

    try {
      await updateImageMetadata({
        imageId: image._id,
        model: newModel,
      });
      toast.success("Model updated");
    } catch (error) {
      console.error("Error updating model:", error);
      toast.error("Failed to update model");
    }
  };

  const handleRatingChange = async (newRating: string) => {
    if (!image) return;

    const ratingNumber = newRating ? parseFloat(newRating) : undefined;
    const currentRating = image.rating;

    if (ratingNumber === currentRating) return;

    try {
      await updateImageMetadata({
        imageId: image._id,
        rating: ratingNumber,
      });
      toast.success("Rating updated");
    } catch (error) {
      console.error("Error updating rating:", error);
      toast.error("Failed to update rating");
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteImage = async () => {
    if (!image || !imageInUse) return;

    // Check if image is in use before attempting to delete
    if (imageInUse.isInUse) {
      toast.error(`Cannot delete image - it's currently being used by ${imageInUse.articlesCount} article(s)`);
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      await deleteImage({ imageId: image._id });
      toast.success("Image deleted successfully");
      router.push("/admin/images");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCopyUrl = async () => {
    if (image) {
      await navigator.clipboard.writeText(image.cloudflareUrl);
      setCopiedUrl(true);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleClose = () => {
    router.push("/admin/images");
  };

  if (!image) {
    return (
      <div className="container mx-auto min-h-screen">
        <div className="bg-brand-card-dark rounded-lg p-[var(--padding-md)] min-h-full flex justify-center items-center">
          <div className="text-body-secondary">Loading image details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen">
      {/* Page Background Container */}
      <div className="bg-brand-card-dark rounded-lg p-[var(--padding-md)] min-h-full flex justify-center">
        {/* Modal Container */}
        <div className="w-full max-w-2xl bg-brand-card rounded-lg border border-brand-line flex flex-col">
          {/* Modal Header */}
          <div className="shrink-0 flex items-center justify-between p-4 border-b border-brand-line">
            <h2 className="text-lg font-semibold text-headline-primary">Image Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-body-secondary hover:text-headline-primary hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Image Preview */}
            <div className="bg-brand-surface rounded-lg overflow-hidden">
              <img
                src={image.cloudflareUrl}
                alt={image.article?.title || "Image"}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <Button
                variant="outline"
                onClick={handleCopyUrl}
                className="border-brand-line text-button-black"
              >
                {copiedUrl ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copiedUrl ? "Copied!" : "Copy URL"}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.open(image.cloudflareUrl, "_blank")}
                className="border-brand-line text-button-black"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Size
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  // Create a proxy download via our API to handle CORS
                  const downloadUrl = `/api/images/download?url=${encodeURIComponent(image.cloudflareUrl)}&filename=image-${image._id}.png`;
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.download = `image-${image._id}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="border-brand-line text-button-black"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              <Button
                variant="outline"
                onClick={handleDeleteClick}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <div>
                <Label className="text-headline-primary text-sm mb-1">Created</Label>
                <div className="text-body-secondary">
                  {format(new Date(image._creationTime), "d MMMM yyyy, HH:mm")}
                </div>
              </div>

              <div>
                <Label className="text-headline-primary text-sm mb-1">CDN URL</Label>
                <div className="text-body-secondary text-xs break-all font-mono">
                  {image.cloudflareUrl}
                </div>
              </div>

              <div>
                <Label className="text-headline-primary text-sm mb-1">Image ID</Label>
                <div className="text-body-secondary text-xs font-mono">
                  {image._id}
                </div>
              </div>

              <div>
                <Label className="text-headline-primary text-sm mb-1">Prompt</Label>
                <div className="text-body-secondary text-xs font-mono">
                  value={image.prompt?.text || "No prompt available"}
                </div>
              </div>

              {/* Editable Model Field */}
              <div>
                <Label className="text-body-secondary text-sm mb-1">Model</Label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  onBlur={() => handleModelChange(model)}
                  className="bg-brand-background border-brand-line"
                  placeholder="Enter model name"
                />
              </div>

              {/* Editable Rating Field */}
              <div>
                <Label className="text-body-secondary text-sm mb-1">Rating</Label>
                <Input
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  onBlur={() => handleRatingChange(rating)}
                  className="bg-brand-background border-brand-line"
                  placeholder="Enter rating (e.g., 6/10)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-brand-card border-brand-line">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-headline-primary">
              Delete Image
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-primary">
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteImage}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete Image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}