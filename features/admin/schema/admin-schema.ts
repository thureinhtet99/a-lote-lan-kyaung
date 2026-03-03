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

// Organization request schemas
export const organizationRequestSchema = z.object({
  orgName: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name is too long (max 100 characters)"),
  orgSlug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(60, "Slug is too long (max 60 characters)")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  orgLogo: z
    .url("Organization logo must be a valid URL")
    .max(2048, "Organization logo URL is too long (max 2048 characters)")
    .optional(),
  requestMessage: z
    .string()
    .min(10, "Please provide a reason (at least 10 characters)")
    .max(500, "Message is too long (max 500 characters)"),
});

export const approveOrgRequestSchema = z.object({
  requestId: z.string(),
  adminResponse: z.string().optional(),
});

export const rejectOrgRequestSchema = z.object({
  requestId: z.string(),
  adminResponse: z
    .string()
    .min(1, "Please provide a reason for rejection")
    .max(500, "Response is too long (max 500 characters)"),
});
