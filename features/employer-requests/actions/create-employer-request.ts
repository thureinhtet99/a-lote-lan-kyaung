"use server";

import { db } from "@/lib/db";
import { employerRequestTable } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { eq, and, or } from "drizzle-orm";
import {
  employerRequestSchema,
  type EmployerRequestFormType,
} from "../validations";
import { updateTag } from "next/cache";

export async function createEmployerRequest(
  data: EmployerRequestFormType,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    const validated = employerRequestSchema.parse(data);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const user = session.user;

    // Check if user is already an employer or admin
    if (user.role === "employer" || user.role === "admin") {
      return {
        success: false,
        error: "You are already an employer or admin",
      };
    }

    // Check if user already has a pending or approved request
    const existingRequest = await db.query.employerRequestTable.findFirst({
      where: and(
        eq(employerRequestTable.userId, user.id),
        or(
          eq(employerRequestTable.status, "pending"),
          eq(employerRequestTable.status, "approved"),
        ),
      ),
    });

    if (existingRequest) {
      if (existingRequest.status === "approved") {
        return {
          success: false,
          error: "Your request has already been approved",
        };
      }
      return {
        success: false,
        error: "You already have a pending request",
      };
    }

    // Create new employer request
    await db.insert(employerRequestTable).values({
      id: nanoid(),
      userId: user.id,
      status: "pending",
      requestMessage: validated.requestMessage,
    });

    updateTag("admin-stats");

    return { success: true };
  } catch (error) {
    console.error("Error creating employer request:", error);
    return {
      success: false,
      error: "Failed to create employer request",
    };
  }
}
