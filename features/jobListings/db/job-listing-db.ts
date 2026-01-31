"use server";

import { db } from "@/drizzle/db";
import { jobListingsTable } from "@/drizzle/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { revalidateJobListingCache } from "./cache/job-listing-cache";

// Create
export async function insertJobListingDb(
  job: typeof jobListingsTable.$inferInsert,
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
  job: Partial<typeof jobListingsTable.$inferInsert>,
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

// Get all job listings
export const getAllJobListingsDb = async (orgId: string) => {
  const result = await db.query.jobListingsTable.findMany({
    where: eq(jobListingsTable.organizationId, orgId),
  });

  return result;
};

// Get job listing by org id
export const getJobListingByIdByOrgIdDb = async (id: string, orgId: string) => {
  const result = await db.query.jobListingsTable.findFirst({
    where: and(
      eq(jobListingsTable.id, id),
      eq(jobListingsTable.organizationId, orgId),
    ),
  });

  return result;
};

// Get most recent job listing
export const getMostRecentJobListingDb = async (orgId: string) => {
  const result = await db.query.jobListingsTable.findFirst({
    where: eq(jobListingsTable.organizationId, orgId),
    orderBy: desc(jobListingsTable.createdAt),
    columns: { id: true },
  });

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

// Get published job listings count
export const getPublishedJobListingCountDb = async (orgId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(jobListingsTable)
    .where(
      and(
        eq(jobListingsTable.organizationId, orgId),
        eq(jobListingsTable.status, "published"),
      ),
    );
  return result?.count ?? 0;
};
