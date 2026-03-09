"use client";

import LoadingSwap from "@/components/shared/loading-swap";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCurrentUserResume } from "@/features/applications/db/resume-db";
import {
  formatUploadedAt,
  getResumeFileName,
} from "@/features/applications/lib/utils";
import { cn } from "@/lib/utils";
import { FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export default function ResumeViewerClient({
  resumeFileUrl,
  resumeFileName,
  uploadedAt,
}: {
  resumeFileUrl: string;
  resumeFileName: string | null;
  uploadedAt: string | null;
}) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteCurrentUserResume();
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-3 transition-colors",
          "border-primary bg-primary/5",
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="size-5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {resumeFileName ?? getResumeFileName(resumeFileUrl)}
            </p>
            <p className="text-xs text-muted-foreground">
              Uploaded {formatUploadedAt(uploadedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center flex-shrink-0">
          <div className="size-4 rounded-full border-2 flex items-center justify-center transition-colors border-primary">
            <div className="size-2 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href={resumeFileUrl} target="_blank" rel="noopener noreferrer">
            View Resume
          </Link>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="size-4 mr-1.5" />
              Delete Resume
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Resume</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete your uploaded resume? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <LoadingSwap isLoading={isDeleting}>Delete</LoadingSwap>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
