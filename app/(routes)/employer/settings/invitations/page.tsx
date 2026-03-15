import { InvitationTable } from "@/components/organizations/settings/invitation-table";
import Loading from "@/components/shared/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";

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
          <Suspense fallback={<Loading />}>
            <InvitationTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
