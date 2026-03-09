import { redirect } from "next/navigation";
import { OrganizationRequestForm } from "@/features/organizations/components/organization-request-form";
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
import { APP_ROUTES } from "@/constants/app-config";
import { getMyOrganizationRequest } from "@/features/organizations/db/organization-request-db";
import { getOrganizationsByEmployerId } from "@/features/organizations/db/organization-db";
import { getApprovedOrganizationNotification } from "@/features/organizations/db/notification-db";
import { ClaimOrganizationButton } from "@/features/organizations/components/claim-organization-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser, isEmployer } from "@/lib/auth/auth-helpers";
import PageLoading from "@/components/shared/page-loading";

export default async function OrganizationRequestPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const { user } = await getCurrentUser();
  if (!user) return redirect(APP_ROUTES.SIGN_IN);

  // Only employers can request to create orgs
  const isAlreadyEmployer = await isEmployer();
  if (!isAlreadyEmployer) {
    return (
      <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Organization Request
          </h2>
          <p className="text-sm text-muted-foreground">
            Request access to get organization features
          </p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Employer role required</AlertTitle>
          <AlertDescription className="flex items-center">
            You need to have the employer role before you can request to create
            an organization. Please{" "}
            <Link
              href={APP_ROUTES.SETTINGS.EMPLOYER_REQUEST}
              className="text-primary hover:underline"
            >
              {" "}
              request employer
            </Link>
            access first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user already has an organization
  const organizationsResult = await getOrganizationsByEmployerId();
  if (organizationsResult.success && organizationsResult.data.length > 0) {
    return (
      <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Organization Request
          </h2>
          <p className="text-sm text-muted-foreground">
            Request access to get organization features
          </p>
        </div>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>You already have organization</AlertTitle>
          <AlertDescription>
            Each employer can only have one organization.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={APP_ROUTES.EMPLOYER.MY_ORG}>View My Organization</Link>
        </Button>
      </div>
    );
  }

  const requestResult = await getMyOrganizationRequest();
  if (!requestResult.success || !requestResult.data) {
    return (
      <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Organization Request
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Request access to get organization features
          </p>
        </div>
        <OrganizationRequestForm />
      </div>
    );
  }

  const existingRequest = requestResult.data;

  // For approved requests, check if there's a notification to claim
  let approvedNotification = null;
  if (existingRequest.status === "approved") {
    const notificationResult = await getApprovedOrganizationNotification();
    if (notificationResult.success && notificationResult.data) {
      approvedNotification = notificationResult.data;
    }
  }

  return (
    <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Organization Request
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Request access to get organization features
        </p>
      </div>

      <Card>
        <CardHeader>
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
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Organization Name</p>
            <p className="text-sm text-muted-foreground">
              {existingRequest.orgName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Slug</p>
            <p className="text-sm text-muted-foreground">
              @{existingRequest.orgSlug}
            </p>
          </div>

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
                  Congratulations! Your request has been approved.
                  {approvedNotification
                    ? " Click the button below to claim your organization and start using organization features."
                    : " You can now access organization features."}
                </AlertDescription>
              </Alert>

              {/* Show claim button if there's an unclaimed notification */}
              {approvedNotification && approvedNotification.organizationId && (
                <ClaimOrganizationButton
                  notificationId={approvedNotification.id}
                  organizationId={approvedNotification.organizationId}
                />
              )}

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
        </CardContent>
      </Card>
    </div>
  );
};
