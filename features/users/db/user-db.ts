"use server";

import { db } from "@/lib/db";
import { employerRequestTable, userTable } from "@/drizzle/schema";
import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache";
import {
  dashboardStatsTag,
  employerRequestIdTag,
  employerRequestsTag,
  userIdTag,
  usersTag,
} from "@/lib/data-cache";
import {
  ApproveRequestFormType,
  EmployerRequestType,
  EmployerRequestFormType,
  RejectRequestFormType,
  UserRoleType,
} from "@/types/index.type";
import {
  approveRequestSchema,
  employerRequestSchema,
  rejectRequestSchema,
} from "@/features/admin/schema/admin-form-schema";
import { nanoid } from "nanoid";
import { safeGetSession } from "@/lib/auth/auth-helpers";

// Get all users
export const getAllUsers = async (
  page = 1,
  pageSize = 10,
  query = "",
): Promise<{
  success: boolean;
  message: string;
  data: Awaited<ReturnType<typeof getAllUsersCached>>["data"][number][];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}> => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "admin")
      return { success: false, message: "Unauthorized", data: [] };

    return await getAllUsersCached(page, pageSize, query);
  } catch (error) {
    console.error("Error fetching users: ", error);
    return {
      success: false,
      message: "Failed to fetch users",
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

const getAllUsersCached = async (
  page: number,
  pageSize: number,
  query: string,
) => {
  "use cache";
  cacheTag(usersTag());
  cacheLife("minutes");

  const normalizedQuery = query.trim();
  const whereCondition = normalizedQuery
    ? or(
        ilike(userTable.name, `%${normalizedQuery}%`),
        ilike(userTable.email, `%${normalizedQuery}%`),
      )
    : undefined;

  const [total] = await db
    .select({ count: count() })
    .from(userTable)
    .where(whereCondition);
  const totalItems = total?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const users = await db.query.userTable.findMany({
    where: whereCondition,
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      emailVerified: true,
      banned: true,
      banReason: true,
      createdAt: true,
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)],
    limit: pageSize,
    offset: (safePage - 1) * pageSize,
  });

  return {
    success: true,
    message: "All users fetched successfully",
    data: users,
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
};

// Update user role
export const updateUserRole = async (userId: string, role: UserRoleType) => {
  try {
    const session = await safeGetSession();

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    await db.update(userTable).set({ role }).where(eq(userTable.id, userId));
    updateTag(usersTag());
    updateTag(dashboardStatsTag());

    return { success: true, message: "User role updated successfully" };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, message: "Failed to update user role" };
  }
};

export const banUser = async (userId: string, reason: string) => {
  try {
    const session = await safeGetSession();

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    await db
      .update(userTable)
      .set({
        banned: true,
        banReason: reason,
      })
      .where(eq(userTable.id, userId));
    updateTag(usersTag());
    updateTag(dashboardStatsTag());

    return { success: true, message: "User banned successfully" };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, message: "Failed to ban user" };
  }
};

export const unbanUser = async (userId: string) => {
  try {
    const session = await safeGetSession();

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    await db
      .update(userTable)
      .set({
        banned: false,
        banReason: null,
      })
      .where(eq(userTable.id, userId));
    updateTag(usersTag());
    updateTag(dashboardStatsTag());

    return { success: true, message: "User unbanned successfully" };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { success: false, message: "Failed to unban user" };
  }
};

export const updateUser = async (
  id: string,
  user: typeof userTable.$inferInsert,
) => {
  await db.update(userTable).set(user).where(eq(userTable.id, id));
  updateTag(userIdTag(id));
  updateTag(dashboardStatsTag());
};

export const deleteUser = async (id: string) => {
  await db.delete(userTable).where(eq(userTable.id, id));
  updateTag(usersTag());
  updateTag(dashboardStatsTag());
};

