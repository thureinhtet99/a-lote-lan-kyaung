import z from "zod";
import {
  experienceLevels,
  jobListingTable,
  jobListingTypes,
  locationRequirements,
  organizationTable,
} from "@/drizzle/schema";

export const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  state: z.string().optional().catch(undefined),
  experience_level: z.enum(experienceLevels).optional().catch(undefined),
  mode: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform((job) => (Array.isArray(job) ? job : [job]))
    .optional()
    .catch([]),
});
