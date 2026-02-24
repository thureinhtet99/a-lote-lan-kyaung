"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { organizationTable } from "@/drizzle/schema";
import { headers } from "next/headers";

// Get current session from better-auth session
export const getCurrentSession = async ({ allData = false } = {}) => {
  const currentSession = await auth.api.getSession({
    headers: await headers(),
  });
  if (!currentSession) return { sessionId: null, session: undefined };

  const sessionId = currentSession.session.id;
  const session = currentSession.session;

  return { sessionId, session };
};

// Get current user from better-auth session
export const getCurrentUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return { userId: null, user: undefined };

  const userId = session.session.userId;
  const user = session.user;

  return { userId, user };
};

// Get current organization from better-auth session
export const getCurrentOrg = async ({ allData = false } = {}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { orgId: null, organization: undefined };

  const orgId = session.session.activeOrganizationId ?? null;
  if (!orgId) return { orgId: null, organization: undefined };

  const organization = allData ? await getOrgById(orgId) : undefined;

  return {
    orgId,
    organization,
  };
};

// Fetch an org from db
const getOrgById = async (id: string) => {
  return await db.query.organizationTable.findFirst({
    where: eq(organizationTable.id, id),
  });
};

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session?.user?.role === "admin";
  } catch {
    return false;
  }
}

/**
 * Check if the current user is an employer
 */
export async function isEmployer(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return (
      session?.user?.role === "employer" || session?.user?.role === "admin"
    );
  } catch {
    return false;
  }
}

/**
 * Check if the current user is a regular user
 */
export async function isUser(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user?.role === "user";
  } catch {
    return false;
  }
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<
  "user" | "employer" | "admin" | null
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return (session?.user?.role as "user" | "employer" | "admin") || null;
  } catch {
    return null;
  }
}

/**
 * Check if the current user is banned
 */
export async function isBanned(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return false;

    const banned = session.user.banned;
    const banExpires = session.user.banExpires;

    if (!banned) return false;

    // Check if ban has expired
    if (banExpires && new Date(banExpires) < new Date()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
