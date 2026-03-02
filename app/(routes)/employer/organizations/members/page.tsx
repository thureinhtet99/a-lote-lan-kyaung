import { Suspense } from "react";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import { listOrganizationMembers } from "@/features/organizations/actions/list-members";
import { MembersTable } from "@/features/organizations/components/members-table";
import { PageHeader } from "@/components/shared/page-header";
import Loading from "@/components/shared/loading";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default function OrganizationMembersPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <PageHeader
        title="Team Members"
        description="Manage your organization members and invite new team members"
      />
      <Suspense fallback={<Loading />}>
        <MembersList />
      </Suspense>
    </div>
  );
}

async function MembersList() {
  const session = await safeGetSession();

  if (!session?.session?.activeOrganizationId) {
    redirect("/employer/organizations");
  }

  // Check if user can invite members
  const hasInvitePermission = await auth.api.hasPermission({
    headers: await headers(),
    body: {
      permissions: {
        member: ["invite"],
      },
    },
  });

  const result = await listOrganizationMembers();

  if (!result.success) {
    return (
      <div className="text-center text-muted-foreground p-8">
        {result.message}
      </div>
    );
  }

  return (
    <MembersTable
      members={result.data as any}
      canInvite={hasInvitePermission.success}
      currentUserId={session.user.id}
    />
  );
}
