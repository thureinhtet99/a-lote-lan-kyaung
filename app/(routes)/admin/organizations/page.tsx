import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getAllApprovedOrganizations } from "@/features/organizations/db/organization-request-db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";

export default function AdminOrganizationsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <PageHeader
        title="Organizations"
        description="All approved organizations on the platform"
      />
      <Suspense fallback={<Loading />}>
        <AdminOrganizationsList />
      </Suspense>
    </div>
  );
}

async function AdminOrganizationsList() {
  const result = await getAllApprovedOrganizations();

  if (!result.success || result.data.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No organizations yet"
        description="Organizations will appear here once approved."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.data.map((org) => (
            <TableRow key={org.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={org.logo ?? undefined} alt={org.name} />
                    <AvatarFallback className="rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                      {org.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{org.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                /{org.slug}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-3.5" />
                  {Number(org.memberCount)}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(org.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={APP_ROUTES.ORGANIZATIONS.DETAIL(org.slug)}
                  className="text-sm text-primary hover:underline"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
