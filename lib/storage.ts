import { randomUUID } from "crypto";
import { createFirebaseAdminBucket, createFirebaseAdminDb, FieldValue } from "@/lib/firebase-admin";
import type { ProgressMilestone } from "@/lib/types";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionFor(contentType: string) {
  if (contentType === "image/png") {
    return "png";
  }

  if (contentType === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export async function uploadUserImage({
  file,
  folder,
  userId
}: {
  file: File;
  folder: "analysis" | "progress";
  userId: string;
}) {
  const bucket = createFirebaseAdminBucket();
  if (!bucket) {
    throw new Error("Firebase Storage bucket is not configured.");
  }

  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are supported.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be smaller than 8 MB after compression.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `${folder}/${userId}/${Date.now()}-${randomUUID()}.${extensionFor(file.type)}`;
  const storageFile = bucket.file(storagePath);

  await storageFile.save(buffer, {
    contentType: file.type,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
      metadata: {
        userId
      }
    },
    resumable: false,
    validation: "md5"
  });

  const [imageUrl] = await storageFile.getSignedUrl({
    action: "read",
    expires: "01-01-2035"
  });

  return {
    contentType: file.type,
    imageUrl,
    size: file.size,
    storagePath
  };
}

export async function createProgressPhotoRecord({
  imageUrl,
  milestone,
  notes,
  storagePath,
  userId
}: {
  imageUrl: string;
  milestone: ProgressMilestone;
  notes?: string;
  storagePath: string;
  userId: string;
}) {
  const db = createFirebaseAdminDb();
  if (!db) {
    throw new Error("Firebase Admin database is not configured.");
  }

  const doc = await db.collection("progressPhotos").add({
    createdAt: FieldValue.serverTimestamp(),
    densityScore: null,
    imageUrl,
    milestone,
    notes: notes || "",
    storagePath,
    userId
  });

  return doc.id;
}
