"use server";

import { db } from "@/lib/db";
import {
  jobListingTable,
  memberTable,
  organizationRequestTable,
  organizationTable,
  userTable,
} from "@/drizzle/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { nanoid } from "nanoid";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import {
  allOrganizationsTag,
  dashboardStatsTag,
  orgRequestIdTag,
  orgRequestsTag,
  organizationsTag,
  userOrgRequestsTag,
} from "@/lib/utils/data-cache";
import {
  approveOrgRequestSchema,
  organizationRequestSchema,
  rejectOrgRequestSchema,
} from "@/features/admin/schema/admin-schema";
import {
  ApproveOrgRequestFormType,
  OrgRequestFormType,
  RejectOrgRequestFormType,
} from "@/types/index.type";

// ─── User: create org request ──────────────────────────────────────────────

export const createOrganizationRequest = async (data: OrgRequestFormType) => {
  try {
    const session = await safeGetSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    if (session.user.role !== "employer") {
      return {
        success: false,
        message: "Only employers can request to create an organization",
      };
    }

    const validated = organizationRequestSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { orgName, orgSlug, orgLogo, requestMessage } = validated.data;

    // Check slug uniqueness in organizations table
    const existing = await db.query.organizationTable.findFirst({
      where: eq(organizationTable.slug, orgSlug),
      columns: { id: true },
    });
    if (existing) {
      return {
        success: false,
        message: "An organization with that slug already exists",
      };
    }

    // Check for existing pending request from this user
    const existingPending = await db.query.organizationRequestTable.findFirst({
      where: and(
        eq(organizationRequestTable.userId, session.user.id),
        eq(organizationRequestTable.status, "pending"),
      ),
      columns: { id: true },
    });
    if (existingPending) {
      return {
        success: false,
        message: "You already have a pending organization request",
      };
    }

    await db.insert(organizationRequestTable).values({
      id: nanoid(),
      userId: session.user.id,
      orgName,
      orgSlug,
      orgLogo: orgLogo ?? null,
      requestMessage,
      status: "pending",
    });

    revalidateTag(orgRequestsTag(), "max");
    revalidateTag(userOrgRequestsTag(session.user.id), "max");
    revalidateTag(dashboardStatsTag(), "max");

    return { success: true, message: "Organization request submitted" };
  } catch (error) {
    console.error("Error creating organization request:", error);
    return { success: false, message: "Failed to create organization request" };
  }
};

// ─── User: get own org request ─────────────────────────────────────────────

export const getMyOrganizationRequest = async () => {
  try {
    const session = await safeGetSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized", data: null };
    }

    return await getMyOrganizationRequestCached(session.user.id);
  } catch (error) {
    console.error("Error fetching organization request:", error);
    return { success: false, message: "Failed to fetch request", data: null };
  }
};

const getMyOrganizationRequestCached = async (userId: string) => {
  "use cache";

  cacheTag(userOrgRequestsTag(userId));
  cacheLife("minutes");

  const result = await db.query.organizationRequestTable.findFirst({
    where: eq(organizationRequestTable.userId, userId),
    orderBy: [desc(organizationRequestTable.createdAt)],
  });

  return { success: true, message: "Request fetched", data: result ?? null };
};

// ─── Admin: get all org requests ───────────────────────────────────────────

export const getAllOrganizationRequests = async () => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized", data: [] };
    }

    return await getAllOrganizationRequestsCached();
  } catch (error) {
    console.error("Error fetching organization requests:", error);
    return {
      success: false,
      message: "Failed to fetch organization requests",
      data: [],
    };
  }
};

const getAllOrganizationRequestsCached = async () => {
  "use cache";

  cacheTag(orgRequestsTag());
  cacheLife("minutes");

  const requests = await db
    .select({
      id: organizationRequestTable.id,
      userId: organizationRequestTable.userId,
      orgName: organizationRequestTable.orgName,
      orgSlug: organizationRequestTable.orgSlug,
      orgLogo: organizationRequestTable.orgLogo,
      requestMessage: organizationRequestTable.requestMessage,
      status: organizationRequestTable.status,
      adminResponse: organizationRequestTable.adminResponse,
      reviewedBy: organizationRequestTable.reviewedBy,
      reviewedAt: organizationRequestTable.reviewedAt,
      createdOrganizationId: organizationRequestTable.createdOrganizationId,
      createdAt: organizationRequestTable.createdAt,
      updatedAt: organizationRequestTable.updatedAt,
      userName: userTable.name,
      userEmail: userTable.email,
      userImage: userTable.image,
    })
    .from(organizationRequestTable)
    .innerJoin(userTable, eq(organizationRequestTable.userId, userTable.id))
    .orderBy(desc(organizationRequestTable.createdAt));

  return {
    success: true,
    message: "Organization requests fetched",
    data: requests,
  };
};

// ─── Admin: approve org request ────────────────────────────────────────────

