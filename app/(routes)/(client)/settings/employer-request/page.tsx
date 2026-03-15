import { EmployerRequestForm } from "@/features/admin/components/employer-request-form";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Suspense } from "react";
import { getEmployerRequest } from "@/features/users/db/user-db";
import { getCurrentUser, isEmployer } from "@/lib/auth/auth-helpers";
import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/constants/app-config";
import PageLoading from "@/components/shared/page-loading";

export default async function EmployerRequestPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { user } = await getCurrentUser();
  if (!user) return redirect(APP_ROUTES.SIGN_IN);

  const isAlreadyEmployer = await isEmployer();
  if (isAlreadyEmployer) {
    return (
      <div className="space-y-6 px-6 md:px-8 py-6 md:py-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Employer Request
          </h2>
          <p className="text-sm text-muted-foreground">
            Request access to get employer features
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
          <h2 className="text-2xl font-bold tracking-tight">
            Employer Request
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Request access to get employer features
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
        <h2 className="text-2xl font-bold tracking-tight">Employer Request</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Request access to employer features
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <CardTitle>Your Request Status</CardTitle>
          <CardDescription>
            Submitted on{" "}
            {new Date(existingRequest.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </CardDescription>
        </div>
        <CardDescription>
          <p className="text-sm text-muted-foreground">
            {existingRequest.requestMessage}
          </p>
        </CardDescription>
      </div>
      <div className="space-y-4">
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
                      ? new Date(existingRequest.reviewedAt).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          },
                        )
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
                      ? new Date(existingRequest.reviewedAt).toLocaleString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          },
                        )
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
      </div>
    </div>
  );
};
