"use server";

import z from "zod";
import { jobListingSchema } from "./schemas";
import { getCurrentOrg } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/appConfig";
import { insertJobListing } from "../db/jobListings";

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

  const jobListing = await insertJobListing({
    ...data,
    organizationId: orgId,
    status: "draft",
  });

  redirect(`${APP_ROUTES.EMPLOYER_JOB_LISTING}/${jobListing.id}`);
};
