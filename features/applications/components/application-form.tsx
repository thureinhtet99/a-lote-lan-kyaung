"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSwap from "@/components/shared/loading-swap";
import z from "zod";
import { applicationFormSchema } from "../schema/application-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createApplication } from "../db/application-db";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import DropZone from "@/services/uploadthing/components/upload-thing";
import { CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteUploadThingFile } from "@/services/uploadthing/delete-file";
import { formatUploadedAt, getResumeFileName } from "../lib/utils";

export function ApplicationForm({
  jobListingId,
  existingResumeUrl,
  existingResumeKey,
  existingResumeFileName,
  existingResumeUploadedAt,
}: {
  jobListingId: string;
  existingResumeUrl: string | null;
  existingResumeKey: string | null;
  existingResumeFileName: string | null;
  existingResumeUploadedAt: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const skipNextCloseGuardRef = useRef(false);
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileAt, setUploadedFileAt] = useState<string | null>(null);
  const [showDropzone, setShowDropzone] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<
    (() => void) | null
  >(null);
  const [isDiscarding, startDiscardTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      resumeFileUrl: existingResumeUrl ?? "",
      resumeFileKey: "",
      resumeFileName: existingResumeFileName ?? "",
      saveToProfile: false,
      coverLetter: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof applicationFormSchema>) => {
    const result = await createApplication(jobListingId, data);
    if (result.success) {
      setHasUnsavedChanges(false); // Clear flag before closing
      const dialogContent = formRef.current?.closest(
        "[data-slot='dialog-content']",
      );
      const closeButton = dialogContent?.querySelector<HTMLButtonElement>(
        "[data-slot='dialog-close']",
      );
      closeButton?.click();
      form.reset({
        resumeFileUrl: existingResumeUrl ?? "",
        resumeFileKey: "",
        resumeFileName: existingResumeFileName ?? "",
        saveToProfile: false,
        coverLetter: "",
      });
      setUploadedFileKey(null);
      setUploadedFileUrl(null);
      setUploadedFileName(null);
      setUploadedFileAt(null);
      setShowDropzone(true);
      toast.success(result.message);
      router.refresh();
    } else toast.error(result.message);
  };

  // Add effect to handle dialog close confirmation
  // Prevents dialog from closing (via close button, overlay click, or Escape key)
  // when there are unsaved changes (resume uploaded or cover letter written)
  useEffect(() => {
    const handleBeforeClose = (e: MouseEvent) => {
      if (skipNextCloseGuardRef.current) {
        skipNextCloseGuardRef.current = false;
        return;
      }

      if (hasUnsavedChanges && !form.formState.isSubmitting) {
        e.stopPropagation();
        e.preventDefault();

        // Store the close action to execute after user confirms
        setPendingCloseAction(() => () => {
          const dialogContent = formRef.current?.closest(
            "[data-slot='dialog-content']",
          );
          const closeButton = dialogContent?.querySelector<HTMLButtonElement>(
            "[data-slot='dialog-close']",
          );
          closeButton?.click();
        });

        setShowCloseConfirmDialog(true);
        return false;
      }
    };

    // Prevent escape key from closing dialog when there are unsaved changes
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (skipNextCloseGuardRef.current) {
        skipNextCloseGuardRef.current = false;
        return;
      }

      if (
        e.key === "Escape" &&
        hasUnsavedChanges &&
        !form.formState.isSubmitting
      ) {
        e.stopPropagation();
        e.preventDefault();

        setPendingCloseAction(() => () => {
          const dialogContent = formRef.current?.closest(
            "[data-slot='dialog-content']",
          );
          const closeButton = dialogContent?.querySelector<HTMLButtonElement>(
            "[data-slot='dialog-close']",
          );
          closeButton?.click();
        });

        setShowCloseConfirmDialog(true);
      }
    };

    const dialogContent = formRef.current?.closest(
      "[data-slot='dialog-content']",
    );
    const closeButton = dialogContent?.querySelector<HTMLButtonElement>(
      "[data-slot='dialog-close']",
    );
    const overlay = document.querySelector("[data-slot='dialog-overlay']");

    // Attach event listeners with capture phase to intercept early
    if (closeButton) {
      closeButton.addEventListener(
        "click",
        handleBeforeClose as EventListener,
        true,
      );
    }
    if (overlay) {
      // Listen to both click and pointerdown (Radix UI uses pointerdown for outside click detection)
      overlay.addEventListener(
        "click",
        handleBeforeClose as EventListener,
        true,
      );
      overlay.addEventListener(
        "pointerdown",
        handleBeforeClose as EventListener,
        true,
      );
    }

    // Add keyboard event listener
    document.addEventListener(
      "keydown",
      handleEscapeKey as EventListener,
      true,
    );

    return () => {
      if (closeButton) {
        closeButton.removeEventListener(
          "click",
          handleBeforeClose as EventListener,
          true,
        );
      }
      if (overlay) {
        overlay.removeEventListener(
          "click",
          handleBeforeClose as EventListener,
          true,
        );
        overlay.removeEventListener(
          "pointerdown",
          handleBeforeClose as EventListener,
          true,
        );
      }
      document.removeEventListener(
        "keydown",
        handleEscapeKey as EventListener,
        true,
      );
    };
  }, [hasUnsavedChanges, form.formState.isSubmitting]);

  const handleDiscardChanges = () => {
    startDiscardTransition(async () => {
      // Delete uploaded resume file from UploadThing if it's not the saved resume
      // and only close after deletion is completed successfully.
      if (uploadedFileKey && uploadedFileKey !== existingResumeKey) {
        const result = await deleteUploadThingFile(uploadedFileKey);
        if (!result.success) {
          toast.error(result.message ?? "Failed to delete uploaded resume");
          return;
        }

        toast.success(result.message ?? "Uploaded resume deleted");
      }

      form.setValue("resumeFileUrl", existingResumeUrl ?? "");
      form.setValue("resumeFileKey", "");
      form.setValue("resumeFileName", existingResumeFileName ?? "");
      setUploadedFileKey(null);
      setUploadedFileUrl(null);
      setUploadedFileName(null);
      setUploadedFileAt(null);
      setShowDropzone(true);

      setHasUnsavedChanges(false);
      setShowCloseConfirmDialog(false);

      // Execute the pending close action after deletion completes
      if (pendingCloseAction) {
        skipNextCloseGuardRef.current = true;
        pendingCloseAction();
        setPendingCloseAction(null);
      }
    });
  };

  const handleCancelClose = () => {
    if (isDiscarding) return;
    setShowCloseConfirmDialog(false);
    setPendingCloseAction(null);
  };

  return (
    <>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 p-1 pb-4"
        >
          <FormField
            control={form.control}
            name="resumeFileUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Resume<span className="text-destructive">*</span>
                </FormLabel>

                {/* Show description when both options are available */}
                {existingResumeUrl && uploadedFileUrl && (
                  <p className="text-sm text-muted-foreground">
                    Choose which resume to use for this application:
                  </p>
                )}

                {/* Show saved resume with radio selection */}
                {existingResumeUrl && (
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer",
                      field.value === existingResumeUrl
                        ? "border-primary bg-primary/5"
                        : "border-muted bg-muted/30 hover:border-muted-foreground/50",
                    )}
                    onClick={() => {
                      field.onChange(existingResumeUrl);
                      form.setValue("resumeFileKey", "");
                      form.setValue(
                        "resumeFileName",
                        existingResumeFileName ??
                          getResumeFileName(existingResumeUrl),
                      );
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileText className="size-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {existingResumeFileName ??
                            getResumeFileName(existingResumeUrl)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {formatUploadedAt(existingResumeUploadedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center flex-shrink-0">
                      <div
                        className={cn(
                          "size-4 rounded-full border-2 flex items-center justify-center transition-colors",
                          field.value === existingResumeUrl
                            ? "border-primary"
                            : "border-muted-foreground",
                        )}
                      >
                        {field.value === existingResumeUrl && (
                          <div className="size-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Show newly uploaded resume with radio selection */}
                {uploadedFileUrl && uploadedFileUrl !== existingResumeUrl && (
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer",
                        field.value === uploadedFileUrl
                          ? "border-primary bg-primary/5"
                          : "border-muted bg-muted/30 hover:border-muted-foreground/50",
                      )}
                      onClick={() => {
                        field.onChange(uploadedFileUrl);
                        if (uploadedFileKey) {
                          form.setValue("resumeFileKey", uploadedFileKey);
                        }
                        form.setValue(
                          "resumeFileName",
                          uploadedFileName ??
                            getResumeFileName(uploadedFileUrl),
                        );
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileText className="size-5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {uploadedFileName ??
                              getResumeFileName(uploadedFileUrl)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {formatUploadedAt(uploadedFileAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center flex-shrink-0">
                        <div
                          className={cn(
                            "size-4 rounded-full border-2 flex items-center justify-center transition-colors",
                            field.value === uploadedFileUrl
                              ? "border-primary"
                              : "border-muted-foreground",
                          )}
                        >
                          {field.value === uploadedFileUrl && (
                            <div className="size-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Show "Save to Profile" checkbox only for first-time users */}
                    {!existingResumeUrl && uploadedFileKey && (
                      <FormField
                        control={form.control}
                        name="saveToProfile"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-y-0 rounded-md bg-muted/30 mb-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium cursor-pointer">
                                Save this resume to my profile
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Use this resume for future job applications
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}

                {/* Show dropzone for users with existing resume, or first-time users who haven't uploaded yet */}
                {(existingResumeUrl || showDropzone) && (
                  <FormControl>
                    <DropZone
                      endpoint="applicationResumeUploader"
                      onClientUploadComplete={(res) => {
                        const serverData = res[0]?.serverData;
                        const fileUrl =
                          serverData &&
                          "fileUrl" in serverData &&
                          typeof serverData.fileUrl === "string"
                            ? serverData.fileUrl
                            : undefined;

                        const fileKey =
                          serverData &&
                          "fileKey" in serverData &&
                          typeof serverData.fileKey === "string"
                            ? serverData.fileKey
                            : undefined;

                        const fileName =
                          serverData &&
                          "fileName" in serverData &&
                          typeof serverData.fileName === "string"
                            ? serverData.fileName
                            : undefined;

                        const uploadedAt =
                          serverData &&
                          "uploadedAt" in serverData &&
                          typeof serverData.uploadedAt === "string"
                            ? serverData.uploadedAt
                            : null;

                        if (!fileUrl || !fileKey) return;

                        // Immediately apply the upload
                        field.onChange(fileUrl);
                        form.setValue("resumeFileKey", fileKey);
                        form.setValue(
                          "resumeFileName",
                          fileName ?? getResumeFileName(fileUrl),
                        );
                        setUploadedFileKey(fileKey);
                        setUploadedFileUrl(fileUrl);
                        setUploadedFileName(
                          fileName ?? getResumeFileName(fileUrl),
                        );
                        setUploadedFileAt(uploadedAt);
                        setHasUnsavedChanges(true);

                        // Hide dropzone for first-time users after upload
                        if (!existingResumeUrl) {
                          setShowDropzone(false);
                        }
                      }}
                      appearance={{
                        container: "min-h-[140px]",
                        label: "text-sm",
                        uploadIcon: "size-8",
                      }}
                    />
                  </FormControl>
                )}

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Cover Letter
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <MarkdownEditor
                    {...field}
                    markdown={field.value ?? ""}
                    onChange={(value) => {
                      field.onChange(value);
                      if (value && value.trim() !== "") {
                        setHasUnsavedChanges(true);
                      }
                    }}
                    className="[&_.mdxeditor-root-contenteditable]:min-h-[220px] [&_.mdxeditor-root-contenteditable]:max-h-[260px] [&_.mdxeditor-root-contenteditable]:overflow-y-auto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="sticky bottom-0 z-10 -mx-1 border-t">
            <Button
              disabled={form.formState.isSubmitting}
              type="submit"
              className="w-full"
            >
              <LoadingSwap isLoading={form.formState.isSubmitting}>
                Apply
              </LoadingSwap>
            </Button>
          </div>
        </form>
      </Form>

      {/* Close Confirmation Dialog */}
      <AlertDialog
        open={showCloseConfirmDialog}
        onOpenChange={(open) => {
          if (!open && !isDiscarding) handleCancelClose();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You have unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to submit your application or discard your changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              disabled={isDiscarding}
              onClick={handleCancelClose}
            >
              Continue editing
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={handleDiscardChanges}
              disabled={isDiscarding}
              className="text-destructive hover:text-destructive cursor-pointer"
            >
              <LoadingSwap isLoading={isDiscarding}>Discard</LoadingSwap>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
