import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OrganizationRequestForm } from "@/features/organizations/components/organization-request-form";
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
import { Suspense } from "react";
import Loading from "@/components/shared/loading";
import { APP_ROUTES } from "@/constants/app-config";
import { getMyOrganizationRequest } from "@/features/organizations/db/organization-request-db";
import Link from "next/link";

export default async function OrganizationRequestPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect(APP_ROUTES.SIGN_IN);

  // Only employers can request to create orgs
  if (session.user.role !== "employer") {
    return (
      <div className="space-y-6 px-6 py-6 md:px-9 md:py-9">
        <div>
          <h3 className="text-lg font-medium">Create Organization</h3>
          <p className="text-sm text-muted-foreground">
            Request to create a new organization
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

  const requestResult = await getMyOrganizationRequest();
  const existingRequest = requestResult.data;

  return (
    <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Create Organization
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Request to create a new organization on the platform
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
                      : "outline"
                }
                className={
                  existingRequest.status === "approved"
                    ? "bg-green-600 text-white"
                    : ""
                }
              >
                {existingRequest.status.charAt(0).toUpperCase() +
                  existingRequest.status.slice(1)}
              </Badge>
            </div>
            <CardDescription>
              Submitted on{" "}
              {new Date(existingRequest.createdAt).toLocaleDateString()}
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
            <div>
              <p className="text-sm font-medium">Your Message</p>
              <p className="text-sm text-muted-foreground">
                {existingRequest.requestMessage}
              </p>
            </div>

            {existingRequest.status === "pending" && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Under Review</AlertTitle>
                <AlertDescription>
                  Your organization request is being reviewed by an admin.
                </AlertDescription>
              </Alert>
            )}

            {existingRequest.status === "approved" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Approved!</AlertTitle>
                <AlertDescription>
                  {existingRequest.adminResponse ??
                    "Your organization has been created. You can find it in your employer dashboard."}
                </AlertDescription>
              </Alert>
            )}

            {existingRequest.status === "rejected" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Request Rejected</AlertTitle>
                <AlertDescription>
                  {existingRequest.adminResponse ??
                    "Your organization request was rejected by an admin."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : (
        <OrganizationRequestForm />
      )}
    </div>
  );
};
