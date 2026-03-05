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
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSwap from "@/components/shared/loading-swap";
import z from "zod";
import { newJobListingApplicationSchema } from "../schema/new-application-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createApplication } from "../db/application-db";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import DropZone from "@/services/uploadthing/components/upload-thing";
import { CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function ApplicationForm({
  jobListingId,
  existingResumeUrl,
}: {
  jobListingId: string;
  existingResumeUrl: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);
  const [showDropzone, setShowDropzone] = useState(true);

  const form = useForm({
    resolver: zodResolver(newJobListingApplicationSchema),
    defaultValues: {
      resumeFileUrl: existingResumeUrl ?? "",
      resumeFileKey: "",
      saveToProfile: false,
      coverLetter: "",
    },
  });

  const resumeFileUrl = form.watch("resumeFileUrl");
  const saveToProfile = form.watch("saveToProfile");

  const getFileName = (url: string) =>
    decodeURIComponent(url.split("/").pop() ?? "resume.pdf");

  const onSubmit = async (
    data: z.infer<typeof newJobListingApplicationSchema>,
  ) => {
    const result = await createApplication(jobListingId, data);
    if (result.success) {
      const dialogContent = formRef.current?.closest(
        "[data-slot='dialog-content']",
      );
      const closeButton = dialogContent?.querySelector<HTMLButtonElement>(
        "[data-slot='dialog-close']",
      );
      closeButton?.click();
      toast.success(result.message);
      form.reset({
        resumeFileUrl: existingResumeUrl ?? "",
        resumeFileKey: "",
        saveToProfile: false,
        coverLetter: "",
      });
      setUploadedFileKey(null);
      setShowDropzone(true);
      router.refresh();
    } else toast.error(result.message);
  };

  return (
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

              {existingResumeUrl && (
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors",
                    field.value === existingResumeUrl
                      ? "border-primary bg-primary/5"
                      : "border-muted bg-muted/30",
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="size-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Saved resume</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getFileName(existingResumeUrl)}
                      </p>
                    </div>
                  </div>

                  {field.value === existingResumeUrl ? (
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium flex-shrink-0">
                      <CheckCircle2 className="size-4" />
                      Selected
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 flex-shrink-0"
                      onClick={() => {
                        field.onChange(existingResumeUrl);
                        form.setValue("resumeFileKey", "");
                      }}
                    >
                      Use this
                    </Button>
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

                      if (!fileUrl || !fileKey) return;

                      field.onChange(fileUrl);
                      form.setValue("resumeFileKey", fileKey);
                      setUploadedFileKey(fileKey);

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

              {/* Show uploaded resume card */}
              {resumeFileUrl && resumeFileUrl !== existingResumeUrl && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-primary bg-primary/5 p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          {getFileName(resumeFileUrl)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium flex-shrink-0">
                      <CheckCircle2 className="size-4" />
                      Selected
                    </div>
                  </div>

                  <FormDescription className="text-xs">
                    {existingResumeUrl
                      ? "You can upload a different resume for this application only."
                      : "Upload your resume. You can save it to your profile for future applications."}
                  </FormDescription>

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

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter</FormLabel>
              <FormControl>
                <MarkdownEditor
                  {...field}
                  markdown={field.value ?? ""}
                  className="[&_.mdxeditor-root-contenteditable]:min-h-[220px] [&_.mdxeditor-root-contenteditable]:max-h-[260px] [&_.mdxeditor-root-contenteditable]:overflow-y-auto"
                />
              </FormControl>
              <FormDescription className="text-xs">Optional</FormDescription>
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
  );
}
