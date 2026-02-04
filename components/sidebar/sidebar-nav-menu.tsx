"use client";

import { Suspense } from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNavMenuType } from "@/types/index.type";
import { SignedIn, SignedOut } from "@/components/auth/AuthStatus";

export default function SidebarNavMenu({
  items,
  className,
}: {
  items: SidebarNavMenuType;
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
