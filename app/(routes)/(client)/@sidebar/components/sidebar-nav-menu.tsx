"use client";

import { Badge } from "@/components/ui/badge";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_ROUTES } from "@/constants/app-config";
import { SignedIn, SignedOut } from "@/features/auth/components/auth-statuses";
import { useSession } from "@/lib/auth/auth-client";
import { SidebarNavMenuType } from "@/types/index.type";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

export default function SidebarNavMenu({
  items,
  className,
  unreadCount,
  invitationsCount,
}: {
  items: SidebarNavMenuType;
  className?: string;
  unreadCount?: number;
  invitationsCount?: number;
}) {
  return (
    <Suspense>
      <SuspendedComponent
        items={items}
        className={className}
        unreadCount={unreadCount}
        invitationsCount={invitationsCount}
      />
    </Suspense>
  );
}

function SuspendedComponent({
  items,
  className,
  unreadCount = 0,
  invitationsCount = 0,
}: {
  items: SidebarNavMenuType;
  className?: string;
  unreadCount?: number;
  invitationsCount?: number;
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
          const isInvitationsItem =
            item.href === APP_ROUTES.SETTINGS.INVITATIONS ||
            item.href === APP_ROUTES.EMPLOYER.SETTINGS.INVITATIONS;
          const badgeCount = isNotificationsItem
            ? unreadCount
            : isInvitationsItem
              ? invitationsCount
              : 0;
          const shouldShowBadge = badgeCount > 0;

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
                    {shouldShowBadge && (
                      <Badge className="ml-auto group-data-[state=collapsed]:absolute -right-1 top-0 size-4">
                        {badgeCount > 9 ? "9+" : badgeCount}
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
