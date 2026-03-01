"use client";

import { Suspense } from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNavMenuType } from "@/types/index.type";
import { SignedIn, SignedOut } from "@/features/auth/components/auth-statuses";
import { useSession } from "@/lib/auth/auth-client";

export default function SidebarNavMenu({
  items,
  className,
}: {
  items: SidebarNavMenuType;
  className?: string;
}) {
  return (
    <Suspense>
      <SuspendedComponent items={items} className={className} />
    </Suspense>
  );
}

function SuspendedComponent({
  items,
  className,
}: {
  items: SidebarNavMenuType;
  className?: string;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <SidebarGroup className={className}>
      <SidebarMenu>
        {items.map((item) => {
          const userRole = session?.user.role;
          const hasAllowedRole = item.roles?.some((role) => role === userRole);
          const isActive =
            pathname === item.href ||
            item.activePathPrefixes?.some((prefix) =>
              pathname.startsWith(prefix),
            );

          if (item.roles && (!userRole || !hasAllowedRole)) {
            return null;
          }

          const html = (
            <SidebarMenuItem className="cursor-pointer" key={item.href}>
              <Suspense>
                <SidebarMenuButton asChild isActive={isActive}>
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
