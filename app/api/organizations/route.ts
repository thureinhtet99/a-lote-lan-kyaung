import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { memberTable, organizationTable } from "@/drizzle/schema";
import { safeGetSession } from "@/lib/auth/auth-helpers";

export async function GET() {
  try {
    const session = await safeGetSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all organizations where user is a member
    const userOrganizations = await db
      .select({
        id: organizationTable.id,
        name: organizationTable.name,
        slug: organizationTable.slug,
        logo: organizationTable.logo,
        createdAt: organizationTable.createdAt,
        metadata: organizationTable.metadata,
        role: memberTable.role, // Include the user's role in the organization
      })
      .from(organizationTable)
      .innerJoin(
        memberTable,
        eq(memberTable.organizationId, organizationTable.id),
      )
      .where(eq(memberTable.userId, session.user.id));

    return NextResponse.json(userOrganizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
}
