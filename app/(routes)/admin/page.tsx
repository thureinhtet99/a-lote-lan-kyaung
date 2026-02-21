import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userTable, employerRequestTable } from "@/drizzle/schema";
import { eq, count } from "drizzle-orm";
import { StatCard } from "@/components/shared/stat-card";
import { Users, Briefcase, Shield, Clock } from "lucide-react";
import { unstable_cache } from "next/cache";
import { tag } from "@/lib/utils";

const getAdminStats = unstable_cache(
  async () => {
    const [
      totalUsersResult,
      totalEmployersResult,
      totalAdminsResult,
      pendingRequestsResult,
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
    ]);

    return {
      totalUsers: Number(totalUsersResult[0]?.count ?? 0),
      totalEmployers: Number(totalEmployersResult[0]?.count ?? 0),
      totalAdmins: Number(totalAdminsResult[0]?.count ?? 0),
      pendingRequests: Number(pendingRequestsResult[0]?.count ?? 0),
    };
  },
  ["admin-stats"],
  {
    tags: [tag("admin-stats")],
    revalidate: 60,
  },
);

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { totalUsers, totalEmployers, totalAdmins, pendingRequests } =
    await getAdminStats();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session?.user?.name}. Here&apos;s what&apos;s happening
          with your platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
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
          title="Pending Requests"
          value={pendingRequests}
          description="Employer requests"
          icon={Clock}
        />
      </div>
    </div>
  );
}
