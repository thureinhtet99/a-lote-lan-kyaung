"use client";

import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/app-config";
import { activateOrganization } from "@/features/organizations/db/organization-db";
import { Building2, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

type OrganizationWithRole = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: Date;
  metadata: string | null;
  role: string;
};

export default function MyOrganizationClient({
  activeOrganization,
  availableOrganizations,
}: {
  activeOrganization: OrganizationWithRole | null;
  availableOrganizations: OrganizationWithRole[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleActivateOrganization = (orgId: string) => {
    startTransition(async () => {
      try {
        const result = await activateOrganization(orgId);

        if (result.success) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to activate organization");
      }
    });
  };

  // If user has an active organization, show it
  if (activeOrganization) {
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
            {activeOrganization.logo ? (
              <Image
                src={activeOrganization.logo}
                alt={activeOrganization.name}
                width={64}
                height={64}
                className="size-20 rounded-lg object-cover border"
              />
            ) : (
              <div className="size-20 rounded-lg bg-primary/10 flex items-center justify-center border">
                <Building2 className="size-8 text-primary" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">
                  {activeOrganization.name}
                </h2>
              </div>
              {activeOrganization.slug && (
                <p className="text-sm text-muted-foreground">
                  @{activeOrganization.slug}
                </p>
              )}
            </div>
          </div>
          <Button asChild variant="outline" className="self-start">
            <Link href={APP_ROUTES.EMPLOYER.SETTINGS.ORGANIZATION}>
              Edit Settings
            </Link>
          </Button>
        </div>

        {/* Organization Details */}
        <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Organization Name
            </p>
            <p className="text-sm font-medium">{activeOrganization.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Slug
            </p>
            <p className="text-sm font-medium">
              {activeOrganization.slug || "---"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Created
            </p>
            <p className="text-sm font-medium">
              {new Date(activeOrganization.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Description
          </p>
          <p className="text-sm font-medium">
            {activeOrganization.metadata || "No description provided"}
          </p>
        </div>
      </div>
    );
  }

  // If user has organizations available to claim
  if (availableOrganizations.length > 0) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Organization</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Activate an organization to continue
          </p>
        </div>

        <div className="text-center py-6">
          <Building2 className="size-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Activate Your Organization
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You have {availableOrganizations.length} organization
            {availableOrganizations.length > 1 ? "s" : ""} available. Select one
            to activate and start managing job listings.
          </p>
        </div>

        <div className="space-y-3 max-w-2xl mx-auto">
          {availableOrganizations.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {org.logo ? (
                  <Image
                    src={org.logo}
                    alt={org.name}
                    width={48}
                    height={48}
                    className="size-12 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center border">
                    <Building2 className="size-6 text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{org.name}</p>
                  {org.slug && (
                    <p className="text-xs text-muted-foreground">@{org.slug}</p>
                  )}
                </div>
              </div>
              <Button
                onClick={() => handleActivateOrganization(org.id)}
                disabled={isPending}
                size="sm"
              >
                {isPending ? "Activating..." : "Activate"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No organizations at all - prompt to request
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
