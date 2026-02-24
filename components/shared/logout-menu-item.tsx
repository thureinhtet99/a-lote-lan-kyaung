"use client";

import { useSignOut } from "@/hooks/use-sign-out";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { LogOut } from "lucide-react";

export default function LogoutMenuItem() {
  const { signOut, isPending } = useSignOut();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <DropdownMenuItem
      className="text-red-600 focus:text-red-600 cursor-pointer"
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{isPending ? "Logging out..." : "Log out"}</span>
    </DropdownMenuItem>
  );
}
