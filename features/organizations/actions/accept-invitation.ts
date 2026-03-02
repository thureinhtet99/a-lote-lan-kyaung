"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function acceptInvitation(invitationId: string) {
  try {
    if (!invitationId) {
      return {
        success: false,
        message: "Invitation ID is required",
      };
    }

    // Use better-auth's acceptInvitation API
    const result = await auth.api.acceptInvitation({
      headers: await headers(),
      body: {
        invitationId,
      },
    });

    if (!result) {
      return {
        success: false,
        message: "Failed to accept invitation",
      };
    }

    return {
      success: true,
      message: "Invitation accepted successfully",
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to accept invitation",
    };
  }
}
