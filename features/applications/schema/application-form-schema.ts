import z from "zod";

export const applicationFormSchema = z.object({
  resumeFileUrl: z.url("Please upload a valid resume file"),
  resumeFileKey: z.string().optional(),
  resumeFileName: z.string().optional(),
  saveToProfile: z.boolean().optional(),
  coverLetter: z
    .string()
    .transform((val) => (val.trim() === "" ? null : val))
    .nullable(),
});
