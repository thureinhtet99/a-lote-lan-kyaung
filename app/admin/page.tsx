import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userTable, employerRequestTable } from "@/drizzle/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get statistics
  const totalUsers = await db
    .select({ count: count() })
    .from(userTable)
    .then((res) => res[0]?.count || 0);

  const totalEmployers = await db
    .select({ count: count() })
    .from(userTable)
    .where(eq(userTable.role, "employer"))
    .then((res) => res[0]?.count || 0);

  const totalAdmins = await db
    .select({ count: count() })
    .from(userTable)
    .where(eq(userTable.role, "admin"))
    .then((res) => res[0]?.count || 0);

  const pendingRequests = await db
    .select({ count: count() })
    .from(employerRequestTable)
    .where(eq(employerRequestTable.status, "pending"))
    .then((res) => res[0]?.count || 0);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Employers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployers}</div>
            <p className="text-xs text-muted-foreground">
              Users with employer role
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins}</div>
            <p className="text-xs text-muted-foreground">
              Users with admin role
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Employer requests awaiting review
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
