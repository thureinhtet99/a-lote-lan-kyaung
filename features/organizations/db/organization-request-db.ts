"use server";

import { db } from "@/lib/db";
import {
  jobListingTable,
  memberTable,
  organizationTable,
  organizationRequestTable,
  userTable,
} from "@/drizzle/schema";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache";
import { nanoid } from "nanoid";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import { createNotification } from "./notification-db";
import {
  dashboardStatsTag,
  orgRequestsTag,
  organizationsTag,
  userOrgRequestsTag,
} from "@/lib/data-cache";
import {
  approveRequestSchema,
  organizationRequestSchema,
  rejectRequestSchema,
} from "@/features/admin/schema/admin-form-schema";
import {
  ApproveRequestFormType,
  OrganizationRequestType,
  OrgRequestFormType,
  RejectRequestFormType,
} from "@/types/index.type";

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

    // Check if user already has an organization
    const existingOrg = await db
      .select({ id: organizationTable.id })
      .from(organizationTable)
      .innerJoin(
        memberTable,
        eq(memberTable.organizationId, organizationTable.id),
      )
      .where(eq(memberTable.userId, session.user.id))
      .limit(1);

    if (existingOrg.length > 0) {
      return {
        success: false,
        message: "Employer can have only one organization.",
      };
    }

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

export const getMyOrganizationRequest = async () => {
  try {
    const session = await safeGetSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized", data: null };
    }

    return await getMyOrganizationRequestCached(session.user.id);
  } catch (error) {
    console.error("Error fetching organization request: ", error);
    return { success: false, message: "Failed to organization fetch request", data: null };
  }
};

const getMyOrganizationRequestCached = async (userId: string) => {
  "use cache";

  const result = await db.query.organizationRequestTable.findFirst({
    where: eq(organizationRequestTable.userId, userId),
    orderBy: [desc(organizationRequestTable.createdAt)],
  });

  if (!result) return { success: false, message: "No organization request", data: null };

  cacheTag(userOrgRequestsTag(result.id));
  cacheLife("minutes");

  return {
    success: true,
    message: "Organization request fetched successfully",
    data: result,
  };
};

export const getAllOrganizationRequests = async (
  pendingPage = 1,
  reviewedPage = 1,
  pageSize = 10,
  pendingQuery = "",
  reviewedQuery = "",
): Promise<{
  success: boolean;
  message?: string;
  data: {
    pending: OrganizationRequestType[];
    reviewed: OrganizationRequestType[];
  };
  pendingPagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  reviewedPagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}> => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized",
        data: { pending: [], reviewed: [] },
        pendingPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
        reviewedPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
      };
    }

    return await getAllOrganizationRequestsCached(
      pendingPage,
      reviewedPage,
      pageSize,
      pendingQuery,
      reviewedQuery,
    );
  } catch (error) {
    console.error("Error fetching organization requests: ", error);
    return {
      success: false,
      message: "Failed to fetch organization requests",
      data: { pending: [], reviewed: [] },
      pendingPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
      reviewedPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
    };
  }
};

