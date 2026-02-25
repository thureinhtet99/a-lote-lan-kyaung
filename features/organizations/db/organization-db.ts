"use server";

import { db } from "@/lib/db";
import { memberTable, organizationTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { APP_ROUTES } from "@/constants/app-config";
import { OrganizationType } from "@/types/index.type";

// Insert
// export async function insertOrg(org: typeof organizationTable.$inferInsert) {
//   const existingOrg = await db
//     .select()
//     .from(organizationTable)
//     .where(eq(organizationTable.id, org.id));

//   if (existingOrg.length === 0) {
//     await db.insert(organizationTable).values(org).onConflictDoNothing();
//     updateTag("organizations");
//   }
// }

// Update
// export async function updateOrg(
//   id: string,
//   user: typeof organizationTable.$inferInsert,
// ) {
//   await db
//     .update(organizationTable)
//     .set(user)
//     .where(eq(organizationTable.id, id));
//   updateTag("organizations");
// }

// // Delete
// export async function deleteOrg(id: string) {
//   await db.delete(organizationTable).where(eq(organizationTable.id, id));
//   updateTag("organizations");
// }

export const getOrganizationsByEmployerId = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
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

  const userOrganizations = await db
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

  for (const org of userOrganizations) {
    cacheTag(`organization-${org.id}-users-${userId}`);
  }
  cacheLife("hours");
  return {
    success: true,
    message: "Organizations fetched successfully",
    data: userOrganizations,
  };
};

export const getOrgById = async (id: string) => {
  "use cache";
  cacheTag(`organizations-${id}`);
  cacheLife("hours");

  const result = await db.query.organizationTable.findFirst({
    where: eq(organizationTable.id, id),
  });
  if (!result)
    return {
      success: false,
      message: "Failed to fetch organization by id",
    };

  return {
    success: true,
    message: "Organization by id fetched successfully",
    data: result,
  };
};

export const createOrg = async (
  name: string,
  userId: string,
  slug?: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, message: "Unauthorized" };

    const result = await auth.api.createOrganization({
      body: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        keepCurrentActiveOrganization: true,
      },
      headers: await headers(),
    });

    if (!result)
      return { success: false, message: "Failed to create organization" };

    updateTag(`organizations-${result.id}-users-${userId}`);

    return {
      success: true,
      message: "Organization created successfully",
    };
  } catch (error) {
    console.error("Error creating organization:", error);
    return { success: false, message: "Failed to create organization" };
  }
};

export const deleteOrg = async (
  orgId: string,
  userId: string,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, message: "Unauthorized" };

    // Check if user is owner
    const membership = await db
      .select()
      .from(memberTable)
      .where(
        eq(memberTable.organizationId, orgId) &&
          eq(memberTable.userId, session.user.id),
      )
      .limit(1);

    if (membership.length === 0 || membership[0].role !== "owner")
      return {
        success: false,
        message: "Only employer can delete organizations",
      };

    await db.delete(organizationTable).where(eq(organizationTable.id, orgId));

    updateTag(`organizations-${orgId}-users-${userId}`);

    return { success: true, message: "Organization deleted successfully" };
  } catch (error) {
    console.error("Error deleting organization:", error);
    return { success: false, message: "Failed to delete organization" };
  }
};

export const switchOrganization = async (
  organizationId: string,
  userId: string,
): Promise<{ success: boolean; message?: string; redirectTo?: string }> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) return { success: false, message: "Unauthorized" };

    const result = await auth.api.setActiveOrganization({
      body: {
        organizationId,
      },
      headers: await headers(),
    });

    if (!result)
      return { success: false, message: "Failed to switch organization" };

    updateTag(`organizations-${organizationId}-users-${userId}`);

    return {
      success: true,
      message: "Successfully switched organization",
      redirectTo: APP_ROUTES.EMPLOYER.HOME,
    };
  } catch (error) {
    console.error("Error switching organization:", error);
    return { success: false, message: "Failed to switch organization" };
  }
};
