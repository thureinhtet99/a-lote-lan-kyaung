"use server";

import { db } from "@/lib/db";
import { userTable } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function getAllUsers() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized", data: [] };
    }

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
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users", data: [] };
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

    return { success: true };
  } catch (error) {
    console.error("Error unbanning user:", error);
    return { success: false, error: "Failed to unban user" };
  }
}
