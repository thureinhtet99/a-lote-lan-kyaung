import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/config/appConfig";

export default function SettingsPage() {
  redirect(APP_ROUTES.SETTINGS.PROFILE);
}
