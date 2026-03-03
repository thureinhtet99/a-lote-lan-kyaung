import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { EmployerRequestType } from "@/types/index.type";
import { EmployerRequestsTableClient } from "@/features/admin/components/_employer-requests-table-client";
import { getAllEmployerRequests } from "@/features/users/db/user-db";
import { getNumberParam, getStringParam } from "../lib/utils";

export default function EmployerRequestsTable({
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

const matchesQuery = (request: EmployerRequestType, query: string) => {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    request.user.name?.toLowerCase().includes(q) ||
    request.user.email?.toLowerCase().includes(q) ||
    request.requestMessage?.toLowerCase().includes(q)
  );
};

const SuspendedComponent = async ({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pendingPage = getNumberParam(resolvedSearchParams.ep, 1);
  const reviewedPage = getNumberParam(resolvedSearchParams.er, 1);
  const pendingQuery = getStringParam(resolvedSearchParams.epq, "");
  const reviewedQuery = getStringParam(resolvedSearchParams.erq, "");

  const result = await getAllEmployerRequests();
  if (!result.success) {
    return (
      <div className="text-destructive animate-pulse p-4 text-center">
        Failed to load employer requests
      </div>
    );
  }

  const requests = result.data as EmployerRequestType[];

  const allPendingRequests = requests.filter((r) => r.status === "pending");
  const allReviewedRequests = requests.filter((r) => r.status !== "pending");

  const filteredPendingRequests = allPendingRequests.filter((r) =>
    matchesQuery(r, pendingQuery),
  );
  const filteredReviewedRequests = allReviewedRequests.filter((r) =>
    matchesQuery(r, reviewedQuery),
  );

  const pendingTotalPages = Math.max(
    1,
    Math.ceil(filteredPendingRequests.length / PAGE_SIZE),
  );
  const reviewedTotalPages = Math.max(
    1,
    Math.ceil(filteredReviewedRequests.length / PAGE_SIZE),
  );

  const safePendingPage = Math.min(Math.max(pendingPage, 1), pendingTotalPages);
  const safeReviewedPage = Math.min(
    Math.max(reviewedPage, 1),
    reviewedTotalPages,
  );

  const paginatedPendingRequests = filteredPendingRequests.slice(
    (safePendingPage - 1) * PAGE_SIZE,
    safePendingPage * PAGE_SIZE,
  );
  const paginatedReviewedRequests = filteredReviewedRequests.slice(
    (safeReviewedPage - 1) * PAGE_SIZE,
    safeReviewedPage * PAGE_SIZE,
  );

  return (
    <EmployerRequestsTableClient
      pendingRequests={paginatedPendingRequests}
      reviewedRequests={paginatedReviewedRequests}
      pendingPagination={{
        page: safePendingPage,
        pageSize: PAGE_SIZE,
        totalItems: filteredPendingRequests.length,
        totalPages: pendingTotalPages,
      }}
      reviewedPagination={{
        page: safeReviewedPage,
        pageSize: PAGE_SIZE,
        totalItems: filteredReviewedRequests.length,
        totalPages: reviewedTotalPages,
      }}
      initialPendingQuery={pendingQuery}
      initialReviewedQuery={reviewedQuery}
      totalPendingCount={allPendingRequests.length}
      totalReviewedCount={allReviewedRequests.length}
    />
  );
};