export const approveOrganizationRequest = async (
  data: ApproveOrgRequestFormType,
) => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    const validated = approveOrgRequestSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { requestId, adminResponse } = validated.data;

    const request = await db.query.organizationRequestTable.findFirst({
      where: eq(organizationRequestTable.id, requestId),
    });

    if (!request) {
      return { success: false, message: "Request not found" };
    }
    if (request.status !== "pending") {
      return { success: false, message: "Request has already been reviewed" };
    }

    // Create the organization
    const orgId = nanoid();
    await db.insert(organizationTable).values({
      id: orgId,
      name: request.orgName,
      slug: request.orgSlug,
      logo: request.orgLogo,
      createdAt: new Date(),
    });

    // Create membership (org-admin role)
    await db.insert(memberTable).values({
      id: nanoid(),
      organizationId: orgId,
      userId: request.userId,
      role: "org-admin",
      createdAt: new Date(),
    });

    // Mark request approved
    await db
      .update(organizationRequestTable)
      .set({
        status: "approved",
        adminResponse: adminResponse ?? null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        createdOrganizationId: orgId,
      })
      .where(eq(organizationRequestTable.id, requestId));

    revalidateTag(orgRequestsTag(), "max");
    revalidateTag(orgRequestIdTag(requestId), "max");
    revalidateTag(userOrgRequestsTag(request.userId), "max");
    revalidateTag(organizationsTag(request.userId), "max");
    revalidateTag(allOrganizationsTag(), "max");
    revalidateTag(dashboardStatsTag(), "max");

    return {
      success: true,
      message: `Organization "${request.orgName}" has been created and the user has been notified`,
    };
  } catch (error) {
    console.error("Error approving organization request:", error);
    return {
      success: false,
      message: "Failed to approve organization request",
    };
  }
};

// ─── Admin: reject org request ─────────────────────────────────────────────

export const rejectOrganizationRequest = async (
  data: RejectOrgRequestFormType,
) => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    const validated = rejectOrgRequestSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message ?? "Invalid input",
      };
    }

    const { requestId, adminResponse } = validated.data;

    const request = await db.query.organizationRequestTable.findFirst({
      where: eq(organizationRequestTable.id, requestId),
      columns: { id: true, status: true, userId: true },
    });

    if (!request) {
      return { success: false, message: "Request not found" };
    }
    if (request.status !== "pending") {
      return { success: false, message: "Request has already been reviewed" };
    }

    await db
      .update(organizationRequestTable)
      .set({
        status: "rejected",
        adminResponse,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      })
      .where(eq(organizationRequestTable.id, requestId));

    revalidateTag(orgRequestsTag(), "max");
    revalidateTag(orgRequestIdTag(requestId), "max");
    revalidateTag(userOrgRequestsTag(request.userId), "max");

    return {
      success: true,
      message: "Organization request has been rejected",
    };
  } catch (error) {
    console.error("Error rejecting organization request:", error);
    return { success: false, message: "Failed to reject organization request" };
  }
};

// ─── Public / Admin: get all approved organizations ────────────────────────

export const getAllApprovedOrganizations = async () => {
  try {
    return await getAllApprovedOrganizationsCached();
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return {
      success: false,
      message: "Failed to fetch organizations",
      data: [],
    };
  }
};

const getAllApprovedOrganizationsCached = async () => {
  "use cache";

  cacheTag(allOrganizationsTag());
  cacheLife("hours");

  const orgs = await db
    .select({
      id: organizationTable.id,
      name: organizationTable.name,
      slug: organizationTable.slug,
      logo: organizationTable.logo,
      createdAt: organizationTable.createdAt,
      memberCount: count(memberTable.id),
    })
    .from(organizationTable)
    .leftJoin(memberTable, eq(organizationTable.id, memberTable.organizationId))
    .groupBy(organizationTable.id)
    .orderBy(desc(organizationTable.createdAt));

  return { success: true, message: "Organizations fetched", data: orgs };
};

// ─── Public / Admin: get organization with members and job listings by slug ─

export const getOrganizationDetailBySlug = async (slug: string) => {
  try {
    return await getOrganizationDetailBySlugCached(slug);
  } catch (error) {
    console.error("Error fetching organization detail:", error);
    return {
      success: false,
      message: "Failed to fetch organization",
      data: null,
    };
  }
};

const getOrganizationDetailBySlugCached = async (slug: string) => {
  "use cache";

  cacheTag(allOrganizationsTag());
  cacheLife("hours");

  const org = await db.query.organizationTable.findFirst({
    where: eq(organizationTable.slug, slug),
    with: {
      members: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: (m, { asc }) => [asc(m.createdAt)],
      },
    },
  });

  if (!org) {
    return { success: false, message: "Organization not found", data: null };
  }

  // Fetch published job listings separately to avoid circular imports
  const jobListings = await db
    .select({
      id: jobListingTable.id,
      title: jobListingTable.title,
      type: jobListingTable.type,
      locationRequirement: jobListingTable.locationRequirement,
      experienceLevel: jobListingTable.experienceLevel,
      wage: jobListingTable.wage,
      wageInterval: jobListingTable.wageInterval,
      city: jobListingTable.city,
      status: jobListingTable.status,
      posted_at: jobListingTable.posted_at,
    })
    .from(jobListingTable)
    .where(
      and(
        eq(jobListingTable.organizationId, org.id),
        eq(jobListingTable.status, "published"),
      ),
    )
    .orderBy(desc(jobListingTable.posted_at));

  return {
    success: true,
    message: "Organization fetched",
    data: { ...org, jobListings },
  };
};
