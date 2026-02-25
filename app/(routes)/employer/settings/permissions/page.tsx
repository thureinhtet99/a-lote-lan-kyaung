import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PermissionsMatrix } from "@/components/organizations/settings/permissions-matrix";

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            View what each role can do in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionsMatrix />
        </CardContent>
      </Card>
    </div>
  );
}
