import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { safeGetSession } from "@/lib/auth/auth-helpers";
import { APP_ROUTES } from "@/constants/app-config";
import { SignOutButton } from "@/features/auth/components/auth-buttons";
import { Suspense } from "react";

export default async function BannedPage() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const session = await safeGetSession();
  if (!session?.user) redirect(APP_ROUTES.SIGN_IN);
  if (!session.user.banned) redirect("/");

  const banExpires = session.user.banExpires;
  const banReason = session.user.banReason;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Account Suspended</CardTitle>
          </div>
          <CardDescription>
            Your account has been temporarily suspended
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {banReason && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Reason:</h4>
              <p className="text-sm text-muted-foreground"> {banReason}</p>
            </div>
          )}

          {banExpires && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Ban Expires:</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(banExpires).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </p>
            </div>
          )}

          {!banExpires && (
            <p className="text-sm text-muted-foreground">
              This ban is permanent unless revoked by an administrator.
            </p>
          )}

          <div className="pt-4">
            <SignOutButton>
              <Button variant="outline" className="w-full">
                Sign Out
              </Button>
            </SignOutButton>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            If you believe this is a mistake, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
