"use server";

import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidateJobListingCache } from "./cache/jobListings";

// Create
export async function insertJobListingDb(
  job: typeof jobListingsTable.$inferInsert
) {
  const [result] = await db.insert(jobListingsTable).values(job).returning({
    id: jobListingsTable.id,
    organizationId: jobListingsTable.organizationId,
  });
  revalidateJobListingCache({
    jobListingId: result.id,
    organizationId: result.organizationId,
  });

  return result;
}

// Update
export async function updateJobListingDb(
  id: string,
  job: Partial<typeof jobListingsTable.$inferInsert>
) {
  const [result] = await db
    .update(jobListingsTable)
    .set(job)
    .where(eq(jobListingsTable.id, id))
    .returning({
      id: jobListingsTable.id,
      organizationId: jobListingsTable.organizationId,
    });

  revalidateJobListingCache({
    jobListingId: result.id,
    organizationId: result.organizationId,
  });

  return result;
}

// Get most recent job listings
export const getMostRecentJobListingDb = async (orgId: string) => {
  const [result] = await db
    .select({ id: jobListingsTable.id })
    .from(jobListingsTable)
    .where(eq(jobListingsTable.organizationId, orgId))
    .orderBy(jobListingsTable.createdAt);

  return result;
};

// Get by id
export const getJobListingByIdDb = async (jobListingId: string) => {
  const [result] = await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.id, jobListingId));

  return result;
};

// Delete
export async function deleteJobListingDb(id: string) {
  const [result] = await db
    .delete(jobListingsTable)
    .where(eq(jobListingsTable.id, id))
    .returning({
      id: jobListingsTable.id,
      organizationId: jobListingsTable.organizationId,
    });

  revalidateJobListingCache({
    jobListingId: result.id,
    organizationId: result.organizationId,
  });

  return result;
}
