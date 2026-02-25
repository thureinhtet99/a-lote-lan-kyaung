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
import {
  Building2,
  Plus,
  Settings,
  Trash2,
  Crown,
  Shield,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { OrganizationType } from "@/types/index.type";
import {
  createOrg,
  deleteOrg,
  switchOrganization,
} from "@/features/organizations/db/organization-db";

export default function OrganizationsClient({
  organizations,
  userId,
  activeOrganizationId,
}: {
  organizations: OrganizationType[];
  userId: string;
  activeOrganizationId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const handleCreate = () => {
    startTransition(async () => {
      const result = await createOrg(
        newOrgName,
        userId,
        newOrgName.toLowerCase().replace(/\s+/g, "-"),
      );

      if (result.success) {
        setShowCreateDialog(false);
        setNewOrgName("");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = (orgId: string) => {
    setDeletingId(orgId);
    startTransition(async () => {
      const result = await deleteOrg(orgId, userId);
      if (result.success) {
        toast.success(result.message);
        setDeletingId(null);
      } else {
        toast.error(result.message);
        setDeletingId(null);
      }
    });
  };

  const handleSwitchOrganization = async (orgId: string) => {
    setSwitchingId(orgId);

    startTransition(async () => {
      const result = await switchOrganization(orgId, userId);
      if (result.success) {
        toast.success(result.message);
        setSwitchingId(null);
        if (result.redirectTo) {
          router.push(result.redirectTo);
        }
      } else {
        toast.error(result.message);
        setSwitchingId(null);
      }
    });
  };

  return (
    <div className="@container mx-auto p-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Organizations</h1>
            <p className="text-muted-foreground mt-2">
              Manage your organizations and switch between them
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
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
                  <DropdownMenu>
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
                      {org.role === "owner" && (
                        <DropdownMenuItem
                          onClick={() => handleDelete(org.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingId === org.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      )}
                      {org.role !== "owner" && (
                        <DropdownMenuItem disabled>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete (Owner only)
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
                    className="w-full"
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

// Helper function to get role icon
function getRoleIcon(role: string) {
  switch (role) {
    case "owner":
      return <Crown className="h-3 w-3" />;
    case "admin":
      return <Shield className="h-3 w-3" />;
    case "member":
      return <User className="h-3 w-3" />;
    default:
      return <User className="h-3 w-3" />;
  }
}

// Helper function to get role badge variant
function getRoleBadgeVariant(
  role: string,
): "default" | "secondary" | "outline" {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    case "member":
      return "outline";
    default:
      return "outline";
  }
}
