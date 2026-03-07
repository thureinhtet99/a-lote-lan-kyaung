import Loading from "@/components/shared/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { APP_ROUTES } from "@/constants/app-config";
import { getUserNotifications } from "@/features/organizations/db/notification-db";
import { NotificationsList } from "@/features/organizations/components/notifications-list";
import { cn } from "@/lib/utils";

export default function NotificationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { userId } = await getCurrentUser();
  if (userId == null) return redirect(APP_ROUTES.SIGN_IN);

  const notificationsResult = await getUserNotifications();
  const notifications = notificationsResult.success
    ? notificationsResult.data
    : [];

  return (
    <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your notifications
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>
            Stay updated with important information about your account and
            organization requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Loading />}>
            <NotificationsList initialNotifications={notifications} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};
