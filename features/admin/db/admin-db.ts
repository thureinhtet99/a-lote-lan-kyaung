import { db } from "@/lib/db";
import {
  employerRequestTable,
  organizationRequestTable,
  organizationTable,
  userTable,
} from "@/drizzle/schema";
import { eq, count } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { dashboardStatsTag } from "@/lib/utils/data-cache";

export const getAdminStats = async () => {
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
};
