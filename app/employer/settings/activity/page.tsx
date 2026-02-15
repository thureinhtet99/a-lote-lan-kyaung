import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityLog } from "@/components/features/organizations/settings/activity-log";

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            View recent changes and actions in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityLog />
        </CardContent>
      </Card>
    </div>
  );
}
