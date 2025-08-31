"use server";

import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { revalidateJobListingCache } from "./cache/jobListings";

// Create
export async function insertJobListingToDb(
  job: typeof jobListingsTable.$inferInsert
) {
  const [result] = await db.insert(jobListingsTable).values(job).returning({
    id: jobListingsTable.id,
    organizationId: jobListingsTable.organizationId,
  });

  revalidateJobListingCache(result);

  return result;
}

// Update
export async function updateJobListingToDb(
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
  revalidateJobListingCache(result);

  return result;
}

// Get by id
export async function getJobListingByIdFromDb(id: string, orgId: string) {
  const [result] = await db
    .select()
    .from(jobListingsTable)
    .where(
      and(
        eq(jobListingsTable.id, id),
        eq(jobListingsTable.organizationId, orgId)
      )
    );
  revalidateJobListingCache(result);
  return result;
}

// Delete
// export async function deleteJobListing(id: string) {
//   await db.delete(jobListingsTable).where(eq(jobListingsTable.id, id));
//   revalidateJobListingCache(job.id);
// }
