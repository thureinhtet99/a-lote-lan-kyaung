import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { organization, admin as adminPlugin } from "better-auth/plugins";
import {
  accountTable,
  invitationTable,
  memberTable,
  sessionTable,
  userTable,
  verificationTable,
} from "@/drizzle/schema";
import { ac, hr, orgAdmin } from "@/lib/utils/access-control";
import { revalidateTag } from "next/cache";
import { dashboardStatsTag } from "@/lib/utils/data-cache";
import { sendInvitationEmail } from "@/services/email/send-invitation";
import { organizationTable } from "@/features/organizations/schema/organization-schema";

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
      allowUserToCreateOrganization: async () => {
        // Direct creation via better-auth API is disabled.
        // Organizations must be created through the org-request approval flow.
        return false;
      },
      ac,
      roles: {
        hr,
        "org-admin": orgAdmin,
      },
      sendInvitationEmail: async (data) => {
        try {
          await sendInvitationEmail({
            email: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            organizationName: data.organization.name,
            role: data.role,
            inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/employer/invitations?invitation=${data.id}`,
          });
        } catch (error) {
          console.error("Failed to send invitation email:", error);
          // Don't throw - we don't want to fail the invitation if email fails
        }
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
