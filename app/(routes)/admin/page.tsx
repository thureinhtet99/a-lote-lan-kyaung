import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Users, Briefcase, Shield, Clock, Building2 } from "lucide-react";
import { getAdminStats } from "@/features/admin/db/admin-db";
import { getCurrentUser, safeGetSession } from "@/lib/auth/auth-helpers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
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
            <span className="text-black">{user.name ?? "Admin"}</span>.
            Here&apos;s what&apos;s happening with your platform.
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
}
