import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { EmployerRequestType } from "@/types/index.type";
import { EmployerRequestsTableClient } from "@/features/admin/components/_employer-requests-table-client";
import { getAllEmployerRequests } from "@/features/users/db/user-db";
import { getNumberParam } from "../lib/utils";

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

const SuspendedComponent = async ({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const pendingPage = getNumberParam(resolvedSearchParams.ep, 1);
  const reviewedPage = getNumberParam(resolvedSearchParams.er, 1);

  const result = await getAllEmployerRequests();
  if (!result.success) {
    return (
      <div className="text-muted-foreground animate-pulse p-4 text-center">
        Failed to load employer requests
      </div>
    );
  }

  const requests = result.data as EmployerRequestType[];
  if (requests.length === 0) {
    return (
      <div className="text-muted-foreground animate-pulse p-4 text-center">
        No employer requests found
      </div>
    );
  }

  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  );
  const reviewedRequests = requests.filter(
    (request) => request.status !== "pending",
  );

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
    <EmployerRequestsTableClient
      pendingRequests={paginatedPendingRequests}
      reviewedRequests={paginatedReviewedRequests}
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
