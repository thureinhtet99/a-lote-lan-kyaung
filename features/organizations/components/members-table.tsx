"use client";

import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { InviteMemberDialog } from "./invite-member-dialog";
import {
  UserPlus,
  Crown,
  Shield,
  MoreVertical,
  Trash2,
  UserCog,
} from "lucide-react";
import { removeMember } from "../actions/remove-member";
import { updateMemberRole } from "../actions/update-member-role";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export function MembersTable({
  members,
  canInvite,
  currentUserId,
}: {
  members: Member[];
  canInvite: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getRoleIcon = (role: string) => {
    if (role === "org-admin") return <Crown className="size-3.5" />;
    if (role === "hr") return <Shield className="size-3.5" />;
    return null;
  };

  const getRoleBadge = (role: string) => {
    if (role === "org-admin") {
      return (
        <Badge variant="default" className="gap-1">
          {getRoleIcon(role)}
          Org Admin
        </Badge>
      );
    }
    if (role === "hr") {
      return (
        <Badge variant="secondary" className="gap-1">
          {getRoleIcon(role)}
          HR
        </Badge>
      );
    }
    return <Badge variant="outline">{role}</Badge>;
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    try {
      const result = await removeMember(selectedMember.id);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to remove member");
    } finally {
      setIsLoading(false);
      setRemoveDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleChangeRole = async (
    member: Member,
    newRole: "hr" | "org-admin",
  ) => {
    setIsLoading(true);
    try {
      const result = await updateMemberRole({
        memberId: member.id,
        newRole,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update member role");
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentUser = (member: Member) => member.userId === currentUserId;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Team Members</h2>
            <p className="text-sm text-muted-foreground">
              {members.length} member{members.length !== 1 ? "s" : ""} in your
              organization
            </p>
          </div>
          {canInvite && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 size-4" />
              Invite Member
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-muted-foreground">No members yet</p>
                      {canInvite && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInviteDialogOpen(true)}
                        >
                          <UserPlus className="mr-2 size-4" />
                          Invite your first member
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={member.user.image ?? undefined}
                            alt={member.user.name}
                          />
                          <AvatarFallback>
                            {member.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {member.user.name}
                          </span>
                          {isCurrentUser(member) && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.user.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })()}
                    </TableCell>
                    <TableCell>
                      {canInvite && !isCurrentUser(member) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isLoading}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(
                                  member,
                                  member.role === "hr" ? "org-admin" : "hr",
                                )
                              }
                              disabled={isLoading}
                            >
                              <UserCog className="mr-2 size-4" />
                              Change to{" "}
                              {member.role === "hr" ? "Org Admin" : "HR"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMember(member);
                                setRemoveDialogOpen(true);
                              }}
                              disabled={isLoading}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 size-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{selectedMember?.user.name}</strong> from the
              organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
