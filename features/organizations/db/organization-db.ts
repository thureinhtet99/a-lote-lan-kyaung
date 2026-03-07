"use server";

import { db } from "@/lib/db";
import { memberTable, organizationTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { APP_ROUTES } from "@/constants/app-config";
import { OrganizationType } from "@/types/index.type";
import {
  organizationTag,
  organizationIdTag,
  organizationsTag,
  sideBarJobListingWithApplicationsTag,
} from "@/lib/data-cache";
import { safeGetSession } from "@/lib/auth/auth-helpers";

// Note: getCurrentOrg is defined in @/lib/auth/auth-helpers

export const getOrganizationsByEmployerId = async (): Promise<{
  success: boolean;
  message?: string;
  data: OrganizationType[];
}> => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "employer") {
      return { success: false, message: "Unauthorized", data: [] };
    }

    const userId = session.user.id;

    return await getOrganizationsByEmployerIdCached(userId);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return {
      success: false,
      message: "Failed to fetch organizations",
      data: [],
    };
  }
};

const getOrganizationsByEmployerIdCached = async (userId: string) => {
  "use cache";

  const organizations = await db
    .select({
      id: organizationTable.id,
      name: organizationTable.name,
      slug: organizationTable.slug,
      logo: organizationTable.logo,
      createdAt: organizationTable.createdAt,
      metadata: organizationTable.metadata,
      role: memberTable.role,
    })
    .from(organizationTable)
    .innerJoin(
      memberTable,
      eq(memberTable.organizationId, organizationTable.id),
    )
    .where(eq(memberTable.userId, userId));

  cacheTag(organizationsTag());
  for (const org of organizations) {
    cacheTag(organizationTag(org.id, userId));
  }
  cacheLife("days");

  return {
    success: true,
    message: "Organizations fetched successfully",
    data: organizations,
  };
};

export const getOrgById = async (
  id: string,
): Promise<{
  success: boolean;
  message?: string;
  data?: Omit<OrganizationType, "role">;
}> => {
  try {
    return await getOrgByIdCached(id);
  } catch (error) {
    console.error("Error fetching in organization by id:", error);
    return {
      success: false,
      message: "Failed to fetch organization by id",
    };
  }
};

const getOrgByIdCached = async (id: string) => {
  "use cache";

  const result = await db
    .select()
    .from(organizationTable)
    .where(eq(organizationTable.id, id))
    .limit(1);

  const organization = result[0];
  if (!organization)
    return {
      success: false,
      message: "Failed to fetch organization by id",
    };

  cacheTag(organizationIdTag(id));
  cacheLife("days");

  return {
    success: true,
    message: "Organization by id fetched successfully",
    data: organization,
  };
};

export const createOrg = async (
  _name: string,
  _slug?: string,
): Promise<{ success: boolean; message?: string }> => {
  return {
    success: false,
    message:
      "Direct organization creation is disabled. Please submit an organization request via Settings → Create Organization.",
  };
};

export const deleteOrg = async (
  orgId: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const session = await safeGetSession();

    if (!session?.user) return { success: false, message: "Unauthorized" };

    // Check if user is organization admin
    const membership = await db
      .select()
      .from(memberTable)
      .where(
        and(
          eq(memberTable.organizationId, orgId),
          eq(memberTable.userId, session.user.id),
        ),
      )
      .limit(1);

    if (membership.length === 0 || membership[0].role !== "org-admin")
      return {
        success: false,
        message: "Only organization admins can delete organizations",
      };

    await db.delete(organizationTable).where(eq(organizationTable.id, orgId));

    updateTag(organizationsTag());

    return { success: true, message: "Organization deleted successfully" };
  } catch (error) {
    console.error("Error deleting organization:", error);
    return { success: false, message: "Failed to delete organization" };
  }
};
