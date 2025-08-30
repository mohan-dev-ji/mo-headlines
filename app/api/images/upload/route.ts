import { NextRequest, NextResponse } from "next/server";
import { downloadAndUploadToR2, uploadFileToR2 } from "@/lib/cloudflare";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const metadataStr = formData.get("metadata") as string;
      
      if (!file) {
        return NextResponse.json(
          { error: "File is required" },
          { status: 400 }
        );
      }

      const fileName = `uploaded-${Date.now()}.${file.name.split('.').pop()}`;

      // Upload file directly to R2
      const result = await uploadFileToR2(file, fileName);

      return NextResponse.json({
        success: true,
        cloudflareUrl: result.cloudflareUrl,
        cloudflareKey: result.cloudflareKey,
      });
    } else {
      // Handle URL download (existing logic)
      const { imageUrl, fileName } = await request.json();

      if (!imageUrl) {
        return NextResponse.json(
          { error: "Image URL is required" },
          { status: 400 }
        );
      }

      // Download from DALL-E URL and upload to R2
      const result = await downloadAndUploadToR2(
        imageUrl,
        fileName || `generated-${Date.now()}.png`
      );

      return NextResponse.json({
        success: true,
        cloudflareUrl: result.cloudflareUrl,
        cloudflareKey: result.cloudflareKey,
      });
    }
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}