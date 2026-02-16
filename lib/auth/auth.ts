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
import { ac, owner, admin, member } from "@/lib/utils/access-control";
import { revalidateAdminStatsCache } from "@/features/users/db/cache/users";

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
        owner,
        admin,
        member,
      },
    }),
    adminPlugin(),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async () => {
          revalidateAdminStatsCache();
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
