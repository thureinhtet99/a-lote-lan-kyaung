import {
  accountTable,
  invitationTable,
  memberTable,
  organizationTable,
  sessionTable,
  userTable,
  verificationTable,
} from "@/drizzle/schema";
import { ac, hr, orgAdmin } from "@/lib/access-control";
import { dashboardStatsTag } from "@/lib/data-cache";
import { db } from "@/lib/db";
import { sendInvitationEmail } from "@/services/email/send-invitation";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { admin as adminPlugin, organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";

const getInitialOrganizationId = async (
  userId: string,
): Promise<string | null> => {
  if (!userId) return null;

  const membership = await db.query.memberTable.findFirst({
    where: eq(memberTable.userId, userId),
    columns: {
      organizationId: true,
    },
    orderBy: (members, { asc }) => [asc(members.createdAt)],
  });

  return membership?.organizationId ?? null;
};

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
    session: {
      create: {
        before: async (
          session: { userId: string } & Record<string, unknown>,
        ) => {
          const activeOrganizationId = await getInitialOrganizationId(
            session.userId,
          );

          return {
            data: {
              ...session,
              activeOrganizationId,
            },
          };
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
