"use client";

import { Suspense } from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { SignedIn, SignedOut } from "@/services/clerk/component/AuthStatus";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNavMenuGroupType } from "@/types/sidebar-nav-menu-group.type";

export default function SidebarNavMenuGroup({
  items,
  className,
}: {
  items: SidebarNavMenuGroupType;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className={className}>
      <SidebarMenu>
        {items.map((item) => {
          const html = (
            <SidebarMenuItem key={item.href}>
              <Suspense>
                <SidebarMenuButton asChild isActive={pathname === item.href}>
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </Suspense>
            </SidebarMenuItem>
          );

          if (item.authStatus === "signedIn") {
            return <SignedIn key={item.href}>{html}</SignedIn>;
          }
          if (item.authStatus === "signedOut") {
            return <SignedOut key={item.href}>{html}</SignedOut>;
          }

          return html;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
