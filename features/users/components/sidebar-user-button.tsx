import { Suspense } from "react";
import SidebarUserButtonClient from "./_sidebar-user-button-client";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { SignOutButton } from "@/components/auth/auth-buttons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import Loading from "@/components/shared/loading";

export default function SidebarUserButton() {
  return (
    <Suspense fallback={<Loading className="my-4" />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { user } = await getCurrentUser({ allData: true });

  // Check if there is a user to show user button
  if (!user) {
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  // Map logged-in user's data
  const mappedUser = {
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  };

  return <SidebarUserButtonClient user={mappedUser} />;
};
