"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { memberTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export async function removeMember(memberId: string) {
  try {
    if (!memberId) {
      return {
        success: false,
        error: "Member ID is required",
      };
    }

    // Check if user has permission to remove members
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          member: ["remove"],
        },
      },
    });

    if (!hasPermission.success) {
      return {
        success: false,
        error: "You don't have permission to remove members",
      };
    }

    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        error: "No active organization found",
      };
    }

    // Get the member to check if they're an organization admin
    const member = await db.query.memberTable.findFirst({
      where: and(
        eq(memberTable.id, memberId),
        eq(memberTable.organizationId, session.session.activeOrganizationId),
      ),
    });

    if (!member) {
      return {
        success: false,
        error: "Member not found",
      };
    }

    // Prevent removing organization admin
    if (member.role === "admin") {
      return {
        success: false,
        error: "Cannot remove the organization admin",
      };
    }

    // Prevent removing yourself
    if (member.userId === session.user.id) {
      return {
        success: false,
        error: "You cannot remove yourself from the organization",
      };
    }

    // Remove the member
    await db
      .delete(memberTable)
      .where(
        and(
          eq(memberTable.id, memberId),
          eq(memberTable.organizationId, session.session.activeOrganizationId),
        ),
      );

    return {
      success: true,
      message: "Member removed successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}
