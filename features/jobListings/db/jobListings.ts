"use server";

import { db } from "@/drizzle/db";
import {
  jobListingApplicationsTable,
  jobListingsTable,
} from "@/drizzle/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { revalidateJobListingCache } from "./cache/jobListings";

// Create
export async function insertJobListingDb(
  job: typeof jobListingsTable.$inferInsert
) {
  const [result] = await db.insert(jobListingsTable).values(job).returning({
    id: jobListingsTable.id,
    organizationId: jobListingsTable.organizationId,
  });
  if (result) {
    revalidateJobListingCache({
      jobListingId: result.id,
      organizationId: result.organizationId,
    });
  }

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

  if (result) {
    revalidateJobListingCache({
      jobListingId: result.id,
      organizationId: result.organizationId,
    });
  }

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

// Get published job listings count
export const getPublishedJobListingCountDb = async (orgId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(jobListingsTable)
    .where(
      and(
        eq(jobListingsTable.organizationId, orgId),
        eq(jobListingsTable.status, "published")
      )
    );
  return result?.count ?? 0;
};

// Get featured job listings count
export const getFeaturedJobListingCountDb = async (orgId: string) => {
  const [result] = await db
    .select({ count: count() })
    .from(jobListingsTable)
    .where(
      and(
        eq(jobListingsTable.organizationId, orgId),
        eq(jobListingsTable.isFeatured, true)
      )
    );
  return result?.count ?? 0;
};

// Get by org id
export async function getJobListingByOrgIdDb(id: string, orgId: string) {
  return await db.query.jobListingsTable.findFirst({
    where: and(
      eq(jobListingsTable.id, id),
      eq(jobListingsTable.organizationId, orgId)
    ),
  });
}

// Get job listings
export async function getJobListingDb(orgId: string) {
  const result = await db
    .select({
      id: jobListingsTable.id,
      title: jobListingsTable.title,
      status: jobListingsTable.status,
      applications: count(jobListingApplicationsTable.userId),
    })
    .from(jobListingsTable)
    .where(eq(jobListingsTable.organizationId, orgId))
    .leftJoin(
      jobListingApplicationsTable,
      eq(jobListingsTable.id, jobListingApplicationsTable.jobListingId)
    )
    .groupBy(jobListingApplicationsTable.jobListingId, jobListingsTable.id)
    .orderBy(desc(jobListingsTable.createdAt));

  return result;
}

// Get applications
// export async function getJobListingApplications(params:type) {

// }

// Delete
export async function deleteJobListingDb(id: string) {
  const [result] = await db
    .delete(jobListingsTable)
    .where(eq(jobListingsTable.id, id))
    .returning({
      id: jobListingsTable.id,
      organizationId: jobListingsTable.organizationId,
    });

  if (result) {
    revalidateJobListingCache({
      jobListingId: result.id,
      organizationId: result.organizationId,
    });
  }

  return result;
}
