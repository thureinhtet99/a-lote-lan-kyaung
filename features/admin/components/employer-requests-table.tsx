import { Suspense } from "react";
import Loading from "@/components/shared/loading";
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

  const result = await getAllEmployerRequests(
    pendingPage,
    reviewedPage,
    PAGE_SIZE,
    pendingQuery,
    reviewedQuery,
  );
  if (!result.success) {
    return (
      <div className="text-destructive animate-pulse p-4 text-center">
        Failed to load employer requests
      </div>
    );
  }

  return (
    <EmployerRequestsTableClient
      pendingRequests={result.data.pending}
      reviewedRequests={result.data.reviewed}
      pendingPagination={result.pendingPagination}
      reviewedPagination={result.reviewedPagination}
      initialPendingQuery={pendingQuery}
      initialReviewedQuery={reviewedQuery}
    />
  );
};
