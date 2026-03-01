"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Building2, Plus, Settings, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { OrganizationType } from "@/types/index.type";
import {
  deleteOrg,
  switchOrganization,
} from "@/features/organizations/db/organization-db";
import { APP_ROUTES } from "@/constants/app-config";
import Link from "next/link";

export default function OrganizationsClient({
  organizations,
  activeOrganizationId,
}: {
  organizations: OrganizationType[];
  activeOrganizationId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const handleDelete = (orgId: string) => {
    setDeletingId(orgId);
    startTransition(async () => {
      const result = await deleteOrg(orgId);
      if (result.success) {
        setShowDeleteDialog(null);
        setDeletingId(null);
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
        setDeletingId(null);
      }
    });
  };

  const handleSwitchOrganization = (orgId: string) => {
    setSwitchingId(orgId);
    startTransition(async () => {
      const result = await switchOrganization(orgId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setSwitchingId(null);
      } else {
        toast.error(result.message);
        setSwitchingId(null);
      }
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Organizations</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your organizations and switch between them
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={APP_ROUTES.SETTINGS.ORG_REQUEST}>
            <Plus className="size-4 mr-1.5" />
            Request New
          </Link>
        </Button>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <Building2 className="size-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No organizations yet</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Submit a request to create your first organization. An admin will
              review and approve it.
            </p>
            <Button asChild>
              <Link href={APP_ROUTES.SETTINGS.ORG_REQUEST}>
                <Plus className="size-4 mr-1.5" />
                Request Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {org.logo ? (
                      <Image
                        src={org.logo}
                        alt={org.name}
                        width={40}
                        height={40}
                        className="size-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="size-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">{org.name}</CardTitle>
                      {org.slug && (
                        <CardDescription className="text-xs">
                          /{org.slug}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  {org.role === "admin" && (
                    <DropdownMenu
                      open={showDeleteDialog === org.id}
                      onOpenChange={(open) =>
                        setShowDeleteDialog(open ? org.id : null)
                      }
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled={deletingId !== null}
                        >
                          <Settings className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDelete(org.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4 mr-2" />
                          {deletingId === org.id
                            ? "Deleting…"
                            : "Delete Organization"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {org.id === activeOrganizationId ? (
                  <Button className="w-full" variant="secondary" disabled>
                    Active
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSwitchOrganization(org.id)}
                    className="w-full"
                    variant="outline"
                    disabled={switchingId !== null}
                  >
                    {switchingId === org.id ? "Switching…" : "Switch to this"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
