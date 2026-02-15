import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { ac, owner, admin, user } from "@/lib/utils/access-control";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member: user, // map 'user' role to 'member' in the database
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
