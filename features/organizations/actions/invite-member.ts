"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { invitationTable, userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "employer", "user"]),
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
        error: "You don't have permission to invite members",
      };
    }

    // Get current session to get organization ID
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        error: "No active organization found",
      };
    }

    // Check if user is registered
    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.email, validated.email),
    });

    if (!existingUser) {
      return {
        success: false,
        error: `User with email ${validated.email} is not registered yet. Please ask them to create an account first.`,
        userNotRegistered: true,
      };
    }

    // Create invitation in database
    const { nanoid } = await import("nanoid");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    await db.insert(invitationTable).values({
      id: nanoid(),
      email: validated.email,
      organizationId: session.session.activeOrganizationId,
      inviterId: session.user.id,
      role: validated.role,
      status: "pending",
      expiresAt,
    });

    // TODO: Send email notification here
    // In production, you'd use a service like Resend, SendGrid, etc.

    return {
      success: true,
      message: `Invitation sent to ${validated.email}`,
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
      error: error instanceof Error ? error.message : "Failed to invite member",
    };
  }
}
