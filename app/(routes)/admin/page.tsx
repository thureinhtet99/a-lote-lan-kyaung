import { PageHeader } from "@/components/shared/page-header";
import PageLoading from "@/components/shared/page-loading";
import { StatCard } from "@/components/shared/stat-card";
import { getAdminStats } from "@/features/admin/db/admin-db";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { Briefcase, Building2, Clock, Shield, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function AdminDashboard() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { user } = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/");

  const {
    totalUsers,
    totalEmployers,
    totalAdmins,
    pendingEmployerRequests,
    pendingOrgRequests,
    totalOrgs,
  } = await getAdminStats();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:space-y-8 lg:p-8">
      <PageHeader
        title="Dashboard"
        description={
          <>
            Welcome back,{" "}
            <span className="font-medium">{user.name ?? "Admin"}</span>.
            Here&apos;s what&apos;s happening with your platform.
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard
          title="Users"
          value={totalUsers}
          description="All registered users"
          icon={Users}
        />
        <StatCard
          title="Employers"
          value={totalEmployers}
          description="Users with employer role"
          icon={Briefcase}
        />
        <StatCard
          title="Admins"
          value={totalAdmins}
          description="Users with admin role"
          icon={Shield}
        />
        <StatCard
          title="Organizations"
          value={totalOrgs}
          description="Approved organizations"
          icon={Building2}
        />
        <StatCard
          title="Pending Employer Requests"
          value={pendingEmployerRequests}
          description="Awaiting review"
          icon={Clock}
        />
        <StatCard
          title="Pending Org Requests"
          value={pendingOrgRequests}
          description="Awaiting review"
          icon={Clock}
        />
      </div>
    </div>
  );
};
