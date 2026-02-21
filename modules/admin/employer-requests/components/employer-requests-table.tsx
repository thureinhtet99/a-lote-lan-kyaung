"use client";

import { useEffect, useState, useTransition } from "react";
import { getEmployerRequests } from "@/features/employer-requests/actions/get-employer-requests";
import { approveEmployerRequest } from "@/features/employer-requests/actions/approve-employer-request";
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

type EmployerRequest = {
  id: string;
  userId: string;
  status: string;
  requestMessage: string | null;
  adminResponse: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  reviewer: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export function EmployerRequestsTable() {
  const [requests, setRequests] = useState<EmployerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<EmployerRequest | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    const result = await getEmployerRequests();
    if (result.success) {
      setRequests(result.data);
    } else {
      toast.error(result.error || "Failed to fetch requests");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = () => {
    if (!selectedRequest) return;

    startTransition(async () => {
      const result = await approveEmployerRequest({
        requestId: selectedRequest.id,
        adminResponse: adminResponse || undefined,
      });
      if (result.success) {
        toast.success("Employer request approved successfully");
        setApproveDialogOpen(false);
        setAdminResponse("");
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast.error(result.error || "Failed to approve request");
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
        setRejectDialogOpen(false);
        setAdminResponse("");
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast.error(result.error || "Failed to reject request");
      }
    });
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading requests...</div>;
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const reviewedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <>
      <div className="space-y-8">
        {pendingRequests.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Pending Requests</h2>
            <Table>
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
                    <TableCell className="max-w-md">
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
        )}

        {reviewedRequests.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Reviewed Requests</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin Response</TableHead>
                  <TableHead>Reviewed By</TableHead>
                  <TableHead>Date</TableHead>
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
                        variant={
                          request.status === "approved"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      {request.adminResponse || "-"}
                    </TableCell>
                    <TableCell>{request.reviewer?.name || "-"}</TableCell>
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
        )}

        {requests.length === 0 && (
          <div className="flex justify-center p-8 text-muted-foreground">
            No employer requests found
          </div>
        )}
      </div>

      {/* Approve Dialog */}
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
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Add a message for the user..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApproveDialogOpen(false);
                setAdminResponse("");
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isPending}>
              Approve Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
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
              <Label htmlFor="reject-response">Rejection Reason *</Label>
              <Textarea
                id="reject-response"
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setAdminResponse("");
                setSelectedRequest(null);
              }}
            >
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
