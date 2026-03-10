"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Building2, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteOrg } from "@/features/organizations/db/organization-db";
import { APP_ROUTES } from "@/constants/app-config";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type OrganizationWithRole = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  metadata: string | null;
  role: string;
};

export default function OrganizationsClient({
  organization,
}: {
  organization: OrganizationWithRole | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!organization) return;

    startTransition(async () => {
      const result = await deleteOrg(organization.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  // No organization state
  if (!organization) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Organization</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your organization
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed">
          <Building2 className="size-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium">No organization yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            You haven&apos;t created an organization yet. Submit a request to
            create your organization.
          </p>
          <div className="mt-4">
            <Button asChild>
              <Link href={APP_ROUTES.SETTINGS.ORG_REQUEST}>
                <Plus className="size-4 mr-1.5" />
                Request Organization
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Has organization state
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Organization</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your organization
        </p>
      </div>

      {/* Organization Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-center gap-4 flex-1">
          {organization.logo ? (
            <Image
              src={organization.logo}
              alt={organization.name}
              width={64}
              height={64}
              className="size-16 rounded-lg object-cover border"
            />
          ) : (
            <div className="size-16 rounded-lg bg-primary/10 flex items-center justify-center border">
              <Building2 className="size-8 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">{organization.name}</h2>
              <Badge variant="outline" className="text-xs">
                {organization.role === "org-admin" ? "Admin" : "Member"}
              </Badge>
            </div>
            {organization.slug && (
              <p className="text-sm text-muted-foreground">
                @{organization.slug}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 self-start">
          <Button asChild variant="outline">
            <Link href={APP_ROUTES.EMPLOYER.SETTINGS.ORGANIZATION}>
              Edit Settings
            </Link>
          </Button>

          {organization.role === "org-admin" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this organization? This
                    action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isPending}
                  >
                    {isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Organization Details */}
      <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Organization Name
          </p>
          <p className="text-sm font-medium">{organization.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Slug
          </p>
          <p className="text-sm font-medium">{organization.slug || "---"}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Created
          </p>
          <p className="text-sm font-medium">
            {new Date(organization.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
