"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Star,
  Calendar,
  User,
  Tag,
  Wand2,
  Link2,
  Save,
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
import { formatDistanceToNow } from "date-fns";

interface ImageDetailPageProps {
  imageId: Id<"images">;
}

export function ImageDetailPage({ imageId }: ImageDetailPageProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Form state
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "unused" | undefined>(undefined);

  // Fetch image data
  const image = useQuery(api.images.getImageById, { imageId });
  
  // Mutations
  const updateImageMetadata = useMutation(api.images.updateImageMetadata);
  const deleteImage = useMutation(api.images.deleteImage);

  // Initialize form state when image loads
  useEffect(() => {
    if (image && rating === undefined) {
      setRating(image.rating);
      setStatus(image.status as any);
    }
  }, [image, rating]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary" as const, label: "Pending", color: "bg-yellow-100 text-yellow-800" },
      approved: { variant: "default" as const, label: "Approved", color: "bg-green-100 text-green-800" },
      rejected: { variant: "destructive" as const, label: "Rejected", color: "bg-red-100 text-red-800" },
      unused: { variant: "outline" as const, label: "Unused", color: "bg-gray-100 text-gray-800" },
    };

    const config = variants[status as keyof typeof variants] || variants.unused;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getPromptSourceBadge = (source: string) => {
    const variants = {
      "ai-generated": { variant: "default" as const, label: "AI Generated", icon: <Wand2 className="h-3 w-3" /> },
      "custom": { variant: "secondary" as const, label: "Custom", icon: <User className="h-3 w-3" /> },
      "edited": { variant: "outline" as const, label: "Edited", icon: <Tag className="h-3 w-3" /> },
    };

    const config = variants[source as keyof typeof variants] || { variant: "secondary" as const, label: source, icon: null };
    
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const handleSave = async () => {
    if (!image) return;

    setIsSaving(true);
    
    try {
      await updateImageMetadata({
        imageId: image._id,
        rating: rating !== image.rating ? rating : undefined,
        status: status !== image.status ? status : undefined,
      });

      toast.success("Image updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!image) return;
    
    if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteImage({ imageId: image._id });
      toast.success("Image deleted successfully");
      router.push("/admin/images");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
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

  const handleCancel = () => {
    if (image) {
      setRating(image.rating);
      setStatus(image.status as any);
    }
    setIsEditing(false);
  };

  if (!image) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-body-secondary">Loading image details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-body-secondary hover:text-body-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-body-primary">
              Image Details
            </h1>
            <p className="text-body-secondary">
              {formatDistanceToNow(image._creationTime)} ago
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="border-brand-line"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="border-brand-line"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image Display */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card className="bg-brand-card border-brand-line">
            <CardContent className="p-0">
              <div className="aspect-video bg-brand-surface rounded-lg overflow-hidden">
                <img
                  src={image.cloudflareUrl}
                  alt={image.article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Actions */}
          <Card className="bg-brand-card border-brand-line">
            <CardHeader>
              <CardTitle className="text-lg">Image Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="border-brand-line"
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
                  className="border-brand-line"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full Size
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = image.cloudflareUrl;
                    link.download = `image-${image._id}.png`;
                    link.click();
                  }}
                  className="border-brand-line"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <Separator />
              
              <div className="text-xs text-body-tertiary">
                <strong>CDN URL:</strong> {image.cloudflareUrl}
              </div>
            </CardContent>
          </Card>

          {/* Prompt Information */}
          <Card className="bg-brand-card border-brand-line">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Generation Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Label className="text-body-primary">Source:</Label>
                {getPromptSourceBadge(image.prompt.source)}
              </div>
              
              <div>
                <Label className="text-body-primary">Prompt Text:</Label>
                <Textarea
                  value={image.prompt.text}
                  readOnly
                  className="mt-2 bg-brand-surface border-brand-line resize-none"
                  rows={4}
                />
              </div>
              
              {image.prompt.editedFrom && (
                <div className="text-xs text-body-tertiary">
                  This prompt was edited from an original prompt
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Status and Rating */}
          <Card className="bg-brand-card border-brand-line">
            <CardHeader>
              <CardTitle className="text-lg">Status & Quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-body-primary">Status</Label>
                {isEditing ? (
                  <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                    <SelectTrigger className="bg-brand-surface border-brand-line">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="unused">Unused</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div>
                    {getStatusBadge(image.status)}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label className="text-body-primary">Quality Rating (1-10)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={rating || ""}
                    onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-brand-surface border-brand-line"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    {image.rating ? (
                      <>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{image.rating}/10</span>
                      </>
                    ) : (
                      <span className="text-body-secondary">Not rated</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Article Association - Only show if image has a real article association */}
          {image.article.id && (
            <Card className="bg-brand-card border-brand-line">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Article Association
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-body-primary">Article Title</Label>
                  <div className="mt-1 p-3 bg-brand-surface border border-brand-line rounded-md">
                    <div className="font-medium text-body-primary">
                      {image.article.title}
                    </div>
                    <div className="text-sm text-body-secondary mt-1">
                      Status: {image.article.status}
                    </div>
                  </div>
                </div>

                {image.category && (
                  <div>
                    <Label className="text-body-primary">Category</Label>
                    <div className="mt-1">
                      <Badge variant="secondary">
                        {image.category.name}
                      </Badge>
                    </div>
                  </div>
                )}

                {image.article.slug && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/review/${image.article.id}`)}
                    className="border-brand-line"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Article
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card className="bg-brand-card border-brand-line">
            <CardHeader>
              <CardTitle className="text-lg">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-body-secondary">Model</Label>
                  <div className="font-medium text-body-primary">{image.model}</div>
                </div>
                
                <div>
                  <Label className="text-body-secondary">Created</Label>
                  <div className="font-medium text-body-primary">
                    {formatDistanceToNow(image._creationTime)} ago
                  </div>
                </div>

                {image.generationCost && (
                  <div>
                    <Label className="text-body-secondary">Cost</Label>
                    <div className="font-medium text-body-primary">
                      ${image.generationCost.toFixed(3)}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-body-secondary">Prompt Used</Label>
                  <div className="font-medium text-body-primary">
                    {image.prompt.isUsed ? "Yes" : "No"}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-body-secondary">Image ID</Label>
                <div className="text-xs text-body-tertiary font-mono">
                  {image._id}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}