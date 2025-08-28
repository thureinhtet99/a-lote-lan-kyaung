import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { organizationsTable, usersTable } from "@/drizzle/schema";
import { unstable_cache } from "next/cache";

// Fetch a user from ORM and make cache
const getUserById = async (id: string) => {
  const fetchUserById = unstable_cache(
    async () => {
      return await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .then((res) => res[0]);
    },
    [`users-${id}`],
    {
      revalidate: 3600, // Cache for 1 hour
    }
  );

  return fetchUserById();
};

// Fetch an org from ORM and make cache
const getOrgById = async (id: string) => {
  const fetchOrgById = unstable_cache(
    async () => {
      return await db
        .select()
        .from(organizationsTable)
        .where(eq(organizationsTable.id, id))
        .then((res) => res[0]);
    },

    [`organizations-${id}`],
    {
      revalidate: 3600, // Cache for 1 hour
    }
  );

  return fetchOrgById();
};

// Get current user from clerk
export async function getCurrentUser({ allData = false } = {}) {
  const { userId } = await auth();

  return {
    userId,
    user: allData && userId != null ? await getUserById(userId) : undefined,
  };
}

export async function getCurrentOrg({ allData = false } = {}) {
  const { orgId } = await auth();

  return {
    orgId,
    organization:
      allData && orgId != null ? await getOrgById(orgId) : undefined,
  };
}
