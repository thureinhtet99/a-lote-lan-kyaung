"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { memberTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const updateRoleSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  newRole: z.enum(["admin", "member"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateRoleSchema>;

export async function updateMemberRole(data: UpdateMemberRoleInput) {
  try {
    // Validate input
    const validated = updateRoleSchema.parse(data);

    // Check if user has permission to update member roles
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          member: ["update_role"],
        },
      },
    });

    if (!hasPermission.success) {
      return {
        success: false,
        error: "You don't have permission to update member roles",
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

    // Get current user's role
    const currentMember = await auth.api.getActiveMember({
      headers: await headers(),
    });

    if (!currentMember) {
      return {
        success: false,
        error: "You are not a member of this organization",
      };
    }

    // Only owners can change roles
    if (currentMember.role !== "owner") {
      return {
        success: false,
        error: "Only organization owners can change member roles",
      };
    }

    // Get the member to update
    const member = await db.query.memberTable.findFirst({
      where: and(
        eq(memberTable.id, validated.memberId),
        eq(memberTable.organizationId, session.session.activeOrganizationId),
      ),
    });

    if (!member) {
      return {
        success: false,
        error: "Member not found",
      };
    }

    // Prevent changing owner role
    if (member.role === "owner") {
      return {
        success: false,
        error: "Cannot change the role of the organization owner",
      };
    }

    // Prevent changing your own role
    if (member.userId === session.user.id) {
      return {
        success: false,
        error: "You cannot change your own role",
      };
    }

    // Update the member's role
    await db
      .update(memberTable)
      .set({ role: validated.newRole })
      .where(
        and(
          eq(memberTable.id, validated.memberId),
          eq(memberTable.organizationId, session.session.activeOrganizationId),
        ),
      );

    return {
      success: true,
      message: `Member role updated to ${validated.newRole}`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}