const getAllOrganizationRequestsCached = async (
  pendingPage: number,
  reviewedPage: number,
  pageSize: number,
  pendingQuery: string,
  reviewedQuery: string,
) => {
  "use cache";
  cacheTag(orgRequestsTag());
  cacheLife("days");

  const normalizedPendingQuery = pendingQuery.trim();
  const normalizedReviewedQuery = reviewedQuery.trim();

  const [pendingUserMatches, reviewedUserMatches] = await Promise.all([
    normalizedPendingQuery
      ? db
          .select({ id: userTable.id })
          .from(userTable)
          .where(
            or(
              ilike(userTable.name, `%${normalizedPendingQuery}%`),
              ilike(userTable.email, `%${normalizedPendingQuery}%`),
            ),
          )
      : Promise.resolve([]),
    normalizedReviewedQuery
      ? db
          .select({ id: userTable.id })
          .from(userTable)
          .where(
            or(
              ilike(userTable.name, `%${normalizedReviewedQuery}%`),
              ilike(userTable.email, `%${normalizedReviewedQuery}%`),
            ),
          )
      : Promise.resolve([]),
  ]);

  const pendingUserIds = pendingUserMatches.map((u) => u.id);
  const reviewedUserIds = reviewedUserMatches.map((u) => u.id);

  const pendingSearchCondition = normalizedPendingQuery
    ? pendingUserIds.length > 0
      ? or(
          ilike(
            organizationRequestTable.orgName,
            `%${normalizedPendingQuery}%`,
          ),
          ilike(
            organizationRequestTable.orgSlug,
            `%${normalizedPendingQuery}%`,
          ),
          ilike(
            organizationRequestTable.requestMessage,
            `%${normalizedPendingQuery}%`,
          ),
          inArray(organizationRequestTable.userId, pendingUserIds),
        )
      : or(
          ilike(
            organizationRequestTable.orgName,
            `%${normalizedPendingQuery}%`,
          ),
          ilike(
            organizationRequestTable.orgSlug,
            `%${normalizedPendingQuery}%`,
          ),
          ilike(
            organizationRequestTable.requestMessage,
            `%${normalizedPendingQuery}%`,
          ),
        )
    : undefined;

  const reviewedSearchCondition = normalizedReviewedQuery
    ? reviewedUserIds.length > 0
      ? or(
          ilike(
            organizationRequestTable.orgName,
            `%${normalizedReviewedQuery}%`,
          ),
          ilike(
            organizationRequestTable.orgSlug,
            `%${normalizedReviewedQuery}%`,
          ),
          ilike(
            organizationRequestTable.requestMessage,
            `%${normalizedReviewedQuery}%`,
          ),
          inArray(organizationRequestTable.userId, reviewedUserIds),
        )
      : or(
          ilike(
            organizationRequestTable.orgName,
            `%${normalizedReviewedQuery}%`,
          ),
          ilike(
            organizationRequestTable.orgSlug,
            `%${normalizedReviewedQuery}%`,
          ),
          ilike(
            organizationRequestTable.requestMessage,
            `%${normalizedReviewedQuery}%`,
          ),
        )
    : undefined;

  const pendingWhere = and(
    eq(organizationRequestTable.status, "pending"),
    pendingSearchCondition,
  );
  const reviewedWhere = and(
    or(
      eq(organizationRequestTable.status, "approved"),
      eq(organizationRequestTable.status, "rejected"),
    ),
    reviewedSearchCondition,
  );

  const [pendingFilteredTotalResult, reviewedFilteredTotalResult] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(organizationRequestTable)
        .where(pendingWhere),
      db
        .select({ count: count() })
        .from(organizationRequestTable)
        .where(reviewedWhere),
    ]);

  const pendingTotalItems = pendingFilteredTotalResult[0]?.count ?? 0;
  const reviewedTotalItems = reviewedFilteredTotalResult[0]?.count ?? 0;
  const pendingTotalPages = Math.max(
    1,
    Math.ceil(pendingTotalItems / pageSize),
  );
  const reviewedTotalPages = Math.max(
    1,
    Math.ceil(reviewedTotalItems / pageSize),
  );
  const safePendingPage = Math.min(Math.max(pendingPage, 1), pendingTotalPages);
  const safeReviewedPage = Math.min(
    Math.max(reviewedPage, 1),
    reviewedTotalPages,
  );

  const [pendingRequests, reviewedRequests] = await Promise.all([
    db.query.organizationRequestTable.findMany({
      where: pendingWhere,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        reviewer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(organizationRequestTable.createdAt)],
      limit: pageSize,
      offset: (safePendingPage - 1) * pageSize,
    }),
    db.query.organizationRequestTable.findMany({
      where: reviewedWhere,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        reviewer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(organizationRequestTable.reviewedAt)],
      limit: pageSize,
      offset: (safeReviewedPage - 1) * pageSize,
    }),
  ]);

  return {
    success: true,
    message: "Organization requests fetched",
    data: {
      pending: pendingRequests as OrganizationRequestType[],
      reviewed: reviewedRequests as OrganizationRequestType[],
    },
    pendingPagination: {
      page: safePendingPage,
      pageSize,
      totalItems: pendingTotalItems,
      totalPages: pendingTotalPages,
    },
    reviewedPagination: {
      page: safeReviewedPage,
      pageSize,
      totalItems: reviewedTotalItems,
      totalPages: reviewedTotalPages,
    },
  };
};

