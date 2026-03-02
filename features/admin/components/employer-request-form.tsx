"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { EmployerRequestFormType } from "@/types/index.type";
import { employerRequestSchema } from "@/features/admin/schema/admin-schema";
import { createEmployerRequest } from "@/features/users/db/user-db";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmployerRequestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // const [submitted, setSubmitted] = useState(false);

  const form = useForm<EmployerRequestFormType>({
    resolver: zodResolver(employerRequestSchema),
    defaultValues: {
      requestMessage: "",
    },
  });

  const onSubmit = (data: EmployerRequestFormType) => {
    startTransition(async () => {
      const result = await createEmployerRequest(data);
      if (result.success) {
        // setSubmitted(true);
        form.reset();
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  // if (submitted) {
  //   return (
  //     <Card>
  //       <CardHeader>
  //         <CardTitle>Request Submitted</CardTitle>
  //         <CardDescription>
  //           Your employer request has been submitted successfully
  //         </CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <p className="text-sm text-muted-foreground">
  //           Your request to become an employer has been submitted and is under
  //           admin review. You will be notified once your request has been
  //           reviewed.
  //         </p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Employer Access</CardTitle>
        <CardDescription>
          Submit a request to become an employer and gain access to post jobs
          and manage organizations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="requestMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to become an employer?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why you would like employer access..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a brief explanation (10-500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
