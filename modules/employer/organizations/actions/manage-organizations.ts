"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { memberTable, organizationTable } from "@/drizzle/schema";
import { revalidateOrgCache } from "../db/cache/organizations";
import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/constants/app-config";

export async function getUserOrganizationsDb(userId: string) {
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

  return userOrganizations;
}

export async function createOrganization(name: string, slug?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    const result = await auth.api.createOrganization({
      body: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      },
      headers: await headers(),
    });

    if (!result) {
      return { error: "Failed to create organization" };
    }

    revalidateOrgCache(result.id);
    return { success: true, organization: result };
  } catch (error) {
    console.error("Error creating organization:", error);
    return { error: "Failed to create organization" };
  }
}

export async function deleteOrganization(orgId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    // Check if user is owner
    const membership = await db
      .select()
      .from(memberTable)
      .where(
        eq(memberTable.organizationId, orgId) &&
          eq(memberTable.userId, session.user.id),
      )
      .limit(1);

    if (membership.length === 0 || membership[0].role !== "owner") {
      return { error: "Only owners can delete organizations" };
    }

    await db.delete(organizationTable).where(eq(organizationTable.id, orgId));
    revalidateOrgCache(orgId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting organization:", error);
    return { error: "Failed to delete organization" };
  }
}

export async function switchOrganization(organizationId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { error: "Unauthorized" };
    }

    const result = await auth.api.setActiveOrganization({
      body: {
        organizationId,
      },
      headers: await headers(),
    });

    if (!result) {
      return { error: "Failed to switch organization" };
    }

    revalidateOrgCache(organizationId);
  } catch (error) {
    console.error("Error switching organization:", error);
    return { error: "Failed to switch organization" };
  }

  redirect(APP_ROUTES.EMPLOYER.HOME);
}
