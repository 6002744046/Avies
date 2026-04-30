import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { createProgressPhotoRecord, uploadUserImage } from "@/lib/storage";
import type { ProgressMilestone } from "@/lib/types";

export const runtime = "nodejs";

const milestones = new Set(["before", "day_30", "day_60", "day_90"]);

export async function POST(request: NextRequest) {
  const session = await getCurrentUserFromRequest(request);

  if (!session) {
    return NextResponse.json({ message: "Login is required before uploading photos." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const photo = formData.get("photo");
    const milestone = String(formData.get("milestone") || "");
    const notes = String(formData.get("notes") || "");

    if (!(photo instanceof File) || !photo.size) {
      return NextResponse.json({ message: "Photo is required." }, { status: 400 });
    }

    if (!milestones.has(milestone)) {
      return NextResponse.json({ message: "Invalid milestone." }, { status: 400 });
    }

    const image = await uploadUserImage({
      file: photo,
      folder: "progress",
      userId: session.user.uid
    });
    const id = await createProgressPhotoRecord({
      imageUrl: image.imageUrl,
      milestone: milestone as ProgressMilestone,
      notes,
      storagePath: image.storagePath,
      userId: session.user.uid
    });

    return NextResponse.json({
      message: "Progress photo uploaded.",
      photo: {
        createdAt: new Date().toISOString(),
        id,
        imageUrl: image.imageUrl,
        milestone,
        notes,
        storagePath: image.storagePath,
        userId: session.user.uid
      }
    });
  } catch (error) {
    console.error("Upload route failed", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not upload photo." },
      { status: 500 }
    );
  }
}