export const approveOrganizationRequest = async (
  data: ApproveRequestFormType,
) => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    const validated = approveRequestSchema.parse(data);

    const request = await db.query.organizationRequestTable.findFirst({
      where: eq(organizationRequestTable.id, validated.requestId),
    });

    if (!request) {
      return { success: false, message: "Request not found" };
    }
    if (request.status !== "pending") {
      return { success: false, message: "Request has already been reviewed" };
    }

    const orgId = nanoid();

    // Create the organization
    await db.insert(organizationTable).values({
      id: orgId,
      name: request.orgName,
      slug: request.orgSlug,
      logo: request.orgLogo,
      createdAt: new Date(),
    });

    // Note: Membership will be created when user claims the organization through notification

    // Mark request approved
    await db
      .update(organizationRequestTable)
      .set({
        status: "approved",
        adminResponse: validated.adminResponse ?? null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        createdOrganizationId: orgId,
      })
      .where(eq(organizationRequestTable.id, validated.requestId));

    // Create notification for the user
    await createNotification(
      request.userId,
      "organization_approved",
      "Organization Approved!",
      `Your organization "${request.orgName}" has been approved. Click "Claim Organization" to start using your employer dashboard.`,
      orgId,
    );

    updateTag(orgRequestsTag());
    revalidateTag(userOrgRequestsTag(request.userId), "max");
    revalidateTag(organizationsTag(), "max");
    revalidateTag(dashboardStatsTag(), "max");

    return {
      success: true,
      message: `Organization "${request.orgName}" has been created and the user has been notified`,
    };
  } catch (error) {
    console.error("Error approving organization request: ", error);
    return {
      success: false,
      message: "Failed to approve organization request",
    };
  }
};

export const rejectOrganizationRequest = async (
  data: RejectRequestFormType,
) => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    // Only admins can reject requests
    const validated = rejectRequestSchema.parse(data);
    if (!validated.adminResponse) {
      return {
        success: false,
        message: "Please provide a reason for rejection",
      };
    }

    const request = await db.query.organizationRequestTable.findFirst({
      where: eq(organizationRequestTable.id, validated.requestId),
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
        adminResponse: validated.adminResponse,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      })
      .where(eq(organizationRequestTable.id, validated.requestId));

    // Create notification for the user
    await createNotification(
      request.userId,
      "organization_rejected",
      "Organization Request Rejected",
      `Your organization request has been rejected. Reason: ${validated.adminResponse}`,
    );

    updateTag(orgRequestsTag());
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

export const getAllApprovedOrganizations = async (
  page = 1,
  pageSize = 10,
  query = "",
) => {
  try {
    return await getAllApprovedOrganizationsCached(page, pageSize, query);
  } catch (error) {
    console.error("Error fetching organizations: ", error);
    return {
      success: false,
      message: "Failed to fetch organizations",
      data: [],
      pagination: {
        page,
        pageSize,
        totalItems: 0,
        totalPages: 1,
      },
    };
  }
};

const getAllApprovedOrganizationsCached = async (
  page: number,
  pageSize: number,
  query: string,
) => {
  "use cache";
  cacheTag(organizationsTag());
  cacheLife("days");

  const normalizedQuery = query.trim();
  const whereCondition = normalizedQuery
    ? or(
        ilike(organizationTable.name, `%${normalizedQuery}%`),
        ilike(organizationTable.slug, `%${normalizedQuery}%`),
      )
    : undefined;

  const [totalResult] = await db
    .select({ count: count() })
    .from(organizationTable)
    .where(whereCondition);
  const totalItems = totalResult?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

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
    .where(whereCondition)
    .groupBy(organizationTable.id)
    .orderBy(desc(organizationTable.createdAt))
    .limit(pageSize)
    .offset((safePage - 1) * pageSize);

  return {
    success: true,
    message: "Organizations fetched",
    data: orgs,
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
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

  cacheTag(organizationsTag());
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
