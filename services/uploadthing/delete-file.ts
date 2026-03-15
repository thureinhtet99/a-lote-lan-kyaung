"use server";

import { utapi } from "./client";

export async function deleteUploadThingFile(
  fileKeys: string | string[],
): Promise<{ success: boolean; message?: string }> {
  try {
    const keys = Array.isArray(fileKeys) ? fileKeys : [fileKeys];
    await utapi.deleteFiles(keys);

    return {
      success: true,
      message: "Resume cancelled for application",
    };
  } catch (error) {
    console.error("Error deleting file from UploadThing: ", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}
