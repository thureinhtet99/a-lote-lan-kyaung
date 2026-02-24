"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

type Permission = {
  resource: string;
  action: string;
  owner: boolean;
  admin: boolean;
  member: boolean;
};

const permissions: Permission[] = [
  // Organization permissions
  {
    resource: "Organization",
    action: "Create",
    owner: true,
    admin: false,
    member: false,
  },
  {
    resource: "Organization",
    action: "Update",
    owner: true,
    admin: true,
    member: false,
  },
  {
    resource: "Organization",
    action: "Delete",
    owner: true,
    admin: false,
    member: false,
  },
  {
    resource: "Organization",
    action: "Switch",
    owner: true,
    admin: true,
    member: true,
  },

  // Job Listing permissions
  {
    resource: "Job Listing",
    action: "Create",
    owner: true,
    admin: true,
    member: true,
  },
  {
    resource: "Job Listing",
    action: "Update",
    owner: true,
    admin: true,
    member: true,
  },
  {
    resource: "Job Listing",
    action: "Delete",
    owner: true,
    admin: true,
    member: false,
  },
  {
    resource: "Job Listing",
    action: "Change Status",
    owner: true,
    admin: true,
    member: false,
  },

  // Application permissions
  {
    resource: "Application",
    action: "Read",
    owner: true,
    admin: true,
    member: true,
  },
  {
    resource: "Application",
    action: "Update",
    owner: true,
    admin: true,
    member: true,
  },
  {
    resource: "Application",
    action: "Change Rating",
    owner: true,
    admin: true,
    member: false,
  },
  {
    resource: "Application",
    action: "Change Status",
    owner: true,
    admin: true,
    member: false,
  },

  // Member permissions
  {
    resource: "Member",
    action: "Invite",
    owner: true,
    admin: true,
    member: false,
  },
  {
    resource: "Member",
    action: "Remove",
    owner: true,
    admin: true,
    member: false,
  },
  {
    resource: "Member",
    action: "Update Role",
    owner: true,
    admin: true,
    member: false,
  },
];

export function PermissionsMatrix() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Resource</TableHead>
              <TableHead className="w-[200px]">Action</TableHead>
              <TableHead className="text-center">
                <Badge variant="default">Owner</Badge>
              </TableHead>
              <TableHead className="text-center">
                <Badge variant="secondary">Admin</Badge>
              </TableHead>
              <TableHead className="text-center">
                <Badge variant="outline">Member</Badge>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {permission.resource}
                </TableCell>
                <TableCell>{permission.action}</TableCell>
                <TableCell className="text-center">
                  {permission.owner ? (
                    <Check className="h-5 w-5 text-green-600 inline" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/30 inline" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {permission.admin ? (
                    <Check className="h-5 w-5 text-green-600 inline" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/30 inline" />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {permission.member ? (
                    <Check className="h-5 w-5 text-green-600 inline" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/30 inline" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
        <h4 className="font-semibold text-sm">Permission Levels</h4>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="w-16">
              Owner
            </Badge>
            <span>Full control over the organization including deletion</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="w-16">
              Admin
            </Badge>
            <span>
              Full control except organization deletion and owner management
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="w-16">
              Member
            </Badge>
            <span>Limited permissions for day-to-day operations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
