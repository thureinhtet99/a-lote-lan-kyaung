import { auth } from "@/lib/auth/auth";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await safeGetSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orgId } = await params;

    // Set the organization as active to check permissions
    await auth.api.setActiveOrganization({
      body: { organizationId: orgId },
      headers: await headers(),
    });

    // Check if user has permission to delete organization (only admin)
    const hasPermission = await auth.api.hasPermission({
      headers: await headers(),
      body: {
        permissions: {
          organization: ["delete"],
        },
      },
    });

    if (!hasPermission?.success) {
      return NextResponse.json(
        { error: "Only organization admins can delete the organization" },
        { status: 403 },
      );
    }

    // Use better-auth's delete organization method
    const result = await auth.api.deleteOrganization({
      body: { organizationId: orgId },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to delete organization" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 },
    );
  }
}
