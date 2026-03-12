"use server";

import { APP_ROUTES } from "@/constants/app-config";
import { memberTable, organizationTable } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { getCurrentOrg, safeGetSession } from "@/lib/auth/auth-helpers";
import {
  organizationIdTag,
  organizationsTag,
  organizationTag,
  sideBarJobListingWithApplicationsTag,
} from "@/lib/data-cache";
import { db } from "@/lib/db";
import { OrganizationType } from "@/types/index.type";
import { and, eq, ne } from "drizzle-orm";
import { cacheLife, cacheTag, revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const updateOrganizationSchema = z.object({
  name: z.string().min(3, "Organization name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  metadata: z.string().max(5000, "Metadata must be 5000 characters or less"),
});

export const getInitialOrganization = async (
  userId: string,
): Promise<Pick<OrganizationType, "id"> | null> => {
  try {
    if (!userId) return null;

    const membership = await db.query.memberTable.findFirst({
      where: eq(memberTable.userId, userId),
      columns: {
        organizationId: true,
      },
      orderBy: (members, { asc }) => [asc(members.createdAt)],
    });

    if (!membership) return null;

    return { id: membership.organizationId };
  } catch (error) {
    console.error("Error getting initial organization:", error);
    return null;
  }
};

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

export const getActiveOrganizationSettings = async (): Promise<{
  success: boolean;
  message?: string;
  data: {
    id: string;
    name: string;
    slug: string;
    metadata: string | null;
    isOrgAdmin: boolean;
  } | null;
}> => {
  try {
    const session = await safeGetSession();

    if (!session?.user || session.user.role !== "employer") {
      return { success: false, message: "Unauthorized", data: null };
    }

    const activeOrganizationId = session.session.activeOrganizationId;

    if (!activeOrganizationId) {
      return {
        success: false,
        message: "No active organization found",
        data: null,
      };
    }

    const [organization, membership] = await Promise.all([
      db.query.organizationTable.findFirst({
        where: eq(organizationTable.id, activeOrganizationId),
        columns: {
          id: true,
          name: true,
          slug: true,
          metadata: true,
        },
      }),
      db.query.memberTable.findFirst({
        where: and(
          eq(memberTable.organizationId, activeOrganizationId),
          eq(memberTable.userId, session.user.id),
        ),
        columns: {
          role: true,
        },
      }),
    ]);

    if (!organization || !membership) {
      return {
        success: false,
        message: "Organization not found or access denied",
        data: null,
      };
    }

    return {
      success: true,
      message: "Organization settings fetched successfully",
      data: {
        ...organization,
        isOrgAdmin: membership.role === "org-admin",
      },
    };
  } catch (error) {
    console.error("Error fetching active organization settings:", error);
    return {
      success: false,
      message: "Failed to fetch organization settings",
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

export const updateActiveOrganization = async (
  data: z.infer<typeof updateOrganizationSchema>,
): Promise<{ success: boolean; message: string }> => {
  try {
    const session = await safeGetSession();

    if (!session?.user || session.user.role !== "employer") {
      return { success: false, message: "Unauthorized" };
    }

    const activeOrganizationId = session.session.activeOrganizationId;

    if (!activeOrganizationId) {
      return { success: false, message: "No active organization found" };
    }

    const validated = updateOrganizationSchema.parse(data);

    const membership = await db.query.memberTable.findFirst({
      where: and(
        eq(memberTable.organizationId, activeOrganizationId),
        eq(memberTable.userId, session.user.id),
      ),
      columns: {
        role: true,
      },
    });

    if (!membership || membership.role !== "org-admin") {
      return {
        success: false,
        message: "Only organization admins can update organization settings",
      };
    }

    const normalizedSlug = validated.slug.trim().toLowerCase();
    const existingSlug = await db.query.organizationTable.findFirst({
      where: and(
        eq(organizationTable.slug, normalizedSlug),
        ne(organizationTable.id, activeOrganizationId),
      ),
      columns: {
        id: true,
      },
    });

    if (existingSlug) {
      return {
        success: false,
        message: "An organization with this slug already exists",
      };
    }

    const normalizedMetadata = validated.metadata.trim();

    await db
      .update(organizationTable)
      .set({
        name: validated.name.trim(),
        slug: normalizedSlug,
        metadata: normalizedMetadata.length > 0 ? normalizedMetadata : null,
      })
      .where(eq(organizationTable.id, activeOrganizationId));

    updateTag(organizationsTag());
    updateTag(organizationIdTag(activeOrganizationId));
    updateTag(organizationTag(activeOrganizationId, session.user.id));
    updateTag(
      sideBarJobListingWithApplicationsTag(
        activeOrganizationId,
        session.user.id,
      ),
    );

    revalidatePath(APP_ROUTES.EMPLOYER.MY_ORG);
    revalidatePath(APP_ROUTES.EMPLOYER.SETTINGS.ORGANIZATION);
    revalidatePath(APP_ROUTES.EMPLOYER.SETTINGS.HOME);

    return {
      success: true,
      message: "Organization settings updated successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0]?.message ?? "Invalid organization data",
      };
    }

    console.error("Error updating organization settings:", error);
    return {
      success: false,
      message: "Failed to update organization settings",
    };
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
    updateTag(organizationIdTag(orgId));
    updateTag(organizationTag(orgId, session.user.id));
    updateTag(sideBarJobListingWithApplicationsTag(orgId, session.user.id));

    revalidatePath(APP_ROUTES.EMPLOYER.MY_ORG);
    revalidatePath(APP_ROUTES.EMPLOYER.SETTINGS.ORGANIZATION);
    revalidatePath(APP_ROUTES.EMPLOYER.SETTINGS.HOME);

    return { success: true, message: "Organization deleted successfully" };
  } catch (error) {
    console.error("Error deleting organization:", error);
    return { success: false, message: "Failed to delete organization" };
  }
};
