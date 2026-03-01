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
import LoadingSwap from "@/components/shared/loading-swap";
import z from "zod";
import { newJobListingApplicationSchema } from "../application-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createApplication } from "../db/application-db";

export function NewJobListingApplicationForm({
  jobListingId,
}: {
  jobListingId: string;
}) {
  const form = useForm({
    resolver: zodResolver(newJobListingApplicationSchema),
    defaultValues: { coverLetter: "" },
  });

  const onSubmit = async (
    data: z.infer<typeof newJobListingApplicationSchema>,
  ) => {
    const result = await createApplication(jobListingId, data);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter</FormLabel>
              <FormControl>
                <MarkdownEditor {...field} markdown={field.value ?? ""} />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Apply
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
