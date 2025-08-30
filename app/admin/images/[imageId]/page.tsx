"use client";

import { use } from "react";
import { ImageDetailPage } from "@/components/admin/images/ImageDetailPage";
import { Id } from "@/convex/_generated/dataModel";

interface ImageDetailPageProps {
  params: Promise<{
    imageId: string;
  }>;
}

export default function ImageDetail({ params }: ImageDetailPageProps) {
  const resolvedParams = use(params);
  const imageId = resolvedParams.imageId as Id<"images">;

  return <ImageDetailPage imageId={imageId} />;
}