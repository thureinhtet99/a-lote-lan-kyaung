import { Suspense } from "react";
import { NotificationBell } from "./notification-bell";
import {
  getUserNotifications,
  getUnreadNotificationsCount,
} from "@/features/organizations/db/notification-db";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationBellWrapper() {
  return (
    <Suspense fallback={<NotificationBellSkeleton />}>
      <NotificationBellServer />
    </Suspense>
  );
}

async function NotificationBellServer() {
  const [notificationsResult, unreadCountResult] = await Promise.all([
    getUserNotifications(),
    getUnreadNotificationsCount(),
  ]);

  const notifications = notificationsResult.data || [];
  const unreadCount = unreadCountResult.count || 0;

  return (
    <NotificationBell
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}

function NotificationBellSkeleton() {
  return <Skeleton className="h-10 w-10 rounded-full" />;
}
