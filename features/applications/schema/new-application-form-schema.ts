import z from "zod";

export const newJobListingApplicationSchema = z.object({
  resumeFileUrl: z.string().url("Please upload a valid resume file"),
  resumeFileKey: z.string().optional(),
  saveToProfile: z.boolean().optional(),
  coverLetter: z
    .string()
    .transform((val) => (val.trim() === "" ? null : val))
    .nullable(),
});
