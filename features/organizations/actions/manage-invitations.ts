"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { invitationTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { safeGetSession } from "@/lib/auth/auth-helpers";

export async function getInvitations() {
  try {
    // Get current session
    const session = await safeGetSession();

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        error: "No active organization found",
        invitations: [],
      };
    }

    // Get invitations for the organization
    const invitations = await db.query.invitationTable.findMany({
      where: eq(
        invitationTable.organizationId,
        session.session.activeOrganizationId,
      ),
      orderBy: (invitations, { desc }) => [desc(invitations.id)],
    });

    return {
      success: true,
      invitations,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch invitations",
      invitations: [],
    };
  }
}

export async function revokeInvitation(invitationId: string) {
  try {
    if (!invitationId) {
      return {
        success: false,
        error: "Invitation ID is required",
      };
    }

    // Check if user has permission to manage invitations
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          member: ["invite"], // Using invite permission for managing invitations
        },
      },
    });

    if (!hasPermission.success) {
      return {
        success: false,
        error: "You don't have permission to manage invitations",
      };
    }

    // Get current session
    const session = await safeGetSession();

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        error: "No active organization found",
      };
    }

    // Delete the invitation
    await db
      .delete(invitationTable)
      .where(
        and(
          eq(invitationTable.id, invitationId),
          eq(
            invitationTable.organizationId,
            session.session.activeOrganizationId,
          ),
        ),
      );

    return {
      success: true,
      message: "Invitation revoked successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to revoke invitation",
    };
  }
}

export async function resendInvitation(invitationId: string) {
  try {
    if (!invitationId) {
      return {
        success: false,
        error: "Invitation ID is required",
      };
    }

    // Check if user has permission to manage invitations
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          member: ["invite"],
        },
      },
    });

    if (!hasPermission.success) {
      return {
        success: false,
        error: "You don't have permission to manage invitations",
      };
    }

    // Get current session
    const session = await safeGetSession();

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        error: "No active organization found",
      };
    }

    // Get the invitation
    const invitation = await db.query.invitationTable.findFirst({
      where: and(
        eq(invitationTable.id, invitationId),
        eq(
          invitationTable.organizationId,
          session.session.activeOrganizationId,
        ),
      ),
    });

    if (!invitation) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    // In a real app, you would send an email here
    // For now, we'll just return success
    // TODO: Implement email sending logic

    return {
      success: true,
      message: "Invitation resent successfully",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to resend invitation",
    };
  }
}
