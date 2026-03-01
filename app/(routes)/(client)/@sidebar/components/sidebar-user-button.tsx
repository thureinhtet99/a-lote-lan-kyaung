import { Suspense } from "react";
import SidebarUserButtonClient from ".//_sidebar-user-button-client";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { SignOutButton } from "@/features/auth/components/auth-buttons";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";

export default function SidebarUserButton() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { user } = await getCurrentUser();

  // Check if there is a user to show user button
  if (!user) {
    return (
      <SignOutButton>
        <SidebarMenuButton className="cursor-pointer">
          <LogOutIcon />
          <span>Log out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );
  }

  // Map logged-in user's data
  const userData = {
    name: user.name,
    email: user.email,
    image: user.image ?? null,
  };

  return <SidebarUserButtonClient user={userData} />;
};
