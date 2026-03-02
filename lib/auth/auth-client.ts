import { createAuthClient } from "better-auth/react";
import { organizationClient, adminClient } from "better-auth/client/plugins";
import { ac, hr, orgAdmin } from "@/lib/utils/access-control";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient({
      ac,
      roles: {
        hr,
        "org-admin": orgAdmin,
      },
    }),
    adminClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
