"use server";

import z from "zod";
import { userNotificationSettingsSchema } from "./schema";
import { getCurrentUser } from "@/services/clerk/lib/get-current-auth";
import { updateUserNotificationSettingDb } from "../db/userNotiSettings";

export const updateNotificationSetting = async (
  unsafeData: z.infer<typeof userNotificationSettingsSchema>,
) => {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You must be signed in to update notification settings",
    };
  }

  const { success, data } =
    userNotificationSettingsSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "There was an error updating your notification settings",
    };
  }

  await updateUserNotificationSettingDb(userId, data);

  return {
    error: false,
    message: "Successfully update your notification settings",
  };
};
