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
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { OrganizationRequestType } from "@/types/index.type";
import {
  approveOrganizationRequest,
  rejectOrganizationRequest,
} from "@/features/organizations/db/organization-request-db";
import { getVisiblePages } from "../lib/utils";

type Props = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export function OrgRequestsTableClient({
  pendingRequests,
  reviewedRequests,
  pendingPagination,
  reviewedPagination,
  initialPendingQuery,
  initialReviewedQuery,
}: {
  pendingRequests: OrganizationRequestType[];
  reviewedRequests: OrganizationRequestType[];
  pendingPagination: Props;
  reviewedPagination: Props;
  initialPendingQuery: string;
  initialReviewedQuery: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [pendingQuery, setPendingQuery] = useState(initialPendingQuery);
  const [reviewedQuery, setReviewedQuery] = useState(initialReviewedQuery);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<OrganizationRequestType | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const activeTabParam = searchParams.get("tab");
  const activeTab =
    activeTabParam === "reviewed" ||
    (!activeTabParam && (searchParams.get("or") || searchParams.get("orq")))
      ? "reviewed"
      : "pending";

  const pendingVisiblePages = getVisiblePages(
    pendingPagination.page,
    pendingPagination.totalPages,
  );
  const reviewedVisiblePages = getVisiblePages(
    reviewedPagination.page,
    reviewedPagination.totalPages,
  );
  const pendingEmptyRowCount = Math.max(
    0,
    pendingPagination.pageSize - pendingRequests.length,
  );
  const reviewedEmptyRowCount = Math.max(
    0,
    reviewedPagination.pageSize - reviewedRequests.length,
  );

  const createPageUrl = (sectionParam: "op" | "or", page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(sectionParam, String(page));
    params.set("tab", sectionParam === "or" ? "reviewed" : "pending");
    return `${pathname}?${params.toString()}`;
  };

  const applySearch = (
    queryParam: "opq" | "orq",
    pageParam: "op" | "or",
    value: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set(queryParam, value.trim());
    } else {
      params.delete(queryParam);
    }
    params.set(pageParam, "1");
    params.set("tab", pageParam === "or" ? "reviewed" : "pending");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearSearch = (
    queryParam: "opq" | "orq",
    pageParam: "op" | "or",
    setter: (v: string) => void,
  ) => {
    setter("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete(queryParam);
    params.set(pageParam, "1");
    params.set("tab", pageParam === "or" ? "reviewed" : "pending");
    router.push(`${pathname}?${params.toString()}`);
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
    if (!selectedRequest || !adminResponse.trim()) {
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

  const renderPagination = (
    sectionParam: "op" | "or",
    pagination: Props,
    visiblePages: Array<number | "ellipsis">,
  ) => {
    if (pagination.totalPages <= 1) return null;
    return (
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {pagination.page} of {pagination.totalPages} (
          {pagination.totalItems} total)
        </p>
        <Pagination className="mx-0 w-full justify-start overflow-x-auto pb-1 sm:w-auto sm:justify-end sm:pb-0">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={createPageUrl(
                  sectionParam,
                  Math.max(1, pagination.page - 1),
                )}
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
              <PaginationItem key={`${sectionParam}-${page}-${index}`}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={createPageUrl(sectionParam, page)}
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
                  sectionParam,
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
    );
  };

  const renderSearch = (
    value: string,
    setter: (v: string) => void,
    queryParam: "opq" | "orq",
    pageParam: "op" | "or",
    placeholder: string,
  ) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        applySearch(queryParam, pageParam, value);
      }}
      className="flex items-center gap-2"
    >
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setter(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {value && (
          <button
            type="button"
            onClick={() => clearSearch(queryParam, pageParam, setter)}
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
  );

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("tab", value);
          router.push(`${pathname}?${params.toString()}`);
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="gap-2">
            Pending
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            Reviewed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {renderSearch(
            pendingQuery,
            setPendingQuery,
            "opq",
            "op",
            "Search by org, slug, user, email, or message…",
          )}
          {pendingRequests.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {initialPendingQuery
                ? `No pending requests match "${initialPendingQuery}"`
                : "No pending organization requests"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[920px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Organization</TableHead>
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
                        <TableCell className="max-w-[280px] whitespace-normal">
                          <div className="font-medium">{request.orgName}</div>
                          <div className="text-muted-foreground text-xs">
                            @{request.orgSlug}
                          </div>
                        </TableCell>
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
                    {Array.from(
                      { length: pendingEmptyRowCount },
                      (_, index) => (
                        <TableRow
                          key={`pending-empty-row-${index}`}
                          aria-hidden="true"
                        >
                          <TableCell colSpan={6} className="h-[49px]" />
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
              {renderPagination("op", pendingPagination, pendingVisiblePages)}
            </>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="mt-4 space-y-4">
          {renderSearch(
            reviewedQuery,
            setReviewedQuery,
            "orq",
            "or",
            "Search by org, slug, user, email, or message…",
          )}
          {reviewedRequests.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              {initialReviewedQuery
                ? `No reviewed requests match "${initialReviewedQuery}"`
                : "No reviewed organization requests"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Organization</TableHead>
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
                        <TableCell className="max-w-[260px] whitespace-normal">
                          <div className="font-medium">{request.orgName}</div>
                          <div className="text-muted-foreground text-xs">
                            @{request.orgSlug}
                          </div>
                        </TableCell>
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
                        <TableCell className="max-w-[300px] whitespace-normal">
                          {request.adminResponse || "-"}
                        </TableCell>
                        <TableCell>{request.reviewer?.name ?? "-"}</TableCell>
                        <TableCell>
                          {request.reviewedAt
                            ? new Date(request.reviewedAt).toLocaleDateString()
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {Array.from(
                      { length: reviewedEmptyRowCount },
                      (_, index) => (
                        <TableRow
                          key={`reviewed-empty-row-${index}`}
                          aria-hidden="true"
                        >
                          <TableCell colSpan={7} className="h-[49px]" />
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
              {renderPagination("or", reviewedPagination, reviewedVisiblePages)}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Organization Request</DialogTitle>
            <DialogDescription>
              Approve organization request for{" "}
              <span className="font-medium text-foreground">
                {selectedRequest?.orgName}
              </span>
              . You can optionally add a response message.
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
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Add a message for the user…"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeApproveDialog}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isPending}>
              {isPending ? "Approving…" : "Approve Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Organization Request</DialogTitle>
            <DialogDescription>
              Reject organization request for{" "}
              <span className="font-medium text-foreground">
                {selectedRequest?.orgName}
              </span>
              . Please provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reject-response">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reject-response"
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Enter reason for rejection…"
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
              {isPending ? "Rejecting…" : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
