"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { invitationTable, userTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { safeGetSession } from "@/lib/auth/auth-helpers";

/**
 * Get pending invitations for the current user
 */
export async function getMyPendingInvitations() {
  try {
    const session = await safeGetSession();

    if (!session?.user) {
      return {
        success: false,
        message: "Not authenticated",
        data: [],
      };
    }

    // Get invitations for the current user's email
    const invitations = await db
      .select({
        id: invitationTable.id,
        organizationId: invitationTable.organizationId,
        email: invitationTable.email,
        role: invitationTable.role,
        status: invitationTable.status,
        expiresAt: invitationTable.expiresAt,
        createdAt: invitationTable.createdAt,
        inviterName: userTable.name,
        inviterEmail: userTable.email,
      })
      .from(invitationTable)
      .innerJoin(userTable, eq(invitationTable.inviterId, userTable.id))
      .where(
        and(
          eq(invitationTable.email, session.user.email),
          eq(invitationTable.status, "pending"),
        ),
      )
      .orderBy(invitationTable.createdAt);

    return {
      success: true,
      data: invitations,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch invitations",
      data: [],
    };
  }
}

/**
 * Get all invitations for the active organization (for admins)
 */
export async function getOrganizationInvitations() {
  try {
    const session = await safeGetSession();

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        message: "No active organization found",
        data: [],
      };
    }

    // Check permission
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          invitation: ["create"],
        },
      },
    });

    if (!hasPermission.success) {
      return {
        success: false,
        message: "You don't have permission to view invitations",
        data: [],
      };
    }

    // Get invitations for the organization
    const invitations = await db.query.invitationTable.findMany({
      where: eq(
        invitationTable.organizationId,
        session.session.activeOrganizationId,
      ),
      orderBy: (invitations, { desc }) => [desc(invitations.createdAt)],
    });

    return {
      success: true,
      data: invitations,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch invitations",
      data: [],
    };
  }
}

/**
 * Cancel/revoke an invitation (for admins)
 */
export async function cancelInvitation(invitationId: string) {
  try {
    if (!invitationId) {
      return {
        success: false,
        message: "Invitation ID is required",
      };
    }

    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          invitation: ["cancel"],
        },
      },
    });

    if (!hasPermission.success) {
      return {
        success: false,
        message: "You don't have permission to cancel invitations",
      };
    }

    const session = await safeGetSession();

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        message: "No active organization found",
      };
    }

    // Use better-auth's cancelInvitation API
    const result = await auth.api.cancelInvitation({
      headers: await headers(),
      body: {
        invitationId,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Failed to cancel invitation",
      };
    }

    return {
      success: true,
      message: "Invitation cancelled successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to cancel invitation",
    };
  }
}
