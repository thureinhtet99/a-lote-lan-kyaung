"use client";

import Loading from "@/components/shared/loading";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrganizationMembers } from "@/features/organizations/actions/get-members";
import { removeMember } from "@/features/organizations/actions/remove-member";
import { useSession } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MemberRoleSelect } from "./member-role-select";

type Member = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  userName: string;
  userEmail: string;
  userImage: string | null;
};

export function MemberTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { data: session } = useSession();

  const currentUserId = session?.user?.id ?? null;
  const currentUserRole = currentUserId
    ? members.find((member) => member.userId === currentUserId)?.role
    : null;
  const canManageMembers = currentUserRole === "org-admin";

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    const result = await getOrganizationMembers();
    if (result.success) {
      setMembers(result.data);
    } else {
      toast.error(result.message || "Failed to load members");
    }
    setLoading(false);
  }

  async function handleRemoveMember() {
    if (!memberToDelete) return;

    setDeleting(true);
    const result = await removeMember(memberToDelete.id);

    if (result.success) {
      toast.success("Member removed successfully");
      setMemberToDelete(null);
      loadMembers();
    } else {
      toast.error(result.message || "Failed to remove member");
    }
    setDeleting(false);
  }

  if (loading) return <Loading />;

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No members found</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isCurrentUser =
              currentUserId != null && member.userId === currentUserId;
            const canManageThisMember =
              canManageMembers && member.role !== "org-admin" && !isCurrentUser;

            return (
              <TableRow
                key={member.id}
                className={cn(isCurrentUser && "bg-primary/5")}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={member.userImage || ""}
                        alt={member.userName}
                      />
                      <AvatarFallback className="bg-primary text-white size-10 text-lg">
                        {member.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{member.userName}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.userEmail}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {canManageMembers && member.role !== "org-admin" ? (
                    <MemberRoleSelect
                      memberId={member.id}
                      currentRole={member.role}
                      onRoleChange={loadMembers}
                    />
                  ) : (
                    <span
                      className={cn(
                        "capitalize",
                        member.role === "org-admin" && "text-primary",
                      )}
                    >
                      {member.role}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(member.createdAt), "MMM d, yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {canManageThisMember && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setMemberToDelete(member)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={() => setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToDelete?.userName} from
              the organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
