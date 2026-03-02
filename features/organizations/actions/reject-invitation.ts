"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function rejectInvitation(invitationId: string) {
  try {
    if (!invitationId) {
      return {
        success: false,
        message: "Invitation ID is required",
      };
    }

    // Use better-auth's rejectInvitation API
    const result = await auth.api.rejectInvitation({
      headers: await headers(),
      body: {
        invitationId,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Failed to reject invitation",
      };
    }

    return {
      success: true,
      message: "Invitation rejected successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to reject invitation",
    };
  }
}
