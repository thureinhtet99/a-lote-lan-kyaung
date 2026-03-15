import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/constants/app-config";

export default function SettingsPage() {
  redirect(APP_ROUTES.SETTINGS.PROFILE);
}
