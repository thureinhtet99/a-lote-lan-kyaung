"use server";

import z from "zod";
import { userNotificationSettingsSchema } from "../schema/user-noti-schema";
import { getCurrentUser } from "@/lib/auth/auth-helpers";
import { updateUserNotificationSettingDb } from "../db/user-noti-settings";

export const updateNotificationSetting = async (
  unsafeData: z.infer<typeof userNotificationSettingsSchema>,
) => {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      success: false,
      message: "You must be signed in to update notification settings",
    };
  }

  const { success, data } =
    userNotificationSettingsSchema.safeParse(unsafeData);
  if (!success) {
    return {
      success: false,
      message: "There was an error updating your notification settings",
    };
  }

  await updateUserNotificationSettingDb(userId, data);

  return {
    success: true,
    message: "Notification settings updated successfully",
  };
};
