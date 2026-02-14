"use server";

import z from "zod";
import { newJobListingApplicationSchema } from "./schema";
import { getCurrentOrg, getCurrentUser } from "@/lib/auth";
import {
  insertJobListingApplicationDb,
  updateJobListingApplicationDb,
} from "../db/job-listing-application-db";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import {
  applicationStatus,
  ApplicationStatusType,
  jobListingTable,
  resumeTable,
} from "@/drizzle/schema";
import { unstable_cache } from "next/cache";
import { jobListingIdTag, userResumeTag } from "@/lib/utils/dataCache";
import { hasOrgUserPermission } from "@/lib/utils/permissions";

// Create
export const createJobListingApplication = async (
  jobListingId: string,
  unsafeData: z.infer<typeof newJobListingApplicationSchema>,
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
    },
  );

  const jobListingCached = unstable_cache(
    async (jobListingId: string) => getJobListingById(jobListingId),
    [jobListingIdTag(orgId, "jobListings", jobListingId)],
    {
      tags: [jobListingIdTag(orgId, "jobListings", jobListingId)],
    },
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
  return await db.query.resumeTable.findFirst({
    where: eq(resumeTable.userId, userId),
    columns: { userId: true },
  });
};

const getJobListingById = async (id: string) => {
  return await db.query.jobListingTable.findFirst({
    where: and(
      eq(jobListingTable.id, id),
      eq(jobListingTable.status, "published"),
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
  unsafeStatus: ApplicationStatusType,
) => {
  const { success, data: status } = z
    .enum(applicationStatus)
    .safeParse(unsafeStatus);
  if (!success)
    return {
      error: true,
      message: "Invalid status",
    };

  if (!(await hasOrgUserPermission("application.update")))
    return {
      error: true,
      message: "You don't have permission to update the status",
    };

  const { orgId } = await getCurrentOrg();
  const orgIdByJobListing = await getOrgIdByJobListing(jobListingId);
  if (
    orgId == null ||
    orgIdByJobListing == null ||
    orgId != orgIdByJobListing.organizationId
  )
    return {
      error: true,
      message: "You don't have permission to update the status",
    };

  await updateJobListingApplicationDb({ jobListingId, userId }, { status });
};

export const updateJobListingApplicationRating = async (
  {
    jobListingId,
    userId,
  }: {
    jobListingId: string;
    userId: string;
  },
  unsafeRating: number | null,
) => {
  const { success, data: rating } = z
    .number()
    .min(1)
    .max(5)
    .nullish()
    .safeParse(unsafeRating);
  if (!success)
    return {
      error: true,
      message: "Invalid rating",
    };

  if (!(await hasOrgUserPermission("application.update")))
    return {
      error: true,
      message: "You don't have permission to update the rating",
    };

  const { orgId } = await getCurrentOrg();
  const orgIdByJobListing = await getOrgIdByJobListing(jobListingId);
  if (
    orgId == null ||
    orgIdByJobListing == null ||
    orgId != orgIdByJobListing.organizationId
  )
    return {
      error: true,
      message: "You don't have permission to update the rating",
    };

  await updateJobListingApplicationDb({ jobListingId, userId }, { rating });
};

const getOrgIdByJobListing = async (id: string) => {
  return db.query.jobListingTable.findFirst({
    where: eq(jobListingTable.id, id),
    columns: { organizationId: true },
  });
};
