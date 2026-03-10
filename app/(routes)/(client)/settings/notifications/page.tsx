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
import { getCurrentOrg, getCurrentUser } from "@/lib/auth/auth-helpers";
import { APP_ROUTES } from "@/constants/app-config";
import { getUserNotifications } from "@/features/organizations/db/notification-db";
import { NotificationsList } from "@/features/organizations/components/notifications-list";
import { cn } from "@/lib/utils";
import PageLoading from "@/components/shared/page-loading";

export default function NotificationPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const [{ userId }, { orgId }] = await Promise.all([
    getCurrentUser(),
    getCurrentOrg(),
  ]);
  if (userId == null) return redirect(APP_ROUTES.SIGN_IN);

  const notificationsResult = await getUserNotifications();
  const notifications = notificationsResult.success
    ? notificationsResult.data
    : [];

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="flex items-center gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Your notifications
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your notifications
          </p>
        </div>
      </div>

      <Suspense fallback={<Loading />}>
        <NotificationsList
          initialNotifications={notifications}
          hasActiveOrg={orgId != null}
        />
      </Suspense>
    </div>
  );
};
