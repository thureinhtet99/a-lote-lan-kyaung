// "use client";

import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import { differenceInDays } from "date-fns";

import { getCurrentUser } from "@/lib/auth/auth-helpers";
import UserProfileClient from "./components/_user-profile-client";
import { Suspense } from "react";

export default async function ProfilePage() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const session = await getCurrentUser();
  if (!session.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          Please{" "}
          <Link href={APP_ROUTES.SIGN_IN} className="underline text-primary">
            sign in
          </Link>{" "}
          to view your profile
        </p>
      </div>
    );
  }

  const userInitials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return <UserProfileClient session={session} userInitials={userInitials} />;
};
