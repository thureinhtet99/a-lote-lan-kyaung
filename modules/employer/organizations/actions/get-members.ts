"use server";

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { memberTable, userTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getOrganizationMembers() {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId) {
      return {
        success: false,
        error: "No active organization found",
        members: [],
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
      members,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch members",
      members: [],
    };
  }
}
