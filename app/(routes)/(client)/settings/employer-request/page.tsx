import { EmployerRequestForm } from "@/features/admin/components/employer-request-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { getEmployerRequest } from "@/features/users/db/user-db";
import { isEmployer } from "@/lib/auth/auth-helpers";

export default async function EmployerRequestPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const isAlreadyEmployer = await isEmployer();

  // Check if user is already an employer or admin
  if (isAlreadyEmployer) {
    return (
      <div className="space-y-6 px-6 md:px-9 py-6 md:py-9">
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

  // Get employer request if it exists
  const requestResult = await getEmployerRequest();
  if (!requestResult.success || !requestResult.data) {
    return (
      <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employer Access</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Request access to employer features
          </p>
        </div>
        <EmployerRequestForm />
      </div>
    );
  }
  const existingRequest = requestResult.data;

  return (
    <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Employer Access</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Request access to employer features
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Request Status</CardTitle>
            <CardDescription>
              Submitted on{" "}
              {new Date(existingRequest.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <CardDescription>
            <p className="text-sm text-muted-foreground">
              {existingRequest.requestMessage}
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingRequest.status === "pending" && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Pending Review</AlertTitle>
              <AlertDescription>
                Your request is currently being reviewed by our admin team. You
                will be notified once a decision has been made.
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

              <CardHeader className="px-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Admin Response</CardTitle>
                  {existingRequest.reviewedAt && (
                    <CardDescription>
                      Reviewed on{" "}
                      {existingRequest.reviewedAt
                        ? new Date(
                            existingRequest.reviewedAt,
                          ).toLocaleDateString()
                        : "N/A"}
                    </CardDescription>
                  )}
                </div>
                <CardDescription>
                  <p className="text-sm text-muted-foreground">
                    {existingRequest.adminResponse}
                  </p>
                </CardDescription>
              </CardHeader>
            </>
          )}

          {existingRequest.status === "approved" && (
            <>
              <Alert className="text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Request Approved</AlertTitle>
                <AlertDescription className="text-green-400">
                  Congratulations! Your request has been approved. You now have
                  employer access.
                </AlertDescription>
              </Alert>
              <CardHeader className="px-0">
                <div className="flex items-center justify-between">
                  <CardTitle>Admin Response</CardTitle>
                  {existingRequest.reviewedAt && (
                    <CardDescription>
                      Reviewed on{" "}
                      {existingRequest.reviewedAt
                        ? new Date(
                            existingRequest.reviewedAt,
                          ).toLocaleDateString()
                        : "N/A"}
                    </CardDescription>
                  )}
                </div>
                <CardDescription>
                  <p className="text-sm text-muted-foreground">
                    {existingRequest.adminResponse}
                  </p>
                </CardDescription>
              </CardHeader>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
