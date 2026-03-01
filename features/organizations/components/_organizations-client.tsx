"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Plus, Settings, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { OrganizationType } from "@/types/index.type";
import {
  createOrg,
  deleteOrg,
  switchOrganization,
} from "@/features/organizations/db/organization-db";
import { APP_ROUTES } from "@/constants/app-config";

export default function OrganizationsClient({
  organizations,
  activeOrganizationId,
}: {
  organizations: OrganizationType[];
  activeOrganizationId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [newOrgName, setNewOrgName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createOrg(
        newOrgName,
        newOrgName.toLowerCase().replace(/\s+/g, "-"),
      );

      if (result.success) {
        toast.success(result.message);
        setShowCreateDialog(false);
        setNewOrgName("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

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

  const handleSwitchOrganization = async (orgId: string) => {
    setSwitchingId(orgId);
    startTransition(async () => {
      const result = await switchOrganization(orgId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setSwitchingId(null);
        if (result.redirectTo && pathname !== APP_ROUTES.EMPLOYER.ORG)
          router.push(result.redirectTo);
      } else {
        toast.error(result.message);
        setSwitchingId(null);
      }
    });
  };

  return (
    <div className="@container flex-1 px-10 py-8 max-w-7xl xl:p-4 border">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground mt-2">
              Manage your organizations and switch between them
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Create Organization</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
                <DialogDescription>
                  Create a new organization to manage job listings and team
                  members
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    placeholder="Acme Inc."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleCreate}
                  className="w-full"
                  disabled={isPending || !newOrgName.trim()}
                >
                  {isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first organization to start posting job listings
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {org.logo ? (
                      <Image
                        src={org.logo}
                        alt={org.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      {org.slug && (
                        <CardDescription className="text-xs">
                          @{org.slug}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <DropdownMenu
                    open={showDeleteDialog === org.id}
                    onOpenChange={(open) =>
                      setShowDeleteDialog(open ? org.id : null)
                    }
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        disabled={deletingId !== null}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {org.role === "employer" ? (
                        <DropdownMenuItem
                          onClick={() => handleDelete(org.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === org.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem disabled>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete (Employer only)
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                    className="w-full cursor-pointer"
                    variant="outline"
                    disabled={switchingId !== null}
                  >
                    {switchingId === org.id
                      ? "Switching..."
                      : "Switch to this organization"}
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
