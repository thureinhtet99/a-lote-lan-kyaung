"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import {
  claimOrganization,
  deleteNotification,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/features/organizations/db/notification-db";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  userId: string;
  type: "organization_approved" | "organization_rejected" | "info";
  title: string;
  message: string;
  organizationId: string | null;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
};

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const refreshNotifications = async () => {
    const result = await getUserNotifications();
    if (result.success) {
      setNotifications(result.data);
      setUnreadCount(result.data.filter((n) => !n.isRead).length);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    startTransition(async () => {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        await refreshNotifications();
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        toast.success(result.message);
        await refreshNotifications();
      }
    });
  };

  const handleClaimOrganization = (
    notificationId: string,
    organizationId: string,
  ) => {
    startTransition(async () => {
      const result = await claimOrganization(notificationId, organizationId);
      if (result.success) {
        toast.success(result.message);
        await refreshNotifications();
        router.push("/employer");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    startTransition(async () => {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        await refreshNotifications();
      }
    });
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "organization_approved":
        return "🎉";
      case "organization_rejected":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 border-b last:border-0 hover:bg-accent/50 transition-colors",
                  !notification.isRead && "bg-accent/20",
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm">
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={isPending}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          },
                        )}
                      </span>
                      {notification.type === "organization_approved" &&
                        notification.organizationId && (
                          <Button
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() =>
                              handleClaimOrganization(
                                notification.id,
                                notification.organizationId!,
                              )
                            }
                            disabled={isPending}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Claim Organization
                          </Button>
                        )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto text-destructive"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                        disabled={isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
