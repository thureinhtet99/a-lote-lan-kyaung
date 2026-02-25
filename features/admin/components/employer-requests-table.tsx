import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { EmployerRequestType } from "@/types/index.type";
import { EmployerRequestsTableClient } from "./_employer-requests-table-client";
import { getAllEmployerRequests } from "@/features/users/db/user-db";

export default function EmployerRequestsTable() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
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

  return (
    <EmployerRequestsTableClient
      pendingRequests={pendingRequests}
      reviewedRequests={reviewedRequests}
    />
  );
};
