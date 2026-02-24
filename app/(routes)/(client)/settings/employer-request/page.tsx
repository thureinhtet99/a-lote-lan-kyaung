import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserEmployerRequest } from "@/features/employer-requests/actions/get-employer-requests";
import { EmployerRequestForm } from "@/features/employer-requests/components/employer-request-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function EmployerRequestPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Check if user is already an employer or admin
  if (session.user.role === "employer" || session.user.role === "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Employer Access</h3>
          <p className="text-sm text-muted-foreground">
            Manage your employer account status
          </p>
        </div>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>You already have employer access</AlertTitle>
          <AlertDescription>
            You can create and manage organizations from the employer dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get user's employer request if it exists
  const requestResult = await getUserEmployerRequest();
  const existingRequest = requestResult.data;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Employer Access</h3>
        <p className="text-sm text-muted-foreground">
          Request access to employer features
        </p>
      </div>

      {existingRequest ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Request Status</CardTitle>
              <Badge
                variant={
                  existingRequest.status === "approved"
                    ? "default"
                    : existingRequest.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {existingRequest.status}
              </Badge>
            </div>
            <CardDescription>
              Request submitted on{" "}
              {new Date(existingRequest.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium">Your Message</h4>
              <p className="text-sm text-muted-foreground">
                {existingRequest.requestMessage || "No message provided"}
              </p>
            </div>

            {existingRequest.status === "pending" && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Pending Review</AlertTitle>
                <AlertDescription>
                  Your request is currently being reviewed by our admin team.
                  You will be notified once a decision has been made.
                </AlertDescription>
              </Alert>
            )}

            {existingRequest.status === "rejected" && (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Request Rejected</AlertTitle>
                  <AlertDescription>
                    Your request has been reviewed and rejected.
                  </AlertDescription>
                </Alert>
                {existingRequest.adminResponse && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Admin Response</h4>
                    <p className="text-sm text-muted-foreground">
                      {existingRequest.adminResponse}
                    </p>
                  </div>
                )}
                {existingRequest.reviewedBy && (
                  <p className="text-xs text-muted-foreground">
                    Reviewed by {existingRequest.reviewer?.name || "Admin"} on{" "}
                    {existingRequest.reviewedAt
                      ? new Date(
                          existingRequest.reviewedAt,
                        ).toLocaleDateString()
                      : "N/A"}
                  </p>
                )}
              </>
            )}

            {existingRequest.status === "approved" && (
              <>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Request Approved</AlertTitle>
                  <AlertDescription>
                    Congratulations! Your request has been approved. You now
                    have employer access.
                  </AlertDescription>
                </Alert>
                {existingRequest.adminResponse && (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Admin Response</h4>
                    <p className="text-sm text-muted-foreground">
                      {existingRequest.adminResponse}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <EmployerRequestForm />
      )}
    </div>
  );
}
