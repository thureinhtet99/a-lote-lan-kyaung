import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Building2Icon, Users } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import { getAllApprovedOrganizations } from "@/features/organizations/db/organization-request-db";
import Loading from "@/components/shared/loading";
import PageLoading from "@/components/shared/page-loading";

export default function OrganizationsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="h-[72px] px-6 border-b flex items-center justify-between gap-4 bg-gradient-to-r from-primary to-accent">
        <h1 className="text-lg md:text-xl font-bold text-white leading-tight truncate">
          Organizations
        </h1>
        <span className="inline-flex items-center gap-1.5 text-white text-xs font-medium shrink-0">
          <Building2Icon className="size-5" />
          Organizations hiring now
        </span>
      </section>

      <section className="p-6">
        <Suspense fallback={<PageLoading />}>
          <OrganizationsList />
        </Suspense>
      </section>
    </div>
  );
}

const OrganizationsList = async () => {
  const result = await getAllApprovedOrganizations();

  if (!result.success || result.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Building2 className="size-12 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-medium text-muted-foreground">
          No organizations yet
        </h2>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Organizations will appear here once approved
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">
          All Organizations
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {result.data.length} organization
          {result.data.length !== 1 ? "s" : ""} on the platform
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.data.map((org) => (
          <Link
            key={org.id}
            href={APP_ROUTES.ORGANIZATIONS.DETAIL(org.slug)}
            className="block group"
          >
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-lg">
                    <AvatarImage src={org.logo ?? undefined} alt={org.name} />
                    <AvatarFallback className="rounded-lg bg-primary text-white font-semibold">
                      {org.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">
                      {org.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      @{org.slug}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" />
                  <span>
                    {Number(org.memberCount)}{" "}
                    {Number(org.memberCount) === 1 ? "member" : "members"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
