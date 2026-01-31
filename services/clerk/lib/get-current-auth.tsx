import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { organizationsTable, usersTable } from "@/drizzle/schema";
import { unstable_cache } from "next/cache";
import { idTag } from "@/lib/dataCache";

// Get current user from Clerk
export async function getCurrentUser({ allData = false } = {}) {
  const { userId } = await auth();

  return {
    userId,
    user: allData && userId != null ? await getUserById(userId) : undefined,
  };
}

// Fetch a user from db (cached)
const getUserById = async (id: string) => {
  const cachedData = unstable_cache(
    async () => {
      return await db.query.usersTable.findFirst({
        where: eq(usersTable.id, id),
      });
    },
    [idTag("users", id)],
    { tags: [idTag("users", id)] },
  );
  return await cachedData();
};

// Get current organization form Clerk
export async function getCurrentOrg({ allData = false } = {}) {
  const { orgId } = await auth();

  return {
    orgId,
    organization:
      allData && orgId != null ? await getOrgById(orgId) : undefined,
  };
}

// Fetch an org from db (cached)
const getOrgById = async (id: string) => {
  const cachedData = unstable_cache(
    async () => {
      return await db.query.organizationsTable.findFirst({
        where: eq(organizationsTable.id, id),
      });
    },
    [idTag("organizations", id)],
    { tags: [idTag("organizations", id)] },
  );
  return await cachedData();
};
