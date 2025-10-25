import { ReactNode } from "react";

export type SidebarNavMenuGroupType = {
  href: string;
  icon: ReactNode;
  label: string;
  authStatus?: "signedIn" | "signedOut";
}[];
