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
import { Input } from "@/components/ui/input";
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
import { OrgRequestFormType } from "@/types/index.type";
import { organizationRequestSchema } from "@/features/admin/schema/admin-form-schema";
import { createOrganizationRequest } from "@/features/organizations/db/organization-request-db";
import { Clock, Loader2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoadingSwap from "@/components/shared/loading-swap";

export function OrganizationRequestForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<OrgRequestFormType>({
    resolver: zodResolver(organizationRequestSchema),
    defaultValues: {
      orgName: "",
      orgSlug: "",
      requestMessage: "",
    },
  });

  // auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    form.setValue("orgSlug", slug);
  };

  const onSubmit = (data: OrgRequestFormType) => {
    startTransition(async () => {
      const result = await createOrganizationRequest(data);
      if (result.success) {
        toast.success(result.message);
        setSubmitted(true);
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  if (submitted) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertTitle>Pending Review</AlertTitle>
        <AlertDescription>
          Your request is currently being reviewed by our admin team. You will
          be notified once a decision has been made.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request to Create Organization</CardTitle>
        <CardDescription>
          Submit a request to create a new organization on the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="orgName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Corp"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orgSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="acme-corp" {...field} />
                  </FormControl>
                  <FormDescription>
                    Used in your organization URL. Only lowercase letters,
                    numbers, and hyphens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Why do you want to create this organization?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your organization and why you want to create it on this platform..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Min 10 characters, max 500 characters
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
