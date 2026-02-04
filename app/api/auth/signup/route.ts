import { auth } from "@/lib/auth";
import { db } from "@/drizzle/db";
import { user as userTable } from "@/drizzle/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

// Generate a unique ID without using crypto module
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Hash password using Web Crypto API (Edge-compatible)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, username } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(userTable.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    // Check if username is taken
    const existingUsername = await db.query.user.findFirst({
      where: eq(userTable.username, username),
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(userTable)
      .values({
        id: generateId(),
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        username,
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create account with password
    await db
      .insert(await import("@/drizzle/schema").then((m) => m.account))
      .values({
        id: generateId(),
        accountId: newUser[0].id,
        providerId: "credential",
        userId: newUser[0].id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

    return NextResponse.json(
      { success: true, userId: newUser[0].id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 },
    );
  }
}
