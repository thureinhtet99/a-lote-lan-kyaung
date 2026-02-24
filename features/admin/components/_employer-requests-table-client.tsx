"use client";

import { useState, useTransition } from "react";

import { rejectEmployerRequest } from "@/features/employer-requests/actions/reject-employer-request";
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
  getAllEmployerRequests,
} from "@/features/users/db/user-db";

type Props = {
  pendingRequests: EmployerRequestType[];
  reviewedRequests: EmployerRequestType[];
};

export function EmployerRequestsTableClient({
  pendingRequests,
  reviewedRequests,
}: Props) {
  //   const [pendingRequests, setPendingRequests] = useState(
  //     initialPendingRequests,
  //   );
  //   const [reviewedRequests, setReviewedRequests] = useState(
  //     initialReviewedRequests,
  //   );
  const [isPending, startTransition] = useTransition();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<EmployerRequestType | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  //   const refreshRequests = async () => {
  //     const result = await getAllEmployerRequests();

  //     if (!result.success) {
  //       toast.error(result.message);
  //       return;
  //     }

  //     const requests = result.data as EmployerRequestType[];
  //     setPendingRequests(
  //       requests.filter((request) => request.status === "pending"),
  //     );
  //     setReviewedRequests(
  //       requests.filter((request) => request.status !== "pending"),
  //     );
  //   };

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
        closeApproveDialog();
        // await refreshRequests();
      } else {
        toast.error(result.message || "Failed to approve request");
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
        toast.success("Employer request rejected successfully");
        closeRejectDialog();
        // await refreshRequests();
      } else {
        toast.error(result.error || "Failed to reject request");
      }
    });
  };

  return (
    <>
      <div className="space-y-8">
        {pendingRequests.length > 0 ? (
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
                      {request.requestMessage || "No message provided"}
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
          </div>
        ) : (
          <div className="text-muted-foreground p-4 text-center animate-pulse">
            No pending employer requests found
          </div>
        )}

        {reviewedRequests.length > 0 ? (
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
          </div>
        ) : (
          <div className="text-muted-foreground p-4 text-center animate-pulse">
            No reviewed employer requests found
          </div>
        )}

        {/* {pendingRequests.length === 0 && reviewedRequests.length === 0 && (
          <div className="text-muted-foreground p-4 text-center">
            No employer requests found
          </div>
        )} */}
      </div>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Employer Request</DialogTitle>
            <DialogDescription>
              Approve {selectedRequest?.user.name}&apos;s request to become an
              employer. You can optionally add a response message.
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
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Employer Request</DialogTitle>
            <DialogDescription>
              Reject {selectedRequest?.user.name}&apos;s request to become an
              employer. Please provide a reason for rejection.
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
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
