import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
} from "@/drizzle/schema";
import z from "zod";

const ANY_VALUE = "any";

export const jobBoardFormSchema = z.object({
  title: z.string().optional(),
  city: z.string().or(z.literal(ANY_VALUE)).optional(),
  locationRequirement: z
    .enum(locationRequirements)
    .or(z.literal(ANY_VALUE))
    .optional(),
  type: z.enum(jobListingTypes).or(z.literal(ANY_VALUE)).optional(),
  experienceLevel: z.enum(experienceLevels).or(z.literal(ANY_VALUE)).optional(),
});
