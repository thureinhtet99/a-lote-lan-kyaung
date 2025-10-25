"use server";

import { db } from "@/drizzle/db";
import { organizationsTable } from "@/drizzle/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { revalidateOrgCache } from "@/features/organizations/db/cache/organizations";

// Check if organization exists in database (cached)
const checkOrgExists = unstable_cache(
  async (orgId: string) => {
    const org = await db.query.organizationsTable.findFirst({
      where: eq(organizationsTable.id, orgId),
    });
    return !!org;
  },
  [],
  {
    tags: [`org-exists`],
    revalidate: 300, // Cache for 5 minutes
  }
);

// One-time organization sync - only runs if org doesn't exist in DB
export async function ensureOrganizationExists() {
  const { orgId } = await auth();

  if (!orgId) {
    return { success: false, reason: "No organization ID" };
  }

  // First check if organization already exists (cached)
  const exists = await checkOrgExists(orgId);
  if (exists) {
    return { success: true, reason: "Organization already exists", orgId };
  }

  try {
    // Get organization data from Clerk
    const clerk = await clerkClient();
    const organization = await clerk.organizations.getOrganization({
      organizationId: orgId,
    });

    // Insert to database
    await db
      .insert(organizationsTable)
      .values({
        id: orgId,
        name: organization.name || "",
        image: organization.imageUrl || "",
      })
      .onConflictDoNothing();

    // Revalidate cache
    revalidateOrgCache(orgId);

    return { success: true, reason: "Organization synced", orgId };
  } catch (error) {
    console.error("Failed to sync organization:", error);
    return {
      success: false,
      reason: "Sync failed",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
