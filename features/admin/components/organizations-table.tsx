import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { getAllApprovedOrganizations } from "@/features/organizations/db/organization-request-db";
import { OrganizationsTableClient } from "./_organizations-table-client";
import { getNumberParam, getStringParam } from "../lib/utils";

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
  const pageSize = getNumberParam(resolvedSearchParams.pageSize, PAGE_SIZE);
  const query = getStringParam(resolvedSearchParams.q, "");

  const result = await getAllApprovedOrganizations(page, pageSize, query);

  if (!result.success) {
    return (
      <div className="text-destructive animate-pulse p-4 text-center">
        Failed to load organizations
      </div>
    );
  }

  return (
    <OrganizationsTableClient
      organizations={result.data}
      pagination={{
        page: result.pagination?.page ?? 1,
        pageSize: result.pagination?.pageSize ?? pageSize,
        totalItems: result.pagination?.totalItems ?? 0,
        totalPages: result.pagination?.totalPages ?? 1,
      }}
      initialQuery={query}
    />
  );
};
