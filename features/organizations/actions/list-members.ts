"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { safeGetSession } from "@/lib/auth/auth-helpers";

export async function listOrganizationMembers() {
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

    // Use better-auth's listMembers API
    const result = await auth.api.listMembers({
      headers: await headers(),
      query: {
        organizationId: session.session.activeOrganizationId,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Failed to fetch members",
        data: [],
      };
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch members",
      data: [],
    };
  }
}
