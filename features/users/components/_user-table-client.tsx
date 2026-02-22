"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  updateUserRole,
  banUser,
  unbanUser,
} from "@/features/users/db/user-db";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { UserProps } from "./user-table";

type PaginationProps = {
  page: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
};

const getVisiblePages = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const visiblePages: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sortedPages.length; index += 1) {
    const page = sortedPages[index];
    const previousPage = sortedPages[index - 1];

    if (index > 0) {
      const gap = page - previousPage;
      if (gap === 2) {
        visiblePages.push(previousPage + 1);
      } else if (gap > 2) {
        visiblePages.push("ellipsis");
      }
    }

    visiblePages.push(page);
  }

  return visiblePages;
};

export function UserTableClient({
  users,
  pagination,
}: {
  users: UserProps[];
  pagination: PaginationProps;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [confirmBanDialogOpen, setConfirmBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [banReason, setBanReason] = useState("");
  const visiblePages = getVisiblePages(pagination.page, pagination.totalPages);
  const emptyRowCount = Math.max(0, pagination.pageSize - users.length);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("pageSize", String(pagination.pageSize));
    return `${pathname}?${params.toString()}`;
  };

  const resetBanFlow = () => {
    setBanDialogOpen(false);
    setConfirmBanDialogOpen(false);
    setBanReason("");
    setSelectedUser(null);
  };

  const handleRoleChange = (
    userId: string,
    newRole: "user" | "employer" | "admin",
  ) => {
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast.success("User role updated successfully");
        router.refresh();
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
        resetBanFlow();
        router.refresh();
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
        router.refresh();
      } else {
        toast.error(result.error || "Failed to unban user");
      }
    });
  };

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
                  className="capitalize"
                  variant={
                    user.role === "admin"
                      ? "outline"
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
          {Array.from({ length: emptyRowCount }, (_, index) => (
            <TableRow key={`empty-row-${index}`} aria-hidden="true">
              <TableCell colSpan={6} className="h-[49px]" />
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {pagination.page} of {pagination.totalPages} (
          {pagination.totalUsers} users)
        </p>
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={createPageUrl(Math.max(1, pagination.page - 1))}
                aria-disabled={pagination.page <= 1 || isPending}
                tabIndex={pagination.page <= 1 || isPending ? -1 : undefined}
                className={
                  pagination.page <= 1 || isPending
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>

            {visiblePages.map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={createPageUrl(page)}
                    isActive={page === pagination.page}
                    aria-disabled={isPending}
                    tabIndex={isPending ? -1 : undefined}
                    className={
                      isPending ? "pointer-events-none opacity-60" : undefined
                    }
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href={createPageUrl(
                  Math.min(pagination.totalPages, pagination.page + 1),
                )}
                aria-disabled={
                  pagination.page >= pagination.totalPages || isPending
                }
                tabIndex={
                  pagination.page >= pagination.totalPages || isPending
                    ? -1
                    : undefined
                }
                className={
                  pagination.page >= pagination.totalPages || isPending
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Dialog
        open={banDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetBanFlow();
            return;
          }
          setBanDialogOpen(true);
        }}
      >
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
            <Button variant="outline" onClick={resetBanFlow}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setBanDialogOpen(false);
                setConfirmBanDialogOpen(true);
              }}
              disabled={isPending || !banReason.trim()}
            >
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmBanDialogOpen}
        onOpenChange={setConfirmBanDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Ban</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban {selectedUser?.name}? This user will
              lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
              onClick={() => setBanDialogOpen(true)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBanUser}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Banning..." : "Confirm Ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
