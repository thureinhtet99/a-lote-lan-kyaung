import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InvitationTable } from "@/components/features/organizations/settings/invitation-table";

export default function InvitationsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            View and manage invitations sent to join your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<InvitationTableSkeleton />}>
            <InvitationTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function InvitationTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 border rounded-lg"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
