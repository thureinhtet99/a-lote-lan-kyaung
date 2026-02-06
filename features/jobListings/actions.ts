"use server";

import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "@/features/jobListings/lib/plan-feature-helpers";
import { nextJobListingStatus } from "@/features/jobListings/lib/utils";
import z from "zod";
import { jobListingSchema } from "./schemas";
import { getCurrentOrg } from "@/lib/auth-helpers";
import {
  deleteJobListingDb,
  insertJobListingDb,
  updateJobListingDb,
} from "./db/job-listing-db";
import { hasOrgUserPermission } from "@/lib/permission";
import { jobListingTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";

// Create
export const createJobListing = async (
  unsafeData: z.infer<typeof jobListingSchema>,
) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null || !(await hasOrgUserPermission("job_listing.create")))
    return {
      error: true,
      message: "You don't have permission to create this job listing",
    };

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There was an error creating your job listing",
    };

  const jobListing = await insertJobListingDb({
    ...data,
    organizationId: orgId,
    status: "draft",
  });

  return {
    error: false,
    message: "Job listing created successfully",
    data: { id: jobListing.id },
  };
};

// Update
export const updateJobListing = async (
  jobListingId: string,
  unsafeData: z.infer<typeof jobListingSchema>,
) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null || !(await hasOrgUserPermission("job_listing.update")))
    return {
      error: true,
      message: "You don't have permission to update this job listing",
    };

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There was an error updating your job listing data",
    };

  const jobListing = await getJobListingByOrgIdDb(jobListingId, orgId);
  if (jobListing == null) {
    return {
      error: true,
      message: "There was an error getting your job listing",
    };
  }

  const updatedJobListing = await updateJobListingDb(jobListingId, data);

  return {
    error: false,
    message: "Job listing updated successfully",
    data: { id: updatedJobListing.id },
  };
};

// Get by org id
const getJobListingByOrgIdDb = async (id: string, orgId: string) => {
  return await db.query.jobListingTable.findFirst({
    where: and(
      eq(jobListingTable.id, id),
      eq(jobListingTable.organizationId, orgId),
    ),
  });
};

// Toggle status
export const toggleJobListingStatus = async (id: string) => {
  const output = {
    error: true,
    message: "You don't have permission to update this job listing's status",
  };

  const { orgId } = await getCurrentOrg();
  if (orgId == null) return output;

  const jobListing = await getJobListingByOrgIdDb(id, orgId);
  if (jobListing == null) return output;

  const newStatus = nextJobListingStatus(jobListing.status);
  if (
    !(await hasOrgUserPermission("job_listing.update")) ||
    (newStatus === "published" && (await hasReachedMaxPublishedJobListings()))
  ) {
    return output;
  }

  await updateJobListingDb(id, {
    status: newStatus,
    isFeatured: newStatus === "published" ? undefined : false,
    posted_at:
      newStatus === "published" && jobListing.posted_at == null
        ? new Date()
        : undefined,
  });

  const statusMessage =
    newStatus === "published"
      ? "Published successfully"
      : "Delisted successfully";

  return { error: false, message: statusMessage };
};

// Toggle featured status
export const toggleJobListingFeaturedStatus = async (id: string) => {
  const output = {
    error: true,
    message:
      "You don't have permission to update this job listing's featured status",
  };

  const { orgId } = await getCurrentOrg();
  if (orgId == null) return output;

  const jobListing = await getJobListingByOrgIdDb(id, orgId);
  if (jobListing == null) return output;

  const newFeaturedStatus = !jobListing.isFeatured;
  if (
    !(await hasOrgUserPermission("job_listing.update")) ||
    (newFeaturedStatus && (await hasReachedMaxFeaturedJobListings()))
  ) {
    return output;
  }

  await updateJobListingDb(id, {
    isFeatured: newFeaturedStatus,
  });

  const featuredMessage = newFeaturedStatus
    ? "Featured successfully"
    : "Unfeatured successfully";

  return { error: false, message: featuredMessage };
};

// Delete
export const deleteJobListing = async (id: string) => {
  const output = {
    error: true,
    message: "You don't have permission to delete this job listing",
  };

  const { orgId } = await getCurrentOrg();
  if (orgId == null) return output;

  const jobListing = await getJobListingByOrgIdDb(id, orgId);
  if (jobListing == null) return output;

  if (!(await hasOrgUserPermission("job_listing.delete"))) return output;

  await deleteJobListingDb(id);

  return { error: false, message: "Delete successfully", deleted: true };
};
