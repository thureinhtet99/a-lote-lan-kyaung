import { auth } from "@/lib/auth";
import { db } from "@/drizzle/db";
import { organization, member } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orgId = params.id;

    // Check if user is an admin of the organization
    const membership = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, orgId),
        eq(member.role, "admin"),
      ),
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only organization admins can delete the organization" },
        { status: 403 },
      );
    }

    // Delete the organization (cascade will delete members)
    await db.delete(organization).where(eq(organization.id, orgId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 },
    );
  }
}
