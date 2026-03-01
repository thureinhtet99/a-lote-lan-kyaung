"use client";

import { useState, useTransition } from "react";
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
import {
  approveOrganizationRequest,
  rejectOrganizationRequest,
} from "@/features/organizations/db/organization-request-db";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle, XCircle } from "lucide-react";

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
}: {
  pendingRequests: OrgRequestRow[];
  reviewedRequests: OrgRequestRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<OrgRequestRow | null>(
    null,
  );
  const [adminResponse, setAdminResponse] = useState("");

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
    <div className="rounded-md border">
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
                  /{req.orgSlug}
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
                      variant="outline"
                      className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                      onClick={() => {
                        setSelectedRequest(req);
                        setApproveDialogOpen(true);
                      }}
                    >
                      <CheckCircle className="mr-1 size-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/30"
                      onClick={() => {
                        setSelectedRequest(req);
                        setRejectDialogOpen(true);
                      }}
                    >
                      <XCircle className="mr-1 size-3.5" />
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

  return (
    <>
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Pending Requests</h2>
            <Badge variant="outline">{pendingRequests.length}</Badge>
          </div>
          {renderTable(pendingRequests, true)}
        </div>
      )}

      {reviewedRequests.length > 0 && (
        <div className="space-y-3 mt-8">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Reviewed Requests
          </h2>
          {renderTable(reviewedRequests, false)}
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
