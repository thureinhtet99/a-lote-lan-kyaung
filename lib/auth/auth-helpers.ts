"use server";

import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { organizationTable } from "@/drizzle/schema";
import { headers } from "next/headers";

// Session
const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

// Get current session from better-auth session
export const getCurrentSession = async ({ allData = false } = {}) => {
  const session = await getSession();

  if (!session) return { sessionId: null, session: undefined };

  return {
    sessionId: session.session.id,
    session: allData ? session : undefined,
  };
};

// Get current user from better-auth session
export const getCurrentUser = async ({ allData = false } = {}) => {
  const session = await getSession();

  if (!session) return { userId: null, user: undefined };

  return {
    userId: session.session.userId,
    user: allData ? session.user : undefined,
  };
};

// Get current organization from better-auth session
export const getCurrentOrg = async ({ allData = false } = {}) => {
  const session = await getSession();

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