// Employer
export const getAllEmployerRequests = async (
  pendingPage = 1,
  reviewedPage = 1,
  pageSize = 10,
  pendingQuery = "",
  reviewedQuery = "",
): Promise<{
  success: boolean;
  message?: string;
  data: {
    pending: EmployerRequestType[];
    reviewed: EmployerRequestType[];
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
    if (!session?.user)
      return {
        success: false,
        message: "Unauthorized",
        data: { pending: [], reviewed: [] },
        pendingPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
        reviewedPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
      };

    // Only admins can view all requests
    if (session.user.role !== "admin")
      return {
        success: false,
        message: "Only admins can view all employer requests",
        data: { pending: [], reviewed: [] },
        pendingPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
        reviewedPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
      };

    return await getAllEmployerRequestsCached(
      pendingPage,
      reviewedPage,
      pageSize,
      pendingQuery,
      reviewedQuery,
    );
  } catch (error) {
    console.error("Error fetching employer requests: ", error);
    return {
      success: false,
      message: "Failed to fetch employer requests",
      data: { pending: [], reviewed: [] },
      pendingPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
      reviewedPagination: { page: 1, pageSize, totalItems: 0, totalPages: 1 },
    };
  }
};

const getAllEmployerRequestsCached = async (
  pendingPage: number,
  reviewedPage: number,
  pageSize: number,
  pendingQuery: string,
  reviewedQuery: string,
) => {
  "use cache";
  cacheTag(employerRequestsTag());
  cacheLife("hours");

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
            employerRequestTable.requestMessage,
            `%${normalizedPendingQuery}%`,
          ),
          inArray(employerRequestTable.userId, pendingUserIds),
        )
      : ilike(
          employerRequestTable.requestMessage,
          `%${normalizedPendingQuery}%`,
        )
    : undefined;

  const reviewedSearchCondition = normalizedReviewedQuery
    ? reviewedUserIds.length > 0
      ? or(
          ilike(
            employerRequestTable.requestMessage,
            `%${normalizedReviewedQuery}%`,
          ),
          inArray(employerRequestTable.userId, reviewedUserIds),
        )
      : ilike(
          employerRequestTable.requestMessage,
          `%${normalizedReviewedQuery}%`,
        )
    : undefined;

  const pendingWhere = and(
    eq(employerRequestTable.status, "pending"),
    pendingSearchCondition,
  );
  const reviewedWhere = and(
    or(
      eq(employerRequestTable.status, "approved"),
      eq(employerRequestTable.status, "rejected"),
    ),
    reviewedSearchCondition,
  );

  const [pendingFilteredTotalResult, reviewedFilteredTotalResult] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(employerRequestTable)
        .where(pendingWhere),
      db
        .select({ count: count() })
        .from(employerRequestTable)
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
    db.query.employerRequestTable.findMany({
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
      orderBy: [desc(employerRequestTable.createdAt)],
      limit: pageSize,
      offset: (safePendingPage - 1) * pageSize,
    }),
    db.query.employerRequestTable.findMany({
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
      orderBy: [desc(employerRequestTable.reviewedAt)],
      limit: pageSize,
      offset: (safeReviewedPage - 1) * pageSize,
    }),
  ]);

  return {
    success: true,
    data: {
      pending: pendingRequests,
      reviewed: reviewedRequests,
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

export const getEmployerRequest = async () => {
  try {
    const session = await safeGetSession();
    if (!session?.user) return { success: false, message: "Unauthorized" };

    return await getEmployerRequestCached(session.user.id);
  } catch (error) {
    console.error("Error fetching employer request: ", error);
    return {
      success: false,
      message: "Failed to fetch employer request",
    };
  }
};

const getEmployerRequestCached = async (userId: string) => {
  "use cache";

  const request = await db.query.employerRequestTable.findFirst({
    where: eq(employerRequestTable.userId, userId),
    orderBy: [desc(employerRequestTable.createdAt)],
  });

  if (!request) return { success: false, message: "No employer request" };

  cacheTag(employerRequestIdTag(request.id));
  cacheLife("minutes");

  return {
    success: true,
    message: "Employer request fetched successfully",
    data: request,
  };
};

export const createEmployerRequest = async (
  data: EmployerRequestFormType,
): Promise<{ success: boolean; message?: string }> => {
  try {
    // Validate input
    const validated = employerRequestSchema.parse(data);

    const session = await safeGetSession();

    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const user = session.user;

    // Check if user is already an employer or admin
    if (user.role === "employer" || user.role === "admin") {
      return {
        success: false,
        message: "You are already an employer",
      };
    }

    // Check if user already has a pending or approved request
    const existingRequest = await db.query.employerRequestTable.findFirst({
      where: and(
        eq(employerRequestTable.userId, user.id),
        or(
          eq(employerRequestTable.status, "pending"),
          eq(employerRequestTable.status, "approved"),
        ),
      ),
    });

    if (existingRequest) {
      if (existingRequest.status === "approved") {
        return {
          success: false,
          message: "Your request has already been approved",
        };
      }
      return {
        success: false,
        message: "You already have a pending request",
      };
    }

    const [result] = await db
      .insert(employerRequestTable)
      .values({
        id: nanoid(),
        userId: user.id,
        status: "pending",
        requestMessage: validated.requestMessage,
      })
      .returning({
        employerRequestId: employerRequestTable.id,
      });

    updateTag(employerRequestIdTag(result.employerRequestId));
    updateTag(employerRequestsTag());
    updateTag(dashboardStatsTag());

    return { success: true, message: "Submitted successfully" };
  } catch (error) {
    console.error("Error creating employer request:", error);
    return {
      success: false,
      message: "Failed to create employer request",
    };
  }
};

export const approveEmployerRequest = async (
  data: ApproveRequestFormType,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const session = await safeGetSession();
    if (!session?.user) return { success: false, message: "Unauthorized" };

    const validated = approveRequestSchema.parse(data);

    // Get the request
    const request = await db.query.employerRequestTable.findFirst({
      where: eq(employerRequestTable.id, validated.requestId),
      with: {
        user: true,
      },
    });

    if (!request) return { success: false, message: "Request not found" };

    if (request.status !== "pending")
      return { success: false, message: "Request has already been reviewed" };

    // Update the request
    await db
      .update(employerRequestTable)
      .set({
        status: "approved",
        adminResponse: validated.adminResponse,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      })
      .where(eq(employerRequestTable.id, validated.requestId));

    // Update the user role to employer
    await db
      .update(userTable)
      .set({
        role: "employer",
      })
      .where(eq(userTable.id, request.userId));

    revalidateTag(usersTag(), "max");
    updateTag(employerRequestsTag());
    revalidateTag(dashboardStatsTag(), "max");

    return { success: true, message: "Employer request approved successfully" };
  } catch (error) {
    console.error("Error approving employer request: ", error);
    return {
      success: false,
      message: "Failed to approve employer request",
    };
  }
};

export const rejectEmployerRequest = async (
  data: RejectRequestFormType,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const session = await safeGetSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = rejectRequestSchema.parse(data);
    if (!validated.adminResponse) {
      return {
        success: false,
        message: "Please provide a reason for rejection",
      };
    }

    // Get the request
    const request = await db.query.employerRequestTable.findFirst({
      where: eq(employerRequestTable.id, validated.requestId),
    });

    if (!request) {
      return { success: false, message: "Request not found" };
    }

    if (request.status !== "pending") {
      return { success: false, message: "Request has already been reviewed" };
    }

    // Update the request
    await db
      .update(employerRequestTable)
      .set({
        status: "rejected",
        adminResponse: validated.adminResponse,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      })
      .where(eq(employerRequestTable.id, validated.requestId));

    revalidateTag(dashboardStatsTag(), "max");
    updateTag(employerRequestsTag());

    return { success: true, message: "Employer request rejected successfully" };
  } catch (error) {
    console.error("Error rejecting employer request:", error);
    return {
      success: false,
      message: "Failed to reject employer request",
    };
  }
};
