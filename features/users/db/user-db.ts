"use server";

import { db } from "@/lib/db";
import { userTable } from "@/drizzle/schema";
import { count, eq } from "drizzle-orm";
// import {
//   revalidateAdminStatsCache,
//   revalidateAllUsersCache,
//   revalidateUserCache,
// } from "./cache/user-cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { tag } from "@/lib/utils/data-cache";
import { UserRoleType } from "@/types/index.type";

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

export async function banUser(userId: string, reason: string) {
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
}

export async function unbanUser(userId: string) {
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
}

export async function updateUser(
  id: string,
  user: typeof userTable.$inferInsert,
) {
  await db.update(userTable).set(user).where(eq(userTable.id, id));
  updateTag(`users-${id}`);
  updateTag("admin-stats");
}

export async function deleteUser(id: string) {
  await db.delete(userTable).where(eq(userTable.id, id));
  updateTag("users");
  updateTag("admin-stats");
}
