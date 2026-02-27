import { auth } from "@/lib/auth/auth";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await safeGetSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 },
      );
    }

    // Use better-auth's create organization method
    const result = await auth.api.createOrganization({
      body: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      },
      headers: await headers(),
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create organization" },
        { status: 500 },
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
