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
    action: "Change Status",
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
              <TableHead className="w-[200px] font-semibold">
                Resource
              </TableHead>
              <TableHead className="w-[200px] font-semibold">Action</TableHead>
              <TableHead className="text-center">
                <Badge variant="outline">Org admin</Badge>
              </TableHead>
              <TableHead className="text-center">
                <Badge variant="outline">HR</Badge>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission, index) => (
              <TableRow key={index}>
                <TableCell>{permission.resource}</TableCell>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
