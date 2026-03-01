import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  employerRequestTable,
  organizationRequestTable,
  organizationTable,
  userTable,
} from "@/drizzle/schema";
import { eq, count } from "drizzle-orm";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Users, Briefcase, Shield, Clock, Building2 } from "lucide-react";
import { cacheLife, cacheTag } from "next/cache";
import { dashboardStatsTag } from "@/lib/utils/data-cache";

async function getAdminStats() {
  "use cache";
  cacheTag(dashboardStatsTag());
  cacheLife("minutes");
  const [
    totalUsersResult,
    totalEmployersResult,
    totalAdminsResult,
    pendingEmployerRequestsResult,
    pendingOrgRequestsResult,
    totalOrgsResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(userTable),
    db
      .select({ count: count() })
      .from(userTable)
      .where(eq(userTable.role, "employer")),
    db
      .select({ count: count() })
      .from(userTable)
      .where(eq(userTable.role, "admin")),
    db
      .select({ count: count() })
      .from(employerRequestTable)
      .where(eq(employerRequestTable.status, "pending")),
    db
      .select({ count: count() })
      .from(organizationRequestTable)
      .where(eq(organizationRequestTable.status, "pending")),
    db.select({ count: count() }).from(organizationTable),
  ]);

  return {
    totalUsers: Number(totalUsersResult[0]?.count ?? 0),
    totalEmployers: Number(totalEmployersResult[0]?.count ?? 0),
    totalAdmins: Number(totalAdminsResult[0]?.count ?? 0),
    pendingEmployerRequests: Number(
      pendingEmployerRequestsResult[0]?.count ?? 0,
    ),
    pendingOrgRequests: Number(pendingOrgRequestsResult[0]?.count ?? 0),
    totalOrgs: Number(totalOrgsResult[0]?.count ?? 0),
  };
}

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

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
        description={`Welcome back, ${session?.user?.name ?? "Admin"}. Here's what's happening with your platform.`}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
