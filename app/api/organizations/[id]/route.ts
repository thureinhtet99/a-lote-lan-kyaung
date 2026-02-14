import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { organizationTable, memberTable } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orgId } = await params;

    // Check if user is an admin of the organization
    const membership = await db.query.memberTable.findFirst({
      where: and(
        eq(memberTable.userId, session.user.id),
        eq(memberTable.organizationId, orgId),
        eq(memberTable.role, "admin"),
      ),
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only organization admins can delete the organization" },
        { status: 403 },
      );
    }

    // Delete the organization (cascade will delete members)
    await db.delete(organizationTable).where(eq(organizationTable.id, orgId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 },
    );
  }
}
