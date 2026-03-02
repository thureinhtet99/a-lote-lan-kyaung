"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { safeGetSession } from "@/lib/auth/auth-helpers";

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["org-admin", "hr"]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export async function inviteMember(data: InviteMemberInput) {
  try {
    // Validate input
    const validated = inviteMemberSchema.parse(data);

    // Check if user has permission to invite members
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
        message: "You don't have permission to invite members",
      };
    }

    // Get current session to get organization ID
    const session = await safeGetSession();

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        message: "No active organization found",
      };
    }

    // Check if user is registered
    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.email, validated.email),
    });

    if (!existingUser) {
      return {
        success: false,
        message: `User with email ${validated.email} is not registered yet. Please ask them to create an account first.`,
        userNotRegistered: true,
      };
    }

    // Ensure the invitee has the employer role
    if (existingUser.role !== "employer" && existingUser.role !== "admin") {
      return {
        success: false,
        message: `${existingUser.name} (${validated.email}) does not have the employer role yet. They need to request employer access from an admin before they can be invited to an organization.`,
        requiresEmployerRole: true,
      };
    }

    // Use better-auth's organization API route directly
    const inviteResult = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/organization/invite-member`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await headers()),
        },
        body: JSON.stringify({
          email: validated.email,
          role: validated.role,
          organizationId: session.session.activeOrganizationId,
        }),
      },
    );

    const result = await inviteResult.json();

    if (!result) {
      return {
        success: false,
        message: "Failed to create invitation",
      };
    }

    return {
      success: true,
      message: `Invitation sent to ${validated.email}`,
      invitation: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      };
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to invite member",
    };
  }
}
