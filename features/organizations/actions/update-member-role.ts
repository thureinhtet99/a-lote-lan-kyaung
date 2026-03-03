"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { z } from "zod";

const updateRoleSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  newRole: z.enum(["hr", "org-admin"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateRoleSchema>;

export async function updateMemberRole(data: UpdateMemberRoleInput) {
  try {
    // Validate input
    const validated = updateRoleSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        message: "No active organization found",
      };
    }

    // Get member details
    const membersResult = await auth.api.listMembers({
      headers: await headers(),
      query: {
        organizationId: session.session.activeOrganizationId,
      },
    });

    const member = membersResult?.members?.find(
      (m) => m.id === validated.memberId,
    );

    if (!member) {
      return {
        success: false,
        message: "Member not found",
      };
    }

    // Prevent changing your own role
    if (member.userId === session.user.id) {
      return {
        success: false,
        message: "You cannot change your own role",
      };
    }

    // Use better-auth's updateMemberRole API route
    const updateResult = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/organization/update-member-role`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await headers()),
        },
        body: JSON.stringify({
          memberId: validated.memberId,
          role: validated.newRole,
          organizationId: session.session.activeOrganizationId,
        }),
      },
    );

    const result = await updateResult.json();

    if (!updateResult.ok || result.error) {
      return {
        success: false,
        message: result.error?.message || "Failed to update member role",
      };
    }

    return {
      success: true,
      message: `Member role updated to ${validated.newRole === "org-admin" ? "Organization Admin" : "HR"}`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      };
    }

    console.error("Error updating member role:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}
