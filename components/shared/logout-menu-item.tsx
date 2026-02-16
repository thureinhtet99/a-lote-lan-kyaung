"use client";

import { useSignOut } from "@/hooks/use-sign-out";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { LogOut } from "lucide-react";

export default function LogoutMenuItem() {
  const { signOut, isLoading } = useSignOut();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <DropdownMenuItem
      className="text-red-600 focus:text-red-600"
      onClick={handleLogout}
      disabled={false}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{isLoading ? "Logging out..." : "Log out"}</span>
    </DropdownMenuItem>
  );
}
