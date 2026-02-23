"use server";

import { db } from "@/lib/db";
import { employerRequestTable } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

export async function getUserEmployerRequest() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized", data: null };
    }

    const request = await db.query.employerRequestTable.findFirst({
      where: eq(employerRequestTable.userId, session.user.id),
      with: {
        reviewer: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(employerRequestTable.createdAt)],
    });

    return { success: true, data: request || null };
  } catch (error) {
    console.error("Error fetching user employer request:", error);
    return {
      success: false,
      error: "Failed to fetch employer request",
      data: null,
    };
  }
}
