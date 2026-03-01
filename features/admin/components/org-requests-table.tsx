import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { OrgRequestsTableClient } from "./_org-requests-table-client";
import { getAllOrganizationRequests } from "@/features/organizations/db/organization-request-db";

export default function OrgRequestsTable() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
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
      <div className="text-muted-foreground p-4 text-center">
        No organization requests yet
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const reviewedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <OrgRequestsTableClient
      pendingRequests={pendingRequests as any}
      reviewedRequests={reviewedRequests as any}
    />
  );
};
