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
    wage: z.number().nullable(),
    wageInterval: z.enum(wageIntervals).nullable(),
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
  );

// Ai
// export const jobListingAiSearchSchema = z.object({
//   query: z.string().min(1, "Required"),
// });
