import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
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
import { signOut } from "@/lib/auth/auth-client";

export default async function BannedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Check if user is actually banned
  if (!session.user.banned) {
    redirect("/");
  }

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
              <h4 className="mb-2 text-sm font-medium">Reason</h4>
              <p className="text-sm text-muted-foreground">{banReason}</p>
            </div>
          )}

          {banExpires && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Ban Expires</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(banExpires).toLocaleString()}
              </p>
            </div>
          )}

          {!banExpires && (
            <p className="text-sm text-muted-foreground">
              This ban is permanent unless revoked by an administrator.
            </p>
          )}

          <div className="pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                await signOut();
                window.location.href = "/sign-in";
              }}
            >
              Sign Out
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            If you believe this is a mistake, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
