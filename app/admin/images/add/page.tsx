"use client";

import { AddImagePage } from "@/components/admin/shared/addimage/AddImagePage";

export default function AddImageGalleryPage() {
  return (
    <AddImagePage
      // No articleId means this is gallery context
      returnUrl="/admin/images"
    />
  );
}