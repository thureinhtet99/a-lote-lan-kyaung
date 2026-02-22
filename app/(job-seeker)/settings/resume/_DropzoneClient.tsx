"use client";

import DropZone from "@/services/uploadthing/components/upload-thing";
import { useRouter } from "next/navigation";

export default function DropzoneClient() {
  const router = useRouter();

  return (
    <DropZone
      endpoint="resumeUploader"
      onClientUploadComplete={() => router.refresh()}
    />
  );
}
