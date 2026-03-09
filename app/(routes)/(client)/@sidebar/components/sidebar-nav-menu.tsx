"use client";

import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
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
import { APP_ROUTES } from "@/constants/app-config";

export default function SidebarNavMenu({
  items,
  className,
  unreadCount,
}: {
  items: SidebarNavMenuType;
  className?: string;
  unreadCount?: number;
}) {
  return (
    <Suspense>
      <SuspendedComponent
        items={items}
        className={className}
        unreadCount={unreadCount}
      />
    </Suspense>
  );
}

function SuspendedComponent({
  items,
  className,
  unreadCount = 0,
}: {
  items: SidebarNavMenuType;
  className?: string;
  unreadCount?: number;
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
          const isNotificationsItem =
            item.href === APP_ROUTES.SETTINGS.NOTIFICATIONS;
          const shouldShowUnreadBadge = isNotificationsItem && unreadCount > 0;

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
                    {shouldShowUnreadBadge && (
                      <Badge className="ml-auto group-data-[state=collapsed]:absolute -right-1 top-0 size-4">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
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
