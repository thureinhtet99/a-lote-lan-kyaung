"use client";

import { generateUploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "../core";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";
import { Json } from "@uploadthing/shared";

const UploadDropzoneComponent = generateUploadDropzone<OurFileRouter>();

export default function DropZone({
  className,
  onClientUploadComplete,
  onUploadError,
  ...props
}: ComponentProps<typeof UploadDropzoneComponent>) {
  return (
    <UploadDropzoneComponent
      className={cn(
        "border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 min-h-[200px] w-full hover:border-muted-foreground/50 transition-colors",
        className,
      )}
      onClientUploadComplete={(res) => {
        res.forEach((data) => toast.success(data.serverData.message));
        onClientUploadComplete?.(res);
      }}
      onUploadError={(error: UploadThingError<Json>) => {
        toast.error(error.message);
        onUploadError?.(error);
      }}
      {...props}
    />
  );
}
