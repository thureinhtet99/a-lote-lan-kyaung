"use client";

import { useOptimistic, useState, useTransition } from "react";
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
import { MoreHorizontal, Search, X } from "lucide-react";
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
import { PaginationType, UserRoleType, UserType } from "@/types/index.type";
import { getVisiblePages } from "../lib/utils";
import CustomPagination from "@/components/shared/custom-pagination";

export function UserTableClient({
  users,
  pagination,
  initialQuery,
}: {
  users: UserType[];
  pagination: PaginationType;
  initialQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [optimisticUsers, setOptimisticUsers] = useOptimistic(
    users,
    (
      previousUsers,
      update: { userId: string; role: UserRoleType; banned?: boolean },
    ) =>
      previousUsers.map((user) =>
        user.id === update.userId
          ? {
              ...user,
              role: update.role,
              banned: update.banned ?? user.banned,
            }
          : user,
      ),
  );
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [confirmBanDialogOpen, setConfirmBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [banReason, setBanReason] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const visiblePages = getVisiblePages(pagination.page, pagination.totalPages);
  const emptyRowCount = Math.max(
    0,
    pagination.pageSize - optimisticUsers.length,
  );

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("pageSize", String(pagination.pageSize));
    return `${pathname}?${params.toString()}`;
  };

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }

    params.set("page", "1");
    params.set("pageSize", String(pagination.pageSize));
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.set("page", "1");
    params.set("pageSize", String(pagination.pageSize));
    setSearchQuery("");
    router.push(`${pathname}?${params.toString()}`);
  };

  const resetBanFlow = () => {
    setBanDialogOpen(false);
    setConfirmBanDialogOpen(false);
    setBanReason("");
    setSelectedUser(null);
  };

  const handleRoleChange = (userId: string, newRole: UserRoleType) => {
    const previousRole = optimisticUsers.find(
      (user) => user.id === userId,
    )?.role;
    setOptimisticUsers({ userId, role: newRole });

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        if (previousRole) {
          setOptimisticUsers({ userId, role: previousRole });
        }
        toast.error(result.message);
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
        toast.success(result.message);
        router.refresh();
        resetBanFlow();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleUnbanUser = (userId: string) => {
    startTransition(async () => {
      const result = await unbanUser(userId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name or email"
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="outline" size="sm">
          Search
        </Button>
      </form>

      {optimisticUsers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          {initialQuery ? `No users match "${initialQuery}"` : "No users found"}
        </div>
      ) : (
        <>
          <Table className="min-w-[760px]">
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
              {optimisticUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="max-w-[180px] truncate font-medium sm:max-w-none sm:whitespace-normal">
                    {user.name}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate sm:max-w-none sm:whitespace-normal">
                    {user.email}
                  </TableCell>
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
                    {new Date(user.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer hover:border"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleRoleChange(user.id, "user")}
                          disabled={isPending || user.role === "user"}
                        >
                          Set as User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => handleRoleChange(user.id, "admin")}
                          disabled={isPending || user.role === "admin"}
                        >
                          Set as Admin
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.banned ? (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleUnbanUser(user.id)}
                            disabled={isPending}
                          >
                            Unban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="cursor-pointer"
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

          <CustomPagination
            pagination={pagination}
            createPageUrl={createPageUrl}
            visiblePages={visiblePages}
          />
        </>
      )}

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
              Are you sure you want to ban{" "}
              <strong className="text-black">{selectedUser?.name}</strong>?
              Please provide a reason.
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
              Are you sure you want to ban{" "}
              <strong className="text-black">{selectedUser?.name}</strong>? This
              user will lose access immediately.
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
              {isPending ? "Confirming..." : "Confirm Ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
