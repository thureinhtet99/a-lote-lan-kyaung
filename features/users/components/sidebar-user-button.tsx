import { Suspense } from "react";
import SidebarUserButtonClient from "./_sidebar-user-button-client";
import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "@/components/features/auth/AuthButtons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import Loading from "@/components/shared/loading";

const SidebarUserSuspense = async () => {
  const { user } = await getCurrentUser({ allData: true });

  // Check if there is a user to show user button
  if (user == null) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  // Map better-auth user to UserType
  const mappedUser = {
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  };

  return <SidebarUserButtonClient user={mappedUser} />;
};

export default function SidebarUserButton() {
  return (
    <Suspense fallback={<Loading />}>
      <SidebarUserSuspense />
    </Suspense>
  );
}
