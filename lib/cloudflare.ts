import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const CDN_BASE_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || `https://pub-8692bb544f234fd3a288bc9e584974e2.r2.dev`; // R2 public URL

export interface ImageUploadResult {
  cloudflareUrl: string;
  cloudflareKey: string;
}

/**
 * Upload image data to Cloudflare R2 bucket
 */
export async function uploadImageToR2(
  imageData: Buffer,
  fileName: string,
  contentType: string = "image/png"
): Promise<ImageUploadResult> {
  try {
    // Generate unique key with timestamp and original filename
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const cloudflareKey = `images/${timestamp}-${sanitizedFileName}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: cloudflareKey,
      Body: imageData,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000", // 1 year cache
      Metadata: {
        uploadedAt: new Date().toISOString(),
        source: "dalle-3"
      }
    });

    await s3Client.send(command);

    // Return CDN URL and key
    const cloudflareUrl = `${CDN_BASE_URL}/${cloudflareKey}`;

    console.log("Generated R2 URLs:", {
      CDN_BASE_URL,
      cloudflareKey,
      cloudflareUrl
    });

    return {
      cloudflareUrl,
      cloudflareKey,
    };
  } catch (error) {
    console.error("Error uploading to R2:", error);
    throw new Error(`Failed to upload image to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Download image from URL and upload to R2
 */
export async function downloadAndUploadToR2(
  imageUrl: string,
  originalFileName?: string
): Promise<ImageUploadResult> {
  try {
    // Download image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") || "image/png";
    
    // Generate filename if not provided
    const fileName = originalFileName || `generated-${Date.now()}.png`;

    // Upload to R2
    return await uploadImageToR2(imageBuffer, fileName, contentType);
  } catch (error) {
    console.error("Error downloading and uploading image:", error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload File object to R2 (for form uploads)
 */
export async function uploadFileToR2(
  file: File,
  fileName?: string
): Promise<ImageUploadResult> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use original filename or generate one
    const finalFileName = fileName || `uploaded-${Date.now()}.${file.name.split('.').pop()}`;
    
    // Upload to R2
    return await uploadImageToR2(buffer, finalFileName, file.type || "image/png");
  } catch (error) {
    console.error("Error uploading file to R2:", error);
    throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete image from R2 bucket
 */
export async function deleteImageFromR2(cloudflareKey: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: cloudflareKey,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from R2:", error);
    throw new Error(`Failed to delete image from R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate presigned URL for direct uploads (if needed)
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour
): Promise<{ uploadUrl: string; cloudflareKey: string }> {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const cloudflareKey = `images/${timestamp}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: cloudflareKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return {
      uploadUrl,
      cloudflareKey,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error(`Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}