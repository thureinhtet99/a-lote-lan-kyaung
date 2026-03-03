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
import {
  approveOrganizationRequest,
  rejectOrganizationRequest,
} from "@/features/organizations/db/organization-request-db";
import { Building2, CheckCircle, XCircle } from "lucide-react";

type SectionPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type OrgRequestRow = {
  id: string;
  userId: string;
  orgName: string;
  orgSlug: string;
  requestMessage: string;
  status: "pending" | "approved" | "rejected";
  adminResponse: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  userName: string;
  userEmail: string;
  userImage: string | null;
};

export function OrgRequestsTableClient({
  pendingRequests,
  reviewedRequests,
  pendingPagination,
  reviewedPagination,
}: {
  pendingRequests: OrgRequestRow[];
  reviewedRequests: OrgRequestRow[];
  pendingPagination: SectionPagination;
  reviewedPagination: SectionPagination;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OrgRequestRow | null>(
    null,
  );
  const [adminResponse, setAdminResponse] = useState("");
  const pendingVisiblePages = getVisiblePages(
    pendingPagination.page,
    pendingPagination.totalPages,
  );
  const reviewedVisiblePages = getVisiblePages(
    reviewedPagination.page,
    reviewedPagination.totalPages,
  );

  const createSectionPageUrl = (sectionParam: "op" | "or", page: number) => {
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
      const result = await approveOrganizationRequest({
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
    if (!selectedRequest) return;
    if (!adminResponse.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    startTransition(async () => {
      const result = await rejectOrganizationRequest({
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

  const statusBadge = (status: string) => {
    if (status === "pending") return <Badge variant="outline">Pending</Badge>;
    if (status === "approved")
      return <Badge className="bg-green-600 text-white">Approved</Badge>;
    return <Badge variant="destructive">Rejected</Badge>;
  };

  const renderTable = (rows: OrgRequestRow[], showActions: boolean) => (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            {showActions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((req) => (
            <TableRow key={req.id}>
              <TableCell>
                <div className="font-medium">{req.userName}</div>
                <div className="text-muted-foreground text-xs">
                  {req.userEmail}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{req.orgName}</div>
                <div className="text-muted-foreground text-xs">
                  @{req.orgSlug}
                </div>
              </TableCell>
              <TableCell className="max-w-[260px]">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {req.requestMessage}
                </p>
              </TableCell>
              <TableCell>{statusBadge(req.status)}</TableCell>
              <TableCell className="text-sm">
                {new Date(req.createdAt).toLocaleDateString()}
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setSelectedRequest(req);
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
                        setSelectedRequest(req);
                        setRejectDialogOpen(true);
                      }}
                      disabled={isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderSectionPagination = (
    sectionParam: "op" | "or",
    sectionPagination: SectionPagination,
    visiblePages: Array<number | "ellipsis">,
  ) => {
    if (sectionPagination.totalPages <= 1) return null;

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
      {pendingPagination.totalItems > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Pending Requests</h2>
            <Badge variant="outline">{pendingPagination.totalItems}</Badge>
          </div>
          {renderTable(pendingRequests, true)}
          {renderSectionPagination(
            "op",
            pendingPagination,
            pendingVisiblePages,
          )}
        </div>
      )}

      {reviewedPagination.totalItems > 0 && (
        <div className="space-y-3 mt-8">
          <h2 className="mb-4 text-xl font-semibold">Reviewed Requests</h2>
          {renderTable(reviewedRequests, false)}
          {renderSectionPagination(
            "or",
            reviewedPagination,
            reviewedVisiblePages,
          )}
        </div>
      )}

      {pendingPagination.totalItems === 0 &&
        reviewedPagination.totalItems === 0 && (
          <div className="text-muted-foreground p-4 text-center">
            No organization requests yet
          </div>
        )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-green-600" />
              Approve Organization Request
            </DialogTitle>
            <DialogDescription>
              This will create the organization{" "}
              <strong>{selectedRequest?.orgName}</strong> (/
              {selectedRequest?.orgSlug}) and add the user as an admin member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="approve-response">
              Response message{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="approve-response"
              placeholder="Congratulations! Your organization has been approved..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeApproveDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isPending ? "Approving…" : "Approve & Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-destructive" />
              Reject Organization Request
            </DialogTitle>
            <DialogDescription>
              Reject the request to create{" "}
              <strong>{selectedRequest?.orgName}</strong>. Please provide a
              reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-response">Reason for rejection</Label>
            <Textarea
              id="reject-response"
              placeholder="Your organization request was rejected because..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRejectDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? "Rejecting…" : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
