"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, CheckCircle2, FileImage, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/image-client";
import type { ProgressMilestone } from "@/lib/types";

const milestones: Array<{ value: ProgressMilestone; label: string }> = [
  { value: "before", label: "Before" },
  { value: "day_30", label: "Day 30" },
  { value: "day_60", label: "Day 60" },
  { value: "day_90", label: "Day 90" }
];

type UploadedPhoto = {
  id: string;
  imageUrl: string;
  milestone: ProgressMilestone;
};

export function PhotoUploader({
  onMessage,
  onUploaded
}: {
  onMessage?: (message: string) => void;
  onUploaded?: (photo: UploadedPhoto) => void;
}) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [milestone, setMilestone] = useState<ProgressMilestone>("day_90");
  const [notes, setNotes] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFile(nextFile?: File | null) {
    if (!nextFile) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setProgress(0);
    onMessage?.("");
  }

  async function uploadPhoto() {
    if (!file || uploading) {
      return;
    }

    setUploading(true);
    setProgress(4);

    try {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append("photo", compressed);
      formData.append("milestone", milestone);
      formData.append("notes", notes);

      const response = await new Promise<{ status: number; body: { message?: string; photo?: UploadedPhoto } }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/uploads");
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress(Math.max(6, Math.round((event.loaded / event.total) * 100)));
            }
          };
          xhr.onerror = () => reject(new Error("Upload failed."));
          xhr.onload = () => {
            try {
              resolve({
                body: JSON.parse(xhr.responseText || "{}"),
                status: xhr.status
              });
            } catch {
              reject(new Error("Upload failed."));
            }
          };
          xhr.send(formData);
        }
      );

      if (response.status === 401) {
        window.location.assign("/login?next=/dashboard");
        return;
      }

      if (response.status < 200 || response.status >= 300) {
        onMessage?.(response.body.message || "Upload failed.");
        return;
      }

      setProgress(100);
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setNotes("");
      onMessage?.(response.body.message || "Progress photo uploaded.");
      if (response.body.photo) {
        onUploaded?.(response.body.photo);
      }
    } catch (error) {
      onMessage?.(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="ghost" onClick={() => cameraInputRef.current?.click()}>
          <Camera className="size-4" /> Camera
        </Button>
        <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
          <FileImage className="size-4" /> File
        </Button>
      </div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {previewUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ink/10 bg-white">
          <Image src={previewUrl} alt="Selected progress photo" fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="grid aspect-[4/3] place-items-center rounded-2xl border border-dashed border-ink/20 bg-white text-center">
          <div>
            <Upload className="mx-auto size-7 text-aqua" />
            <p className="mt-3 text-sm font-bold text-ink">Progress photo</p>
          </div>
        </div>
      )}

      <label className="block">
        <span className="text-sm font-semibold text-ink/70">Milestone</span>
        <select
          value={milestone}
          onChange={(event) => setMilestone(event.target.value as ProgressMilestone)}
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-aqua"
        >
          {milestones.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-ink/70">Notes</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 outline-none focus:border-aqua"
          placeholder="Shedding, irritation, adherence, or visible changes"
        />
      </label>

      {uploading ? (
        <div className="h-2 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full bg-aqua transition-all" style={{ width: `${progress}%` }} />
        </div>
      ) : null}

      <Button type="button" disabled={!file || uploading} className="w-full" onClick={uploadPhoto}>
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
        Upload milestone
      </Button>
    </div>
  );
}
