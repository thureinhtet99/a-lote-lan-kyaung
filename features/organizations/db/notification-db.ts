"use server";

import { db } from "@/lib/db";
import { notificationTable, sessionTable } from "@/drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

// Create notification (internal function, not exported for direct use)
export const createNotification = async (
  userId: string,
  type: "organization_approved" | "organization_rejected" | "info",
  title: string,
  message: string,
  organizationId?: string,
) => {
  try {
    await db.insert(notificationTable).values({
      id: nanoid(),
      userId,
      type,
      title,
      message,
      organizationId: organizationId ?? null,
      isRead: false,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false };
  }
};

// Get all notifications for current user
export const getUserNotifications = async () => {
  try {
    const session = await safeGetSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized", data: [] };
    }

    const notifications = await db
      .select()
      .from(notificationTable)
      .where(eq(notificationTable.userId, session.user.id))
      .orderBy(desc(notificationTable.createdAt));

    return {
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      message: "Failed to fetch notifications",
      data: [],
    };
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async () => {
  try {
    const session = await safeGetSession();
    if (!session?.user) {
      return { success: false, count: 0 };
    }

    const result = await db
      .select()
      .from(notificationTable)
      .where(
        and(
          eq(notificationTable.userId, session.user.id),
          eq(notificationTable.isRead, false),
        ),
      );

    return { success: true, count: result.length };
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return { success: false, count: 0 };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const session = await safeGetSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    await db
      .update(notificationTable)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationTable.id, notificationId),
          eq(notificationTable.userId, session.user.id),
        ),
      );

    revalidatePath("/");
    return { success: true, message: "Notification marked as read" };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, message: "Failed to mark as read" };
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const session = await safeGetSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    await db
      .update(notificationTable)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationTable.userId, session.user.id),
          eq(notificationTable.isRead, false),
        ),
      );

    revalidatePath("/");
    return { success: true, message: "All notifications marked as read" };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, message: "Failed to mark all as read" };
  }
};

// Claim approved organization (set as active organization)
export const claimOrganization = async (
  notificationId: string,
  organizationId: string,
) => {
  try {
    const session = await safeGetSession();
    if (!session?.user || session.user.role !== "employer") {
      return { success: false, message: "Unauthorized" };
    }

    // Verify the notification belongs to the user and has the organization
    const notification = await db.query.notificationTable.findFirst({
      where: and(
        eq(notificationTable.id, notificationId),
        eq(notificationTable.userId, session.user.id),
        eq(notificationTable.organizationId, organizationId),
      ),
    });

    if (!notification) {
      return {
        success: false,
        message: "Invalid notification or organization",
      };
    }

    // Set active organization using better-auth
    const result = await auth.api.setActiveOrganization({
      body: {
        organizationId,
      },
      headers: await headers(),
    });

    if (!result) {
      return { success: false, message: "Failed to set active organization" };
    }

    // Mark notification as read
    await db
      .update(notificationTable)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notificationTable.id, notificationId));

    revalidatePath("/");
    return {
      success: true,
      message:
        "Organization claimed successfully! You can now access your employer dashboard.",
    };
  } catch (error) {
    console.error("Error claiming organization:", error);
    return { success: false, message: "Failed to claim organization" };
  }
};

// Delete notification (optional)
export const deleteNotification = async (notificationId: string) => {
  try {
    const session = await safeGetSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    await db
      .delete(notificationTable)
      .where(
        and(
          eq(notificationTable.id, notificationId),
          eq(notificationTable.userId, session.user.id),
        ),
      );

    revalidatePath("/");
    return { success: true, message: "Notification deleted" };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false, message: "Failed to delete notification" };
  }
};
