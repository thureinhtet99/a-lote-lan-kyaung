"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
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

export function NotificationsList({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const refreshNotifications = async () => {
    const result = await getUserNotifications();
    if (result.success) {
      setNotifications(result.data);
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

  if (notifications.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-muted p-3">
            <Check className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with mark all as read button */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={handleMarkAllAsRead}
            disabled={isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      )}

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-4 border rounded-lg hover:border-primary/50 transition-colors",
              !notification.isRead && "bg-accent/20 border-primary/20",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center w-full justify-between min-w-0 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{notification.title}</h4>
                      {!notification.isRead && (
                        <Badge variant="default" className="h-5 px-1.5 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={isPending}
                      className="flex-shrink-0 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      Mark read
                    </Button>
                  )}

                  <div className="flex items-center gap-2">
                    {notification.type === "organization_approved" &&
                      notification.organizationId && (
                        <Button
                          className="flex-1 max-w-xs"
                          onClick={() =>
                            handleClaimOrganization(
                              notification.id,
                              notification.organizationId!,
                            )
                          }
                          disabled={isPending}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Claim Organization
                        </Button>
                      )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
