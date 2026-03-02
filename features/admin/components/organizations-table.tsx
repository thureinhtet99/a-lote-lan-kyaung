import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { getAllApprovedOrganizations } from "@/features/organizations/db/organization-request-db";
import { OrganizationsTableClient } from "./_organizations-table-client";
import { getNumberParam } from "../lib/utils";

export default function OrganizationsTable({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent searchParams={searchParams} />
    </Suspense>
  );
}

const PAGE_SIZE = 10;

const SuspendedComponent = async ({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const page = getNumberParam(resolvedSearchParams.page, 1);

  const result = await getAllApprovedOrganizations();

  if (!result.success) {
    return (
      <div className="text-muted-foreground animate-pulse p-4 text-center">
        Failed to load organizations
      </div>
    );
  }

  const totalItems = result.data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const paginatedOrganizations = result.data.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <OrganizationsTableClient
      organizations={paginatedOrganizations}
      pagination={{
        page: safePage,
        pageSize: PAGE_SIZE,
        totalItems,
        totalPages,
      }}
    />
  );
};
