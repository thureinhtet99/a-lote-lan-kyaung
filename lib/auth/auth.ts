import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { organization, admin as adminPlugin } from "better-auth/plugins";
import {
  accountTable,
  invitationTable,
  memberTable,
  organizationTable,
  sessionTable,
  userTable,
  verificationTable,
} from "@/drizzle/schema";
import { ac, user, employer, admin } from "@/lib/utils/access-control";
import { revalidateTag } from "next/cache";
import { dashboardStatsTag } from "@/lib/utils/data-cache";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: userTable,
      session: sessionTable,
      account: accountTable,
      verification: verificationTable,
      organization: organizationTable,
      member: memberTable,
      invitation: invitationTable,
    },
  }),
  usePlural: true,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: false, // Set to true if you want email verification
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        // Only employers can create organizations
        return user.role === "employer";
      },
      ac,
      roles: {
        user,
        employer,
        admin,
      },
      organizationHooks: {
        beforeAddMember: async ({ member, user: memberUser }) => {
          // Use the user's application role instead of default "owner"
          return {
            data: {
              ...member,
              role: memberUser.role as "user" | "employer" | "admin",
            },
          };
        },
      },
    }),
    adminPlugin(),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async () => {
          try {
            revalidateTag(dashboardStatsTag(), "max");
          } catch {
            // ignore cache revalidation errors in non-request contexts (e.g. seed scripts)
          }
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
