"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DarkDropdown } from "@/components/ui/dark-dropdown";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ImagesGallery } from "@/components/admin/images/ImagesGallery";

type CategoryFilter = "all" | "technology" | "science" | "business";
type SortBy = "newest" | "oldest" | "rating" | "name";
export default function ImagesPage() {
  const router = useRouter();
  
  // Filter state matching Figma design
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  // Fetch images with filters
  const images = useQuery(api.images.listImages, {
    status: "approved", // For now, show approved images
    sortBy: sortBy === "newest" ? "date" : sortBy === "oldest" ? "date" : sortBy === "rating" ? "rating" : "date",
    sortOrder: sortBy === "oldest" ? "asc" : "desc",
  });

  // Get image counts for queue indicators
  const totalImages = images?.length || 0;
  const approvedCount = images?.filter(img => img.status === "approved").length || 0;

  const handleCreateImage = () => {
    router.push("/admin/images/add");
  };

  return (
    <div className="container mx-auto p-[var(--padding-md)]">
      {/* Filter Bar - Matching Create section styling */}
      <div className="flex items-center justify-between p-4 bg-brand-card rounded-lg">
        {/* Left side - Filter dropdowns matching Create section */}
        <div className="flex flex-col md:flex-row items-start sm:items-center gap-4">
          {/* Category Filter */}
          <DarkDropdown
            mode="select"
            trigger="Category"
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
            options={[
              { value: "all", label: "All Categories" },
              { value: "technology", label: "Technology" },
              { value: "science", label: "Science" },
              { value: "business", label: "Business" }
            ]}
            width="w-full md:w-[140px]"
            align="left"
          />

          {/* Sort By Filter */}
          <DarkDropdown
            mode="select"
            trigger="Sort by"
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortBy)}
            options={[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
              { value: "rating", label: "Highest Rated" },
              { value: "name", label: "Name A-Z" }
            ]}
            width="w-full md:w-[140px]"
            align="left"
          />

          {/* Bulk Actions */}
          <DarkDropdown
            mode="action"
            trigger="Bulk Actions"
            items={[
              {
                label: "Approve Selected",
                onClick: () => console.log("approve"),
                disabled: true
              },
              {
                label: "Reject Selected", 
                onClick: () => console.log("reject"),
                disabled: true
              },
              {
                label: "Rate Selected",
                onClick: () => console.log("rate"),
                disabled: true
              },
              {
                label: "Delete Selected",
                onClick: () => console.log("delete"),
                disabled: true,
                variant: "destructive" as const
              }
            ]}
            width="w-full md:w-[140px]"
            align="left"
          />
          
          {/* Queue Count Display */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0 text-blue-600">
              {totalImages} images
            </Badge>
            <Badge variant="secondary" className="shrink-0 bg-green-600/20 text-green-400 border-green-600/30">
              {approvedCount} approved
            </Badge>
          </div>
        </div>

      </div>

      {/* Image Gallery Container with padding and background */}
      <div className="mt-[var(--padding-md)] bg-brand-card rounded-lg p-[var(--padding-md)]">
        {/* Add Image Button - Centered at top */}
        <div className="flex justify-center mb-[var(--padding-md)]">
          <Button 
            onClick={handleCreateImage}
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </div>
        
        {/* Image Gallery Grid */}
        <div className="h-[calc(100vh-220px)] overflow-y-auto">
          <ImagesGallery
            images={images || []}
            isLoading={!images}
            onImageClick={(imageId) => router.push(`/admin/images/${imageId}`)}
          />
        </div>
      </div>
    </div>
  );
}