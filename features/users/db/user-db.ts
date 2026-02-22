"use server";

import { db } from "@/lib/db";
import { userTable } from "@/drizzle/schema";
import { count, eq } from "drizzle-orm";
import {
  revalidateAdminStatsCache,
  revalidateUserCache,
} from "./cache/user-cache";
import { tag } from "@/lib/utils/data-cache";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function getAllUsers(page = 1, pageSize = 10) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized", data: [] };
    }

    const [total] = await db.select({ count: count() }).from(userTable);

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
        banExpires: true,
        createdAt: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    const totalUsers = total?.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

    return {
      success: true,
      data: users,
      pagination: {
        page,
        pageSize,
        totalUsers,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error: "Failed to fetch users",
      data: [],
      pagination: {
        page,
        pageSize,
        totalUsers: 0,
        totalPages: 1,
      },
    };
  }
}

export async function updateUserRole(
  userId: string,
  role: "user" | "employer" | "admin",
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db.update(userTable).set({ role }).where(eq(userTable.id, userId));
    revalidateTag(tag("users"));
    revalidateUserCache(userId);
    revalidateAdminStatsCache();

    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function banUser(
  userId: string,
  reason: string,
  expiresAt?: Date,
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(userTable)
      .set({
        banned: true,
        banReason: reason,
        banExpires: expiresAt,
      })
      .where(eq(userTable.id, userId));
    revalidateTag(tag("users"));
    revalidateUserCache(userId);
    revalidateAdminStatsCache();

    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    return { success: false, error: "Failed to ban user" };
  }
}

export async function unbanUser(userId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(userTable)
      .set({
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .where(eq(userTable.id, userId));
    revalidateTag(tag("users"));
    revalidateUserCache(userId);
    revalidateAdminStatsCache();

    return { success: true };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { success: false, error: "Failed to unban user" };
  }
}

export async function updateUser(
  id: string,
  user: typeof userTable.$inferInsert,
) {
  await db.update(userTable).set(user).where(eq(userTable.id, id));
  revalidateUserCache(id);
  revalidateAdminStatsCache();
}

export async function deleteUser(id: string) {
  await db.delete(userTable).where(eq(userTable.id, id));
  revalidateTag(tag("users"));
  revalidateUserCache(id);
  revalidateAdminStatsCache();
}
