"use server";

import { invitationTable } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import { db } from "@/lib/db";
import { sendInvitationEmail } from "@/services/email/send-invitation";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getInvitations() {
  try {
    // Get current session
    const session = await safeGetSession();

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        message: "No active organization found",
        data: [],
      };
    }

    // Get invitations for the organization
    const invitations = await db.query.invitationTable.findMany({
      where: eq(
        invitationTable.organizationId,
        session.session.activeOrganizationId,
      ),
      with: {
        organization: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: (invitations, { desc }) => [desc(invitations.id)],
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

export async function revokeInvitation(invitationId: string) {
  try {
    if (!invitationId) {
      return {
        success: false,
        message: "Invitation ID is required",
      };
    }

    // Check if user has permission to manage invitations
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
        message: "You don't have permission to manage invitations",
      };
    }

    // Get current session
    const session = await safeGetSession();

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        message: "No active organization found",
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
      message:
        error instanceof Error ? error.message : "Failed to revoke invitation",
    };
  }
}

export async function resendInvitation(
  invitationId: string,
  invitedUserEmail?: string,
  organizationName?: string,
) {
  try {
    if (!invitationId) {
      return {
        success: false,
        message: "Invitation ID is required",
      };
    }

    // Check if user has permission to manage invitations
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
        message: "You don't have permission to manage invitations",
      };
    }

    // Get current session
    const session = await safeGetSession();

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        message: "No active organization found",
      };
    }

    // Get the invitation with organization info
    const invitation = await db.query.invitationTable.findFirst({
      where: and(
        eq(invitationTable.id, invitationId),
        eq(
          invitationTable.organizationId,
          session.session.activeOrganizationId,
        ),
      ),
      with: {
        organization: true,
      },
    });

    if (!invitation) {
      return {
        success: false,
        message: "Invitation not found",
      };
    }

    // Send the invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/accept-invitation?token=${invitation.id}`;

    const normalizedInvitedUserEmail = invitedUserEmail
      ? invitedUserEmail.trim().toLowerCase()
      : invitation.email;

    const normalizedOrganizationName = organizationName?.trim();

    await sendInvitationEmail({
      email: invitation.email,
      invitedByEmail: normalizedInvitedUserEmail,
      organizationName:
        normalizedOrganizationName ||
        invitation.organization?.name ||
        "Organization",
      role: invitation.role || "hr",
      inviteUrl,
    });

    return {
      success: true,
      message: "Invitation resent successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to resend invitation",
    };
  }
}
