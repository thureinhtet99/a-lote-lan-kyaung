"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptInvitation } from "@/features/organizations/actions/accept-invitation";
import { rejectInvitation } from "@/features/organizations/actions/reject-invitation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Mail,
  CheckCircle,
  XCircle,
  Calendar,
  Crown,
  Shield,
} from "lucide-react";
import LoadingSwap from "@/components/shared/loading-swap";

type Invitation = {
  id: string;
  organizationId: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  inviterName: string;
  inviterEmail: string;
};

export function InvitationsList({
  invitations,
}: {
  invitations: Invitation[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAccept = (invitationId: string) => {
    startTransition(async () => {
      const result = await acceptInvitation(invitationId);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleReject = (invitationId: string) => {
    startTransition(async () => {
      const result = await rejectInvitation(invitationId);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const getRoleIcon = (role: string | null) => {
    if (role === "org-admin")
      return <Crown className="size-4 text-amber-500" />;
    if (role === "hr") return <Shield className="size-4 text-blue-500" />;
    return null;
  };

  const getRoleLabel = (role: string | null) => {
    if (role === "org-admin") return "Organization Admin";
    if (role === "hr") return "HR Manager";
    return role || "Member";
  };

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Mail className="size-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No pending invitations</h3>
        <p className="text-sm text-muted-foreground mt-1">
          You don't have any pending organization invitations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Pending Invitations</h2>
        <p className="text-sm text-muted-foreground">
          {invitations.length} invitation{invitations.length !== 1 ? "s" : ""}{" "}
          waiting for your response
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {invitations.map((invitation) => {
          const isExpired = new Date(invitation.expiresAt) < new Date();

          return (
            <Card key={invitation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(invitation.role)}
                    <CardTitle className="text-lg">
                      {getRoleLabel(invitation.role)}
                    </CardTitle>
                  </div>
                  {isExpired && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Invited by {invitation.inviterName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Invitation Email</p>
                    <p className="text-muted-foreground">{invitation.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Expires</p>
                    <p className="text-muted-foreground">
                      {new Date(invitation.expiresAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  onClick={() => handleReject(invitation.id)}
                  disabled={isPending || isExpired}
                >
                  <LoadingSwap
                    isLoading={isPending}
                    children={
                      <>
                        <XCircle className="mr-2 size-4" />
                        Decline
                      </>
                    }
                  />
                </Button>
                <Button
                  className="flex-1 cursor-pointer"
                  onClick={() => handleAccept(invitation.id)}
                  disabled={isPending || isExpired}
                >
                  <LoadingSwap
                    isLoading={isPending}
                    children={
                      <>
                        <CheckCircle className="mr-2 size-4" />
                        Accept
                      </>
                    }
                  />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
