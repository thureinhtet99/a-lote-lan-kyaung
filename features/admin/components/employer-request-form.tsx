"use client";

import LoadingSwap from "@/components/shared/loading-swap";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { employerRequestSchema } from "@/features/admin/schema/admin-form-schema";
import { createEmployerRequest } from "@/features/users/db/user-db";
import { EmployerRequestFormType } from "@/types/index.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function EmployerRequestForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
        form.reset();
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

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
              <LoadingSwap isLoading={isPending} children="Submit request" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
