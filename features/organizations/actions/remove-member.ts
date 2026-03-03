"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function removeMember(memberId: string) {
  try {
    if (!memberId) {
      return {
        success: false,
        message: "Member ID is required",
      };
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        message: "No active organization found",
      };
    }

    // Get member details to find their email
    const membersResult = await auth.api.listMembers({
      headers: await headers(),
      query: {
        organizationId: session.session.activeOrganizationId,
      },
    });

    const member = membersResult?.members?.find((m) => m.id === memberId);

    if (!member) {
      return {
        success: false,
        message: "Member not found",
      };
    }

    // Prevent removing yourself
    if (member.userId === session.user.id) {
      return {
        success: false,
        message: "You cannot remove yourself from the organization",
      };
    }

    // Use better-auth's removeMember API route
    const removeResult = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/organization/remove-member`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await headers()),
        },
        body: JSON.stringify({
          memberIdOrEmail: member.user.email,
          organizationId: session.session.activeOrganizationId,
        }),
      },
    );

    const result = await removeResult.json();

    if (!removeResult.ok || result.error) {
      return {
        success: false,
        message: result.error?.message || "Failed to remove member",
      };
    }

    return {
      success: true,
      message: "Member removed successfully",
    };
  } catch (error) {
    console.error("Error removing member:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}
