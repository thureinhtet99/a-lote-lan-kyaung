"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { EmployerRequestType } from "@/types/index.type";
import {
  approveEmployerRequest,
  rejectEmployerRequest,
} from "@/features/users/db/user-db";
import { getVisiblePages } from "../lib/utils";

type SectionPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function EmployerRequestsTableClient({
  pendingRequests,
  reviewedRequests,
  pendingPagination,
  reviewedPagination,
}: {
  pendingRequests: EmployerRequestType[];
  reviewedRequests: EmployerRequestType[];
  pendingPagination: SectionPagination;
  reviewedPagination: SectionPagination;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<EmployerRequestType | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  const pendingVisiblePages = getVisiblePages(
    pendingPagination.page,
    pendingPagination.totalPages,
  );
  const reviewedVisiblePages = getVisiblePages(
    reviewedPagination.page,
    reviewedPagination.totalPages,
  );

  const createSectionPageUrl = (sectionParam: "ep" | "er", page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(sectionParam, String(page));
    return `${pathname}?${params.toString()}`;
  };

  const resetDialogState = () => {
    setAdminResponse("");
    setSelectedRequest(null);
  };

  const closeApproveDialog = () => {
    setApproveDialogOpen(false);
    resetDialogState();
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    resetDialogState();
  };

  const handleApprove = () => {
    if (!selectedRequest) return;

    startTransition(async () => {
      const result = await approveEmployerRequest({
        requestId: selectedRequest.id,
        adminResponse: adminResponse || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        closeApproveDialog();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleReject = () => {
    if (!selectedRequest || !adminResponse.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    startTransition(async () => {
      const result = await rejectEmployerRequest({
        requestId: selectedRequest.id,
        adminResponse,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        closeRejectDialog();
      } else {
        toast.error(result.message);
      }
    });
  };

  const renderSectionPagination = (
    sectionParam: "ep" | "er",
    sectionPagination: SectionPagination,
    visiblePages: Array<number | "ellipsis">,
  ) => {
    if (sectionPagination.totalPages <= 1) {
      return null;
    }

    return (
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {sectionPagination.page} of{" "}
          {sectionPagination.totalPages} ({sectionPagination.totalItems} total)
        </p>
        <Pagination className="mx-0 w-full justify-start overflow-x-auto pb-1 sm:w-auto sm:justify-end sm:pb-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={createSectionPageUrl(
                  sectionParam,
                  Math.max(1, sectionPagination.page - 1),
                )}
                aria-disabled={sectionPagination.page <= 1 || isPending}
                tabIndex={
                  sectionPagination.page <= 1 || isPending ? -1 : undefined
                }
                className={
                  sectionPagination.page <= 1 || isPending
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>

            {visiblePages.map((page, index) => (
              <PaginationItem key={`${sectionParam}-${page}-${index}`}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={createSectionPageUrl(sectionParam, page)}
                    isActive={page === sectionPagination.page}
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
                href={createSectionPageUrl(
                  sectionParam,
                  Math.min(
                    sectionPagination.totalPages,
                    sectionPagination.page + 1,
                  ),
                )}
                aria-disabled={
                  sectionPagination.page >= sectionPagination.totalPages ||
                  isPending
                }
                tabIndex={
                  sectionPagination.page >= sectionPagination.totalPages ||
                  isPending
                    ? -1
                    : undefined
                }
                className={
                  sectionPagination.page >= sectionPagination.totalPages ||
                  isPending
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8">
        {pendingPagination.totalItems > 0 ? (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Pending Requests</h2>
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Request Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.user.name}
                    </TableCell>
                    <TableCell>{request.user.email}</TableCell>
                    <TableCell className="max-w-[340px] whitespace-normal">
                      {request.requestMessage}
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setApproveDialogOpen(true);
                          }}
                          disabled={isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectDialogOpen(true);
                          }}
                          disabled={isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderSectionPagination(
              "ep",
              pendingPagination,
              pendingVisiblePages,
            )}
          </div>
        ) : (
          <div className="text-muted-foreground p-4 text-center animate-pulse">
            No pending employer requests found
          </div>
        )}

        {reviewedPagination.totalItems > 0 ? (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Reviewed Requests</h2>
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Response</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Reviewed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviewedRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.user.name}
                    </TableCell>
                    <TableCell>{request.user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className="capitalize"
                        variant={
                          request.status === "approved"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[340px] whitespace-normal">
                      {request.adminResponse || "-"}
                    </TableCell>
                    <TableCell>{request.reviewer.name}</TableCell>
                    <TableCell>
                      {request.reviewedAt
                        ? new Date(request.reviewedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderSectionPagination(
              "er",
              reviewedPagination,
              reviewedVisiblePages,
            )}
          </div>
        ) : (
          <div className="text-muted-foreground p-4 text-center animate-pulse">
            No reviewed employer requests found
          </div>
        )}
      </div>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Employer Request</DialogTitle>
            <DialogDescription>
              Approve{" "}
              <span className="text-black">{selectedRequest?.user.name}</span>
              &apos;s request to become an employer. You can optionally add a
              response message.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="approve-response">
                Admin Response (Optional)
              </Label>
              <Textarea
                id="approve-response"
                value={adminResponse}
                onChange={(event) => setAdminResponse(event.target.value)}
                placeholder="Add a message for the user..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeApproveDialog}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isPending}>
              {isPending ? "Approving..." : "Approve Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Employer Request</DialogTitle>
            <DialogDescription>
              Reject{" "}
              <span className="text-black">{selectedRequest?.user.name}</span>
              &apos;s request to become an employer. Please provide a reason for
              rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reject-response">
                Rejection Reason<span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-response"
                value={adminResponse}
                onChange={(event) => setAdminResponse(event.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRejectDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending || !adminResponse.trim()}
            >
              {isPending ? "Rejecting...." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
