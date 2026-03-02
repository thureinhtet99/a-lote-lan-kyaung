import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { OrgRequestsTableClient } from "./_org-requests-table-client";
import { getAllOrganizationRequests } from "@/features/organizations/db/organization-request-db";
import { getNumberParam } from "../lib/utils";

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

  const result = await getAllOrganizationRequests();
  if (!result.success) {
    return (
      <div className="text-muted-foreground animate-pulse p-4 text-center">
        Failed to load organization requests
      </div>
    );
  }

  const requests = result.data;
  if (requests.length === 0) {
    return (
      <div className="text-muted-foreground animate-pulse p-4 text-center">
        No organization requests found
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const reviewedRequests = requests.filter((r) => r.status !== "pending");

  const pendingTotalPages = Math.max(
    1,
    Math.ceil(pendingRequests.length / PAGE_SIZE),
  );
  const reviewedTotalPages = Math.max(
    1,
    Math.ceil(reviewedRequests.length / PAGE_SIZE),
  );

  const safePendingPage = Math.min(Math.max(pendingPage, 1), pendingTotalPages);
  const safeReviewedPage = Math.min(
    Math.max(reviewedPage, 1),
    reviewedTotalPages,
  );

  const paginatedPendingRequests = pendingRequests.slice(
    (safePendingPage - 1) * PAGE_SIZE,
    safePendingPage * PAGE_SIZE,
  );
  const paginatedReviewedRequests = reviewedRequests.slice(
    (safeReviewedPage - 1) * PAGE_SIZE,
    safeReviewedPage * PAGE_SIZE,
  );

  return (
    <OrgRequestsTableClient
      pendingRequests={paginatedPendingRequests as any}
      reviewedRequests={paginatedReviewedRequests as any}
      pendingPagination={{
        page: safePendingPage,
        pageSize: PAGE_SIZE,
        totalItems: pendingRequests.length,
        totalPages: pendingTotalPages,
      }}
      reviewedPagination={{
        page: safeReviewedPage,
        pageSize: PAGE_SIZE,
        totalItems: reviewedRequests.length,
        totalPages: reviewedTotalPages,
      }}
    />
  );
};
