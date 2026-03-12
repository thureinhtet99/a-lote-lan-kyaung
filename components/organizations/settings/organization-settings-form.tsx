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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { APP_ROUTES } from "@/constants/app-config";
import {
  deleteOrg,
  getActiveOrganizationSettings,
  updateActiveOrganization,
} from "@/features/organizations/db/organization-db";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const organizationSchema = z.object({
  name: z.string().min(3, "Organization name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  metadata: z.string().max(5000, "Metadata must be 5000 characters or less"),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export function OrganizationSettingsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [activeOrganizationId, setActiveOrganizationId] = useState<
    string | null
  >(null);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      metadata: "",
    },
  });

  useEffect(() => {
    void loadOrganization();
  }, []);

  async function loadOrganization() {
    setLoading(true);
    try {
      const result = await getActiveOrganizationSettings();

      if (!result.success || !result.data) {
        toast.error(result.message || "Failed to load organization");
        return;
      }

      setActiveOrganizationId(result.data.id);
      setIsOwner(result.data.isOrgAdmin);

      form.reset({
        name: result.data.name,
        slug: result.data.slug,
        metadata: result.data.metadata ?? "",
      });
    } catch (error) {
      console.error("Failed to load organization settings:", error);
      toast.error("Failed to load organization");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: OrganizationFormData) {
    try {
      const result = await updateActiveOrganization(data);

      if (!result.success) {
        toast.error(result.message || "Failed to update organization");
        return;
      }

      toast.success(result.message);
      form.reset(data);
      router.refresh();
    } catch (error) {
      console.error("Failed to update organization settings:", error);
      toast.error("Failed to update organization");
    }
  }

  async function handleDeleteOrganization() {
    if (!activeOrganizationId) {
      toast.error("No active organization found");
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteOrg(activeOrganizationId);

      if (!result.success) {
        toast.error(result.message || "Failed to delete organization");
        return;
      }

      toast.success(result.message || "Organization deleted");
      router.push(APP_ROUTES.EMPLOYER.MY_ORG);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete organization:", error);
      toast.error("Failed to delete organization");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isFormDisabled = form.formState.isSubmitting || !isOwner;

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
                    disabled={isFormDisabled}
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
                    disabled={isFormDisabled}
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

          <FormField
            control={form.control}
            name="metadata"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={5}
                    placeholder="Add organization description"
                    disabled={isFormDisabled}
                  />
                </FormControl>
                <FormDescription>
                  This value is stored as organization metadata and can be used
                  as your organization description.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={isFormDisabled}>
              <LoadingSwap
                isLoading={form.formState.isSubmitting}
                children="Save"
              />
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-destructive">
            Danger Zone
          </h3>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={!isOwner || deleting || !activeOrganizationId}
            >
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
                <LoadingSwap
                  isLoading={deleting}
                  children="Delete organization"
                />
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
