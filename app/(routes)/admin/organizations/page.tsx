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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <PageHeader
        title="Organizations"
        description="All approved organizations on the platform"
      />
      <Suspense fallback={<Loading />}>
        <SuspendedComponent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

const PAGE_SIZE = 10;

const SuspendedComponent = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const resolvedSearchParams = await searchParams;
  const page = getNumberParam(resolvedSearchParams.page, 1);

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

  const totalItems = result.data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginatedOrganizations = result.data.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const visiblePages = getVisiblePages(safePage, totalPages);

  const createPageUrl = (targetPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(targetPage));
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      <Table className="min-w-[760px]">
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
          {paginatedOrganizations.map((org) => (
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
                @{org.slug}
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
                  href={APP_ROUTES.HOME}
                  className="text-sm hover:text-primary hover:underline"
                >
                  View Details
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing page {safePage} of {totalPages} ({totalItems} total)
          </p>
          <Pagination className="mx-0 w-full justify-start overflow-x-auto pb-1 sm:w-auto sm:justify-end sm:pb-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={createPageUrl(Math.max(1, safePage - 1))}
                  aria-disabled={safePage <= 1}
                  tabIndex={safePage <= 1 ? -1 : undefined}
                  className={
                    safePage <= 1 ? "pointer-events-none opacity-50" : undefined
                  }
                />
              </PaginationItem>

              {visiblePages.map((visiblePage, index) => (
                <PaginationItem key={`${visiblePage}-${index}`}>
                  {visiblePage === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href={createPageUrl(visiblePage)}
                      isActive={visiblePage === safePage}
                    >
                      {visiblePage}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href={createPageUrl(Math.min(totalPages, safePage + 1))}
                  aria-disabled={safePage >= totalPages}
                  tabIndex={safePage >= totalPages ? -1 : undefined}
                  className={
                    safePage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

const getNumberParam = (
  value: string | string[] | undefined,
  fallback: number,
) => {
  const stringValue = Array.isArray(value) ? value[0] : value;
  if (!stringValue) return fallback;

  const parsed = Number.parseInt(stringValue, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const visiblePages: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sortedPages.length; index += 1) {
    const page = sortedPages[index];
    const previousPage = sortedPages[index - 1];

    if (index > 0) {
      const gap = page - previousPage;
      if (gap === 2) {
        visiblePages.push(previousPage + 1);
      } else if (gap > 2) {
        visiblePages.push("ellipsis");
      }
    }

    visiblePages.push(page);
  }

  return visiblePages;
};
