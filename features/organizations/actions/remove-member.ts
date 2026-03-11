"use server";

import { APP_ROUTES } from "@/constants/app-config";
import { auth } from "@/lib/auth/auth";
import { revalidatePath } from "next/cache";
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
    const currentMember = membersResult?.members?.find(
      (m) => m.userId === session.user.id,
    );

    if (currentMember?.role !== "org-admin") {
      return {
        success: false,
        message: "Only organization admins can remove members",
      };
    }

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

    const result = await auth.api.removeMember({
      headers: await headers(),
      body: {
        memberIdOrEmail: member.user.email,
        organizationId: session.session.activeOrganizationId,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Failed to remove member",
      };
    }

    revalidatePath(APP_ROUTES.EMPLOYER.SETTINGS.MEMBERS);
    revalidatePath("/employer/my-organization/members");

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
