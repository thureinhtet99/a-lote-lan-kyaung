"use server";

import { db } from "@/lib/db";
import { employerRequestTable, userTable } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const approveRequestSchema = z.object({
  requestId: z.string(),
  adminResponse: z.string().optional(),
});

export type ApproveRequestFormType = z.infer<typeof approveRequestSchema>;

export async function approveEmployerRequest(
  data: ApproveRequestFormType,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Only admins can approve requests
    if (session.user.role !== "admin") {
      return { success: false, error: "Only admins can approve requests" };
    }

    // Get the request
    const request = await db.query.employerRequestTable.findFirst({
      where: eq(employerRequestTable.id, data.requestId),
      with: {
        user: true,
      },
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
        status: "approved",
        adminResponse: data.adminResponse,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      })
      .where(eq(employerRequestTable.id, data.requestId));

    // Update the user role to employer
    await db
      .update(userTable)
      .set({
        role: "employer",
      })
      .where(eq(userTable.id, request.userId));

    return { success: true };
  } catch (error) {
    console.error("Error approving employer request:", error);
    return {
      success: false,
      error: "Failed to approve employer request",
    };
  }
}
