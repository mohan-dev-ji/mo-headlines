"use client";

import { AddImagePage } from "@/components/admin/shared/addimage/AddImagePage";
import { useSearchParams } from "next/navigation";

export default function AddImageGalleryPage() {
  const searchParams = useSearchParams();
  
  // Only use default returnUrl if not provided via URL params
  const hasReturnUrlParam = searchParams?.get("returnUrl");
  
  return (
    <AddImagePage
      // No articleId means this is gallery context (unless provided via URL)
      returnUrl={hasReturnUrlParam ? undefined : "/admin/images"}
    />
  );
}