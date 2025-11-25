"use server";

import z from "zod";
import { newJobListingApplicationSchema } from "./schema";
import {
  getCurrentOrg,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import {
  insertJobListingApplicationDb,
  updateJobListingApplicationDb,
} from "../db/jobListingApplication";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import {
  applicationStatus,
  ApplicationStatusType,
  jobListingsTable,
  userResumesTable,
} from "@/drizzle/schema";
import { unstable_cache } from "next/cache";
import { jobListingIdTag, userResumeTag } from "@/lib/dataCache";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermission";

// Create
export const createJobListingApplication = async (
  jobListingId: string,
  unsafeData: z.infer<typeof newJobListingApplicationSchema>
) => {
  const permissionError = {
    error: true,
    message: "You don't have permission to submit an application",
  };

  const { orgId } = await getCurrentOrg();
  if (orgId == null) return permissionError;

  const { userId } = await getCurrentUser();
  if (userId == null) return permissionError;

  const userResumeCached = unstable_cache(
    async (userId: string) => getUserResume(userId),
    [userResumeTag("userResumes", userId)],
    {
      tags: [userResumeTag("userResumes", userId)],
    }
  );

  const jobListingCached = unstable_cache(
    async (jobListingId: string) => getJobListingById(jobListingId),
    [jobListingIdTag(orgId, "jobListings", jobListingId)],
    {
      tags: [jobListingIdTag(orgId, "jobListings", jobListingId)],
    }
  );

  const userResume = await userResumeCached(userId);
  const jobListing = await jobListingCached(jobListingId);
  if (userResume == null || jobListing == null) return permissionError;

  const { success, data } =
    newJobListingApplicationSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There was an error submitting your application",
    };

  await insertJobListingApplicationDb({
    jobListingId,
    userId,
    ...data,
  });

  return {
    error: false,
    message: "Your application was successfully submitted",
  };
};

const getUserResume = async (userId: string) => {
  return await db.query.userResumesTable.findFirst({
    where: eq(userResumesTable.userId, userId),
    columns: { userId: true },
  });
};

const getJobListingById = async (id: string) => {
  return await db.query.jobListingsTable.findFirst({
    where: and(
      eq(jobListingsTable.id, id),
      eq(jobListingsTable.status, "published")
    ),
    columns: { id: true },
  });
};

export const updateJobListingApplicationStatus = async (
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string;
    userId: string;
  },
  unsafeStatus: ApplicationStatusType
) => {
  const { success, data: status } = z
    .enum(applicationStatus)
    .safeParse(unsafeStatus);
  if (!success)
    return {
      error: true,
      message: "Invalid status",
    };

  if (!(await hasOrgUserPermission("job_listing_application:change_status")))
    return {
      error: true,
      message: "You don't have permission to update the status",
    };

  const { orgId } = await getCurrentOrg();
  const jobListing = await getJobListing(jobListingId);
  if (orgId == null || jobListing == null || orgId != jobListing.organizationId)
    return {
      error: true,
      message: "You don't have permission to update the status",
    };

  await updateJobListingApplicationDb({ jobListingId, userId }, { status });
};

const getJobListing = async (id: string) => {
  return db.query.jobListingsTable.findFirst({
    where: eq(jobListingsTable.id, id),
    columns: { organizationId: true },
  });
};
