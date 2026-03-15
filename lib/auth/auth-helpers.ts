"use server";

import { getOrgById } from "@/features/organizations/db/organization-db";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

const isPrerenderHeadersError = (error: unknown) => {
  return (
    error instanceof Error &&
    error.message.includes("During prerendering, `headers()` rejects")
  );
};

const getRequestHeaders = async () => {
  try {
    return await headers();
  } catch (error) {
    if (isPrerenderHeadersError(error)) {
      return null;
    }

    throw error;
  }
};

export async function safeGetSession() {
  try {
    const requestHeaders = await getRequestHeaders();
    if (!requestHeaders) return null;

    return await auth.api.getSession({
      headers: requestHeaders,
    });
  } catch (error) {
    console.error("Auth session error: ", error);
    return null;
  }
}

// Get current session from better-auth session
export const getCurrentSession = async () => {
  const currentSession = await safeGetSession();
  if (!currentSession) return { sessionId: null, session: undefined };

  const sessionId = currentSession.session.id;
  const session = currentSession.session;

  return { sessionId, session };
};

// Get current user from better-auth session
export const getCurrentUser = async () => {
  const session = await safeGetSession();
  if (!session) return { userId: null, user: undefined };

  const userId = session.session.userId;
  const user = session.user;

  return { userId, user };
};

// Get current organization from better-auth session
export const getCurrentOrg = async () => {
  try {
    const session = await safeGetSession();
    if (!session) return { orgId: null, organization: undefined };

    const orgId = session.session.activeOrganizationId ?? null;
    if (!orgId) return { orgId: null, organization: undefined };

    const org = await getOrgById(orgId);
    const organization = org.data;

    return {
      orgId,
      organization,
    };
  } catch (error) {
    console.error("Get current organization error:", error);
    return { orgId: null, organization: undefined };
  }
};

// Check if the current user is an admin
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await safeGetSession();
    return session?.user?.role === "admin";
  } catch {
    return false;
  }
}

// Check if the current user is an employer
export async function isEmployer(): Promise<boolean> {
  try {
    const session = await safeGetSession();

    return session?.user?.role === "employer";
  } catch {
    return false;
  }
}

// Check if the current user is a regular user
export async function isUser(): Promise<boolean> {
  try {
    const session = await safeGetSession();

    return session?.user?.role === "user";
  } catch {
    return false;
  }
}

// Get the current user's role
export async function getUserRole(): Promise<
  "user" | "employer" | "admin" | null
> {
  try {
    const session = await safeGetSession();

    return (session?.user?.role as "user" | "employer" | "admin") || null;
  } catch {
    return null;
  }
}

// Check if the current user is banned
export async function isBanned(): Promise<boolean> {
  try {
    const session = await safeGetSession();

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
