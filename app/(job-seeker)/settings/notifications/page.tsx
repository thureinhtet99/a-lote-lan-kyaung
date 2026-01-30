import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { userNotificationSettingsTable } from "@/drizzle/schema";
import NotificationsForm from "@/features/users/components/NotificationsForm";
import { userNotificationTag } from "@/lib/dataCache";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default function NotificationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { userId } = await getCurrentUser();
  if (userId == null) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
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
const getNotiSettingsByUserId = async (userId: string) => {
  const cachedData = unstable_cache(
    async () => {
      return await db.query.userNotificationSettingsTable.findFirst({
        where: eq(userNotificationSettingsTable.userId, userId),
        columns: {
          aiPrompt: true,
          newJobEmailNotification: true,
        },
      });
    },
    [userNotificationTag("userNotificationSettings", userId)],
    { tags: [userNotificationTag("userNotificationSettings", userId)] },
  );
  return await cachedData();
};

const getNotificationSettings = async (userId: string) => {
  const data = await getNotiSettingsByUserId(userId);
  return data;
};
