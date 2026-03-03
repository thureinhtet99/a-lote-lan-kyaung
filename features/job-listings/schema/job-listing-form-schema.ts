import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/drizzle/schema";
import { z } from "zod";

export const jobListingFormSchema = z
  .object({
    title: z.string().min(1, "Required"),
    description: z.string().nullable(),
    experienceLevel: z.enum(experienceLevels),
    locationRequirement: z.enum(locationRequirements),
    type: z.enum(jobListingTypes),
    wage: z
      .number()
      .int({ message: "Wage must be a whole number" })
      .positive({ message: "Wage must be greater than zero" })
      .min(1, { message: "Wage must be at least 1" }),
    wageInterval: z.enum(wageIntervals),
    state: z.string().nullable(),
    city: z.string().nullable(),
  })
  .refine(
    (listing) => {
      return listing.locationRequirement === "remote" || listing.city != null;
    },
    {
      message: "Required for non-remote listings",
      path: ["city"],
    },
  )
  .refine(
    (listing) => {
      return listing.locationRequirement === "remote" || listing.state != null;
    },
    {
      message: "Required for non-remote listings",
      path: ["state"],
    },
  );

// Ai
// export const jobListingAiSearchSchema = z.object({
//   query: z.string().min(1, "Required"),
// });
