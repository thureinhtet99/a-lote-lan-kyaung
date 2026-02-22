"use server";

import { db } from "@/lib/db";
import { employerRequestTable } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import {
  rejectRequestSchema,
  type RejectRequestFormType,
} from "../validations";
import { updateTag } from "next/cache";

export async function rejectEmployerRequest(
  data: RejectRequestFormType,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validated = rejectRequestSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Only admins can reject requests
    if (session.user.role !== "admin") {
      return { success: false, error: "Only admins can reject requests" };
    }

    // Get the request
    const request = await db.query.employerRequestTable.findFirst({
      where: eq(employerRequestTable.id, validated.requestId),
    });

    if (!request) {
      return { success: false, error: "Request not found" };
    }

    if (request.status !== "pending") {
      return { success: false, error: "Request has already been reviewed" };
    }

    // Update the request
    await db
      .update(employerRequestTable)
      .set({
        status: "rejected",
        adminResponse: validated.adminResponse,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      })
      .where(eq(employerRequestTable.id, validated.requestId));

    updateTag("admin-stats");

    return { success: true };
  } catch (error) {
    console.error("Error rejecting employer request:", error);
    return {
      success: false,
      error: "Failed to reject employer request",
    };
  }
}
