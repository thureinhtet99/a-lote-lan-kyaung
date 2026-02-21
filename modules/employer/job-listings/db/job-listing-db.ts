"use server";

import { db } from "@/lib/db";
import { jobListingTable } from "@/drizzle/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { revalidateJobListingCache } from "./cache/job-listing-cache";

// Create
export async function insertJobListingDb(
  job: typeof jobListingTable.$inferInsert,
) {
  const [result] = await db.insert(jobListingTable).values(job).returning({
    id: jobListingTable.id,
    organizationId: jobListingTable.organizationId,
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
  job: Partial<typeof jobListingTable.$inferInsert>,
) {
  const [result] = await db
    .update(jobListingTable)
    .set(job)
    .where(eq(jobListingTable.id, id))
    .returning({
      id: jobListingTable.id,
      organizationId: jobListingTable.organizationId,
    });

  revalidateJobListingCache({
    jobListingId: result.id,
    organizationId: result.organizationId,
  });

  return result;
}

// Get all job listings
export const getAllJobListingsDb = async (orgId: string) => {
  const result = await db.query.jobListingTable.findMany({
    where: eq(jobListingTable.organizationId, orgId),
  });

  return result;
};

// Get job listing by org id
export const getJobListingByIdByOrgIdDb = async (id: string, orgId: string) => {
  const result = await db.query.jobListingTable.findFirst({
    where: and(
      eq(jobListingTable.id, id),
      eq(jobListingTable.organizationId, orgId),
    ),
  });

  return result;
};

// Get most recent job listing
export const getMostRecentJobListingDb = async (orgId: string) => {
  const result = await db.query.jobListingTable.findFirst({
    where: eq(jobListingTable.organizationId, orgId),
    orderBy: desc(jobListingTable.created_at),
    columns: { id: true },
  });

  return result;
};

// Get by id
export const getJobListingByIdDb = async (jobListingId: string) => {
  const [result] = await db
    .select()
    .from(jobListingTable)
    .where(eq(jobListingTable.id, jobListingId));

  return result;
};

// Delete
export async function deleteJobListingDb(id: string) {
  const [result] = await db
    .delete(jobListingTable)
    .where(eq(jobListingTable.id, id))
    .returning({
      id: jobListingTable.id,
      organizationId: jobListingTable.organizationId,
    });

  revalidateJobListingCache({
    jobListingId: result.id,
    organizationId: result.organizationId,
  });

  return result;
}

// Get published job listings count
export const getPublishedJobListingCountDb = async (orgId: string) => {
  try {
    const [result] = await db
      .select({ count: count() })
      .from(jobListingTable)
      .where(
        and(
          eq(jobListingTable.organizationId, orgId),
          eq(jobListingTable.status, "published"),
        ),
      );
    return result?.count ?? 0;
  } catch (error) {
    console.error("Error getting published job listing count:", error);
    return 0;
  }
};
