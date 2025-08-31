"use server";

import z from "zod";
import { jobListingSchema } from "./schemas";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/appConfig";
import {
  getJobListingByIdFromDb,
  insertJobListingToDb,
  updateJobListingToDb,
} from "../db/jobListings";

// Create
export const createJobListing = async (
  unsafeData: z.infer<typeof jobListingSchema>
) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null)
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There was an error creating your job listing",
    };

  const jobListing = await insertJobListingToDb({
    ...data,
    organizationId: orgId,
    status: "draft",
  });

  redirect(`${APP_ROUTES.EMPLOYER_JOB_LISTING}/${jobListing.id}`);
};

// Update
export const updateJobListing = async (
  jobListingId: string,
  unsafeData: z.infer<typeof jobListingSchema>
) => {
  const { orgId } = await getCurrentOrg();
  if (orgId == null)
    return {
      error: true,
      message: "You don't have permission to update a job listing",
    };

  const { success, data } = jobListingSchema.safeParse(unsafeData);
  if (!success)
    return {
      error: true,
      message: "There was an error updating your job listing data",
    };

  const jobListing = await getJobListingByIdFromDb(jobListingId, orgId);
  if (jobListing == null) {
    return {
      error: true,
      message: "There was an error getting your job listing",
    };
  }
  const updatedJobListing = await updateJobListingToDb(jobListingId, data);

  redirect(`${APP_ROUTES.EMPLOYER_JOB_LISTING}/${updatedJobListing.id}`);
};
