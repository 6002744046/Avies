import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { ProgressMilestone } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const milestone = (formData.get("milestone") || "before") as ProgressMilestone;
    const notes = String(formData.get("notes") || "");
    const photo = formData.get("photo") as File | null;
    const supabase = createServerSupabaseClient();

    if (!supabase || !photo) {
      return NextResponse.json({
        message:
          "Demo upload captured. Add Supabase service role and Storage bucket to persist progress photos.",
        progress: {
          milestone,
          notes,
          image_url: "",
          density_score: 65,
          created_at: new Date().toISOString()
        }
      });
    }

    const extension = photo.name.split(".").pop() || "jpg";
    const path = `demo-user/${milestone}-${Date.now()}.${extension}`;
    const arrayBuffer = await photo.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(env.supabaseProgressBucket)
      .upload(path, arrayBuffer, {
        contentType: photo.type || "image/jpeg",
        upsert: false
      });

    if (uploadError) {
      console.error("Progress upload failed", uploadError);
      return NextResponse.json(
        { message: "Storage upload failed. Check bucket permissions." },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage
      .from(env.supabaseProgressBucket)
      .getPublicUrl(path);

    const densityScore = milestone === "before" ? 42 : milestone === "day_30" ? 52 : milestone === "day_60" ? 64 : 74;
    const { data, error } = await supabase
      .from("progress_photos")
      .insert({
        milestone,
        notes,
        image_url: publicData.publicUrl,
        density_score: densityScore
      })
      .select("*")
      .single();

    if (error) {
      console.error("Progress insert failed", error);
    }

    return NextResponse.json({
      message: "Progress photo uploaded.",
      progress: data
    });
  } catch (error) {
    console.error("Progress route failed", error);
    return NextResponse.json({ message: "Could not upload progress photo." }, { status: 500 });
  }
}
