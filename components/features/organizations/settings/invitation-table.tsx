"use client";

import { useEffect, useState } from "react";
import {
  getInvitations,
  revokeInvitation,
  resendInvitation,
} from "@/features/organizations/actions/manage-invitations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Invitation = {
  id: string;
  organizationId: string;
  email: string;
  role: string | null;
  status: string | null;
  expiresAt: Date;
  inviterId: string;
};

export function InvitationTable() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitationToRevoke, setInvitationToRevoke] =
    useState<Invitation | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [resending, setResending] = useState<string | null>(null);

  useEffect(() => {
    loadInvitations();
  }, []);

  async function loadInvitations() {
    setLoading(true);
    const result = await getInvitations();
    if (result.success) {
      setInvitations(result.invitations);
    } else {
      toast.error(result.error || "Failed to load invitations");
    }
    setLoading(false);
  }

  async function handleRevokeInvitation() {
    if (!invitationToRevoke) return;

    setRevoking(true);
    const result = await revokeInvitation(invitationToRevoke.id);

    if (result.success) {
      toast.success("Invitation revoked");
      setInvitationToRevoke(null);
      loadInvitations();
    } else {
      toast.error(result.error || "Failed to revoke invitation");
    }
    setRevoking(false);
  }

  async function handleResendInvitation(id: string) {
    setResending(id);
    const result = await resendInvitation(id);

    if (result.success) {
      toast.success(result.message || "Invitation resent");
    } else {
      toast.error(result.error || "Failed to resend invitation");
    }
    setResending(null);
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading invitations...
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No pending invitations</p>
        <p className="text-sm mt-1">Invite members from the Members page</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell>
                <div className="font-medium">{invitation.email}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {invitation.role || "member"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {invitation.status || "pending"}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleResendInvitation(invitation.id)}
                      disabled={resending === invitation.id}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {resending === invitation.id
                        ? "Resending..."
                        : "Resend Invitation"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setInvitationToRevoke(invitation)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Revoke
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!invitationToRevoke}
        onOpenChange={() => setInvitationToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the invitation sent to{" "}
              {invitationToRevoke?.email}? They will no longer be able to join
              using this invitation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeInvitation}
              disabled={revoking}
              className="bg-destructive hover:bg-destructive/90"
            >
              {revoking ? "Revoking..." : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
