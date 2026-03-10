"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Check, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/constants/app-config";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { activateOrganization } from "@/features/organizations/db/organization-db";

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

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {activeOrganization.logo ? (
                  <Image
                    src={activeOrganization.logo}
                    alt={activeOrganization.name}
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
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-xl">
                      {activeOrganization.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {activeOrganization.role === "org-admin"
                        ? "Admin"
                        : "Member"}
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      <Check className="size-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  {activeOrganization.slug && (
                    <CardDescription className="text-sm">
                      @{activeOrganization.slug}
                    </CardDescription>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Organization Name
                </p>
                <p className="text-sm">{activeOrganization.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Organization Slug
                </p>
                <p className="text-sm">{activeOrganization.slug || "---"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Created
                </p>
                <p className="text-sm">
                  {new Date(activeOrganization.createdAt).toLocaleString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    },
                  )}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button asChild variant="outline">
                <Link href={APP_ROUTES.EMPLOYER.SETTINGS.ORGANIZATION}>
                  Edit Organization Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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
            Claim the organization to continue
          </p>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center mb-6">
              <Building2 className="size-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Activate Your Organization
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                You have {availableOrganizations.length} organization
                {availableOrganizations.length > 1 ? "s" : ""} available. Select
                one to activate and start managing job listings.
              </p>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              {availableOrganizations.map((org) => (
                <Card key={org.id} className="hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
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
                          <CardTitle className="text-base">
                            {org.name}
                          </CardTitle>
                          {org.slug && (
                            <CardDescription className="text-xs">
                              @{org.slug}
                            </CardDescription>
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
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="size-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No organization yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            You haven't created an organization yet. Submit a request to create
            your organization and an admin will review and approve it.
          </p>
          <Button asChild>
            <Link href={APP_ROUTES.SETTINGS.ORG_REQUEST}>
              <Plus className="size-4 mr-1.5" />
              Request Organization
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
