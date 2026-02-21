"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getAllUsers,
  updateUserRole,
  banUser,
  unbanUser,
} from "@/features/users/actions/manage-users";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type User = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  image: string | null;
  emailVerified: boolean;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  createdAt: Date;
};

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsers();
    if (result.success) {
      setUsers(result.data);
    } else {
      toast.error(result.error || "Failed to fetch users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (
    userId: string,
    newRole: "user" | "employer" | "admin",
  ) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast.success("User role updated successfully");
        fetchUsers();
      } else {
        toast.error(result.error || "Failed to update user role");
      }
    });
  };

  const handleBanUser = () => {
    if (!selectedUser || !banReason.trim()) {
      toast.error("Please provide a ban reason");
      return;
    }

    startTransition(async () => {
      const result = await banUser(selectedUser.id, banReason);
      if (result.success) {
        toast.success("User banned successfully");
        setBanDialogOpen(false);
        setBanReason("");
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(result.error || "Failed to ban user");
      }
    });
  };

  const handleUnbanUser = (userId: string) => {
    startTransition(async () => {
      const result = await unbanUser(userId);
      if (result.success) {
        toast.success("User unbanned successfully");
        fetchUsers();
      } else {
        toast.error(result.error || "Failed to unban user");
      }
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    user.role === "admin"
                      ? "destructive"
                      : user.role === "employer"
                        ? "default"
                        : "secondary"
                  }
                >
                  {user.role || "user"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.banned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : (
                  <Badge variant="outline">Active</Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(user.id, "user")}
                      disabled={isPending || user.role === "user"}
                    >
                      Set as User
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(user.id, "employer")}
                      disabled={isPending || user.role === "employer"}
                    >
                      Set as Employer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRoleChange(user.id, "admin")}
                      disabled={isPending || user.role === "admin"}
                    >
                      Set as Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.banned ? (
                      <DropdownMenuItem
                        onClick={() => handleUnbanUser(user.id)}
                        disabled={isPending}
                      >
                        Unban User
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user);
                          setBanDialogOpen(true);
                        }}
                        disabled={isPending}
                      >
                        Ban User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.name}? Please provide
              a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Ban Reason</Label>
              <Input
                id="reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setBanDialogOpen(false);
                setBanReason("");
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanUser}
              disabled={isPending || !banReason.trim()}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
