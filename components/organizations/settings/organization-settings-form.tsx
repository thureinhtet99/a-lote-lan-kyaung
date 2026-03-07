"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { APP_ROUTES } from "@/constants/app-config";

const organizationSchema = z.object({
  name: z.string().min(3, "Organization name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export function OrganizationSettingsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isOwner] = useState(false);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  useEffect(() => {
    loadOrganization();
  }, []);

  async function loadOrganization() {
    setLoading(true);
    try {
      // This needs to be called from a server component or server action
      // For now, we'll use a placeholder
      // In a real implementation, you'd create a server action to fetch this
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load organization");
      setLoading(false);
    }
  }

  async function onSubmit(data: OrganizationFormData) {
    try {
      // Implementation for updating organization
      // You'll need to create a server action for this
      toast.success("Organization updated successfully");
    } catch (error) {
      toast.error("Failed to update organization");
    }
  }

  async function handleDeleteOrganization() {
    setDeleting(true);
    try {
      // Implementation for deleting organization
      // You'll need to create a server action for this
      toast.success("Organization deleted");
      router.push(APP_ROUTES.EMPLOYER.MY_ORG);
    } catch (error) {
      toast.error("Failed to delete organization");
    }
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="My Organization"
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  The name of your organization as it appears to members
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Slug</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="my-organization"
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  A unique identifier for your organization (lowercase, numbers,
                  and hyphens only)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-destructive">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Irreversible and destructive actions
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={!isOwner || deleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Organization
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Organization</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                organization, all job listings, applications, and remove all
                members.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteOrganization}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Delete Organization"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {!isOwner && (
          <p className="text-sm text-muted-foreground">
            Only organization admins can delete the organization
          </p>
        )}
      </div>
    </div>
  );
}
