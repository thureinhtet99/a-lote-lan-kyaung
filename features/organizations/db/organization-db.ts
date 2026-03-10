"use server";

import { db } from "@/lib/db";
import { memberTable, organizationTable } from "@/drizzle/schema";
import { and, count, eq } from "drizzle-orm";
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
import { safeGetSession, getCurrentOrg } from "@/lib/auth/auth-helpers";

// Get active organization from session
export const getActiveOrganization = async (): Promise<{
  success: boolean;
  message?: string;
  data: OrganizationType | null;
}> => {
  try {
    const { orgId } = await getCurrentOrg();

    if (!orgId) {
      return { success: true, message: "No active organization", data: null };
    }

    const result = await getOrgById(orgId);

    if (!result.success || !result.data) {
      return { success: false, message: result.message, data: null };
    }

    return {
      success: true,
      message: "Active organization fetched successfully",
      data: result.data as OrganizationType,
    };
  } catch (error) {
    console.error("Error fetching active organization: ", error);
    return {
      success: false,
      message: "Failed to fetch active organization",
      data: null,
    };
  }
};

// Get all organizations user is a member of
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
    console.error("Error fetching organizations: ", error);
    return {
      success: false,
      message: "Failed to fetch organizations",
      data: [],
    };
  }
};

export const activateOrganization = async (
  organizationId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "employer") {
      return { success: false, message: "Unauthorized" };
    }

    const membership = await db.query.memberTable.findFirst({
      where: and(
        eq(memberTable.userId, session.user.id),
        eq(memberTable.organizationId, organizationId),
      ),
      columns: {
        userId: true,
      },
    });

    if (!membership) {
      return {
        success: false,
        message: "You are not a member of this organization",
      };
    }

    const result = await auth.api.setActiveOrganization({
      body: {
        organizationId,
      },
      headers: await headers(),
    });

    if (!result) {
      return { success: false, message: "Failed to activate organization" };
    }

    updateTag(organizationsTag());
    updateTag(organizationTag(organizationId, session.user.id));
    updateTag(
      sideBarJobListingWithApplicationsTag(organizationId, session.user.id),
    );

    return { success: true, message: "Organization activated successfully" };
  } catch (error) {
    console.error("Error activating organization:", error);
    return { success: false, message: "Failed to activate organization" };
  }
};

const getOrganizationsByEmployerIdCached = async (userId: string) => {
  "use cache";
  cacheTag(organizationsTag());
  cacheLife("minutes");

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

  for (const org of organizations) {
    cacheTag(organizationTag(org.id, userId));
  }

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
  cacheTag(organizationIdTag(id));
  cacheLife("days");

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
