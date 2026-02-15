import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberTable } from "@/components/features/organizations/settings/member-table";
import { MemberInviteDialog } from "@/components/features/organizations/settings/member-invite-dialog";

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle>Organization Members</CardTitle>
            <CardDescription>
              Manage your organization members and their roles
            </CardDescription>
          </div>
          <MemberInviteDialog />
        </CardHeader>
        <CardContent>
          <Suspense fallback={<MemberTableSkeleton />}>
            <MemberTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function MemberTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
