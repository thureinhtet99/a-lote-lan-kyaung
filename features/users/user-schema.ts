import z from "zod";

export const userNotificationSettingsSchema = z.object({
  newJobEmailNotification: z.boolean(),
  // aiPrompt: z
  //   .string()
  //   .transform((val) => (val.trim() === "" ? null : val))
  //   .nullable(),
});
