"use client";

import { useEffect, useState } from "react";
import { getOrganizationMembers } from "@/features/organizations/actions/get-members";
import { removeMember } from "@/features/organizations/actions/remove-member";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { MoreVertical, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
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

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    const result = await getOrganizationMembers();
    if (result.success) {
      setMembers(result.members);
    } else {
      toast.error(result.error || "Failed to load members");
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
      toast.error(result.error || "Failed to remove member");
    }
    setDeleting(false);
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading members...
      </div>
    );
  }

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
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={member.userImage || ""}
                      alt={member.userName}
                    />
                    <AvatarFallback>
                      {member.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.userName}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.userEmail}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {member.role === "owner" ? (
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {member.role}
                  </Badge>
                ) : (
                  <MemberRoleSelect
                    memberId={member.id}
                    currentRole={member.role}
                    onRoleChange={loadMembers}
                  />
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(member.createdAt), "MMM d, yyyy")}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {member.role !== "owner" && (
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
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
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
