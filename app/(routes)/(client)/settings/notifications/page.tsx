import Loading from "@/components/shared/loading";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { userNotificationSettingsTable } from "@/drizzle/schema";
import NotificationsForm from "@/features/users/components/notifications-form";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { cacheLife, cacheTag } from "next/cache";
import { userNotificationTag } from "@/lib/utils/data-cache";

export default function NotificationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  return (
    <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Notification Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage how you receive notifications
        </p>
      </div>
      <Card>
        <CardContent>
          <Suspense fallback={<Loading />}>
            <SuspendedForm userId={userId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

const SuspendedForm = async ({ userId }: { userId: string }) => {
  const notificationSettings = await getNotificationSettings(userId);

  return <NotificationsForm notificationSettings={notificationSettings} />;
};

// Fetch user noti from db (cached)
async function getNotiSettingsByUserId(userId: string) {
  "use cache";
  cacheTag(userNotificationTag(userId));
  cacheLife("hours");
  return await db.query.userNotificationSettingsTable.findFirst({
    where: eq(userNotificationSettingsTable.userId, userId),
    columns: {
      // aiPrompt: true,
      newJobEmailNotification: true,
    },
  });
}

const getNotificationSettings = async (userId: string) => {
  const data = await getNotiSettingsByUserId(userId);
  return data;
};
