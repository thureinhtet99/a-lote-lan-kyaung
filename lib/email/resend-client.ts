import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error(
    "RESEND_API_KEY is not set in environment variables. Please add it to your .env file.",
  );
}

export const resend = new Resend(process.env.RESEND_API_KEY);
