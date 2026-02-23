import { z } from "zod";

export const employerRequestSchema = z.object({
  requestMessage: z
    .string()
    .min(10, "Please provide a reason (at least 10 characters)")
    .max(500, "Message is too long (max 500 characters)"),
});

export const approveRequestSchema = z.object({
  requestId: z.string(),
  adminResponse: z.string().optional(),
});

export const rejectRequestSchema = z.object({
  requestId: z.string(),
  adminResponse: z
    .string()
    .min(1, "Please provide a reason for rejection")
    .max(500, "Response is too long (max 500 characters)"),
});
