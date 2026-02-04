import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/drizzle/db";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 3,
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  // user: {
  //   additionalFields: {
  //     firstName: {
  //       type: "string",
  //       required: true,
  //     },
  //     lastName: {
  //       type: "string",
  //       required: true,
  //     },
  //     username: {
  //       type: "string",
  //       required: true,
  //       unique: true,
  //     },
  //   },
  // },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
