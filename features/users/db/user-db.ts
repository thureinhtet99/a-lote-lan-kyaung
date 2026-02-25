"use server";

import { db } from "@/lib/db";
import { employerRequestTable, userTable } from "@/drizzle/schema";
import { and, count, desc, eq, or } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { idTag, tag } from "@/lib/utils/data-cache";
import {
  ApproveRequestFormType,
  EmployerRequestFormType,
  RejectRequestFormType,
  UserRoleType,
} from "@/types/index.type";
import {
  approveRequestSchema,
  employerRequestSchema,
  rejectRequestSchema,
} from "@/features/admin/admin-schema";
import { nanoid } from "nanoid";

// Users
export const getAllUsers = async (page = 1, pageSize = 10) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized", data: [] };
    }

    return await getAllUsersCached(page, pageSize);
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      message: "Failed to fetch users",
      data: [],
      pagination: {
        page,
        pageSize,
        totalUsers: 0,
        totalPages: 1,
      },
    };
  }
};

const getAllUsersCached = async (page: number, pageSize: number) => {
  "use cache";
  cacheTag(tag("users"));
  cacheLife("minutes");

  const [total] = await db.select({ count: count() }).from(userTable);
  const totalUsers = total?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const users = await db.query.userTable.findMany({
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
    data: users,
    pagination: {
      page: safePage,
      pageSize,
      totalUsers,
      totalPages,
    },
  };
};

export const updateUserRole = async (userId: string, role: UserRoleType) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, message: "Unauthorized" };
    }

    await db.update(userTable).set({ role }).where(eq(userTable.id, userId));
    updateTag("users");
    updateTag("admin-stats");

    return { success: true, message: "User role updated successfully" };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, message: "Failed to update user role" };
  }
};

export const banUser = async (userId: string, reason: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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
    updateTag("users");
    updateTag("admin-stats");

    return { success: true, message: "User banned successfully" };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, message: "Failed to ban user" };
  }
};

export const unbanUser = async (userId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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
    updateTag("users");
    updateTag("admin-stats");

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
  updateTag(`users-${id}`);
  updateTag("admin-stats");
};

export const deleteUser = async (id: string) => {
  await db.delete(userTable).where(eq(userTable.id, id));
  updateTag("users");
  updateTag("admin-stats");
};

// Employer
export const getAllEmployerRequests = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, message: "Unauthorized", data: [] };
    }

    // Only admins can view all requests
    if (session.user.role !== "admin") {
      return {
        success: false,
        message: "Only admins can view all requests",
        data: [],
      };
    }

    return await getAllEmployerRequestsCached();
  } catch (error) {
    console.error("Error fetching employer requests:", error);
    return {
      success: false,
      message: "Failed to fetch employer requests",
      data: [],
    };
  }
};

const getAllEmployerRequestsCached = async () => {
  "use cache";
  cacheTag(tag("employer-requests"));
  cacheLife("hours");

  const requests = await db.query.employerRequestTable.findMany({
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
  });

  return { success: true, data: requests };
};

export const getEmployerRequest = async () => {
  "use cache";
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, data: null };
    }

    const request = await db.query.employerRequestTable.findFirst({
      where: eq(employerRequestTable.userId, session.user.id),
      orderBy: [desc(employerRequestTable.createdAt)],
    });
    if (request?.id) {
      cacheTag(idTag("employer-requests", request.id));
    }

    return { success: true, data: request || null };
  } catch (error) {
    console.error("Error fetching user employer request:", error);
    return {
      success: false,
      message: "Failed to fetch employer request",
      data: null,
    };
  }
};

export const createEmployerRequest = async (
  data: EmployerRequestFormType,
): Promise<{ success: boolean; message?: string }> => {
  try {
    // Validate input
    const validated = employerRequestSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

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

    await db.insert(employerRequestTable).values({
      id: nanoid(),
      userId: user.id,
      status: "pending",
      requestMessage: validated.requestMessage,
    });

    updateTag("employer-requests");
    updateTag("admin-stats");

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
    const validated = approveRequestSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    // Only admins can approve requests
    if (session.user.role !== "admin") {
      return { success: false, message: "Only admins can approve requests" };
    }

    // Get the request
    const request = await db.query.employerRequestTable.findFirst({
      where: eq(employerRequestTable.id, validated.requestId),
      with: {
        user: true,
      },
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

    updateTag("users");
    updateTag("employer-requests");
    updateTag("admin-stats");

    return { success: true, message: "Employer request approved successfully" };
  } catch (error) {
    console.error("Error approving employer request:", error);
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
    // Validate input
    const validated = rejectRequestSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    // Only admins can reject requests
    if (session.user.role !== "admin") {
      return { success: false, message: "Only admins can reject requests" };
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

    updateTag("admin-stats");
    updateTag("employer-requests");

    return { success: true, message: "Employer request rejected successfully" };
  } catch (error) {
    console.error("Error rejecting employer request:", error);
    return {
      success: false,
      message: "Failed to reject employer request",
    };
  }
};
