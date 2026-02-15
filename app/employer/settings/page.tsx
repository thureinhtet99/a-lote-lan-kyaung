import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/config/app-config";

export default function SettingsPage() {
  // Redirect to members page by default
  redirect(APP_ROUTES.EMPLOYER.SETTINGS.MEMBERS);
}
