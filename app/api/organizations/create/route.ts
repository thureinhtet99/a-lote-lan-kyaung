import { auth } from "@/lib/auth";
import { db } from "@/drizzle/db";
import { organizationTable, memberTable } from "@/drizzle/schema";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Generate a unique ID without using crypto module
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

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

    // Create organization
    const newOrg = await db
      .insert(organizationTable)
      .values({
        id: generateId(),
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        logo: null,
        createdAt: new Date(),
        metadata: null,
      })
      .returning();

    // Add creator as admin member
    await db.insert(memberTable).values({
      id: generateId(),
      organizationId: newOrg[0].id,
      userId: session.user.id,
      role: "admin",
      createdAt: new Date(),
    });

    return NextResponse.json(newOrg[0], { status: 201 });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
