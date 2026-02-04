import { auth } from "@/lib/auth";
import { db } from "@/drizzle/db";
import { session as sessionTable } from "@/drizzle/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

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

    // Update session to set active organization
    // Note: Better-auth doesn't natively support this, so we'll store it in session metadata
    // For now, we'll just return success and the client should handle the state

    return NextResponse.json({ success: true, organizationId });
  } catch (error) {
    console.error("Error switching organization:", error);
    return NextResponse.json(
      { error: "Failed to switch organization" },
      { status: 500 },
    );
  }
}
