import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authSession = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    // Use better-auth's built-in setActiveOrganization method
    const result = await auth.api.setActiveOrganization({
      body: {
        organizationId,
      },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to set active organization" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      organizationId,
      session: result,
    });
  } catch (error) {
    console.error("Error switching organization:", error);
    return NextResponse.json(
      { error: "Failed to switch organization" },
      { status: 500 },
    );
  }
}
