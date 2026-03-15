import { Suspense } from "react";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import { getMyPendingInvitations } from "@/features/organizations/actions/invitation-actions";
import { InvitationsList } from "@/features/organizations/components/invitations-list";
import { PageHeader } from "@/components/shared/page-header";
import Loading from "@/components/shared/loading";
import { redirect } from "next/navigation";

export default function InvitationsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <PageHeader
        title="Organization Invitations"
        description="View and respond to your pending organization invitations"
      />
      <Suspense fallback={<Loading />}>
        <InvitationsContent />
      </Suspense>
    </div>
  );
}

async function InvitationsContent() {
  const session = await safeGetSession();

  if (!session?.user) redirect("/auth/sign-in");

  const result = await getMyPendingInvitations();

  if (!result.success) {
    return (
      <div className="text-center text-muted-foreground p-8">
        {result.message}
      </div>
    );
  }

  return <InvitationsList invitations={result.data as any} />;
}
