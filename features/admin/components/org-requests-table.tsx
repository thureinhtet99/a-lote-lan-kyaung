import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { OrgRequestsTableClient } from "./_org-requests-table-client";
import { getAllOrganizationRequests } from "@/features/organizations/db/organization-request-db";
import { getNumberParam, getStringParam } from "../lib/utils";

export default function OrgRequestsTable({
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
  const pendingPage = getNumberParam(resolvedSearchParams.op, 1);
  const reviewedPage = getNumberParam(resolvedSearchParams.or, 1);
  const pendingQuery = getStringParam(resolvedSearchParams.opq, "");
  const reviewedQuery = getStringParam(resolvedSearchParams.orq, "");

  const result = await getAllOrganizationRequests(
    pendingPage,
    reviewedPage,
    PAGE_SIZE,
    pendingQuery,
    reviewedQuery,
  );
  if (!result.success) {
    return (
      <div className="text-muted-foreground animate-pulse p-4 text-center">
        Failed to load organization requests
      </div>
    );
  }

  return (
    <OrgRequestsTableClient
      pendingRequests={result.data.pending}
      reviewedRequests={result.data.reviewed}
      pendingPagination={result.pendingPagination}
      reviewedPagination={result.reviewedPagination}
      initialPendingQuery={pendingQuery}
      initialReviewedQuery={reviewedQuery}
    />
  );
};
