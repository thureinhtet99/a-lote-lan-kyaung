"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { memberTable, userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { safeGetSession } from "@/lib/auth/auth-helpers";

export async function getOrganizationMembers() {
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

    // Get all members with their user information
    const members = await db
      .select({
        id: memberTable.id,
        userId: memberTable.userId,
        organizationId: memberTable.organizationId,
        role: memberTable.role,
        createdAt: memberTable.createdAt,
        userName: userTable.name,
        userEmail: userTable.email,
        userImage: userTable.image,
      })
      .from(memberTable)
      .innerJoin(userTable, eq(memberTable.userId, userTable.id))
      .where(
        eq(memberTable.organizationId, session.session.activeOrganizationId),
      )
      .orderBy(memberTable.createdAt);

    return {
      success: true,
      data: members,
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
