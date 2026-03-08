import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Clock, Users } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import { getOrganizationDetailBySlug } from "@/features/organizations/db/organization-request-db";
import { Separator } from "@/components/ui/separator";
import JobListingBadges from "@/features/job-listings/components/job-listing-badges";
import DaySincePosting from "@/components/shared/day-since-posting";
import { Suspense } from "react";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getOrganizationDetailBySlug(slug);

  if (!result.success || !result.data) notFound();

  const org = result.data;
  const orgNameInitial =
    org.name
      .split(" ")
      .splice(0, 4)
      .map((word) => word[0])
      .join("") || "";

  return (
    <div className="min-h-screen">
      {/* Header banner */}
      <section className="px-6 py-10 border-b bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Avatar className="size-16 rounded-xl shadow">
            <AvatarImage src={org.logo ?? undefined} alt={org.name} />
            <AvatarFallback className="rounded-xl bg-primary text-white text-xl font-bold">
              {org.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{org.name}</h1>
            <p className="text-sm text-muted-foreground">@{org.slug}</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
        {/* Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" />
            <span>
              {org.members.length}{" "}
              {org.members.length === 1 ? "member" : "members"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="size-4" />
            <span>
              {org.jobListings.length} open{" "}
              {org.jobListings.length === 1 ? "position" : "positions"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>
              Since{" "}
              {new Date(org.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <Separator />

        {/* Job Listings */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Open Positions</h2>
          {org.jobListings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open positions at the moment
            </p>
          ) : (
            <div className="space-y-3">
              {org.jobListings.map((job) => (
                <Link
                  className="block"
                  key={job.id}
                  href={`${APP_ROUTES.JOB_LISTINGS.HOME}/${job.id}`}
                >
                  <Card className="@container overflow-hidden border-border/60 bg-background transition-all duration-200 hover:border-primary/60">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Avatar className="size-14">
                          <AvatarImage
                            src={org.logo ?? undefined}
                            alt={org.name}
                          />
                          <AvatarFallback className="uppercase bg-primary text-primary-foreground text-xl">
                            {orgNameInitial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <CardTitle className="text-base sm:text-lg font-semibold line-clamp-1">
                                {job.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground truncate">
                                {org.name}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {job.posted_at != null && (
                                <span className="text-sm text-muted-foreground">
                                  <Suspense
                                    fallback={
                                      job.posted_at
                                        ? new Date(
                                            job.posted_at,
                                          ).toLocaleDateString()
                                        : ""
                                    }
                                  >
                                    <DaySincePosting postedAt={job.posted_at} />
                                  </Suspense>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <JobListingBadges jobListing={job} />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
