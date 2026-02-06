import { auth } from "@/lib/auth";
import { db } from "@/drizzle/db";
import { eq } from "drizzle-orm";
import { userTable, organizationTable } from "@/drizzle/schema";
import { headers } from "next/headers";
import { cache } from "react";

// Get current user from better-auth session
export const getCurrentUser = cache(async ({ allData = false } = {}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { userId: null, user: undefined };
  }

  return {
    userId: session.user.id,
    user: allData ? await getUserById(session.user.id) : undefined,
  };
});

// Fetch a user from db
const getUserById = async (id: string) => {
  return await db.query.userTable.findFirst({
    where: eq(userTable.id, id),
  });
};

// Get current organization from better-auth session
export const getCurrentOrg = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { orgId: null, organization: undefined };
  }

  // Get active organization from session
  const activeOrgId = session.session.activeOrganizationId as
    | string
    | undefined;

  if (!activeOrgId) {
    return { orgId: null, organization: undefined };
  }

  return {
    orgId: activeOrgId,
    organization: (await getOrgById(activeOrgId)) ?? undefined,
  };
};

// Fetch an org from db
const getOrgById = async (id: string) => {
  return await db.query.organizationTable.findFirst({
    where: eq(organizationTable.id, id),
  });
};

// Get session
export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
});
