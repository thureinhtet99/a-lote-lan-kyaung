import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building2, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import { getOrganizationDetailBySlug } from "@/features/organizations/db/organization-request-db";
import { Separator } from "@/components/ui/separator";
import JobApplyButton from "@/features/job-listings/components/job-apply-button";
import { formatDistanceToNow } from "date-fns";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getOrganizationDetailBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const org = result.data;

  return (
    <div className="min-h-screen">
      {/* Header banner */}
      <section className="px-6 py-8 border-b bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Avatar className="size-16 rounded-xl shadow">
            <AvatarImage src={org.logo ?? undefined} alt={org.name} />
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-xl font-bold">
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

        {/* Team */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Team</h2>
          {org.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {org.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Avatar className="size-9">
                    <AvatarImage
                      src={member.user.image ?? undefined}
                      alt={member.user.name}
                    />
                    <AvatarFallback className="text-xs font-medium">
                      {member.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.user.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs capitalize mt-0.5"
                    >
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
                <Card key={job.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{job.title}</CardTitle>
                        <CardDescription className="flex flex-wrap gap-1.5 mt-1.5">
                          <Badge
                            variant="secondary"
                            className="capitalize text-xs"
                          >
                            {job.type.replace("-", " ")}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="capitalize text-xs"
                          >
                            {job.locationRequirement}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="capitalize text-xs"
                          >
                            {job.experienceLevel}
                          </Badge>
                        </CardDescription>
                      </div>
                      <JobApplyButton jobListingId={job.id} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>
                        {job.wage.toLocaleString()}/{job.wageInterval}
                      </span>
                      {job.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {job.city}
                        </span>
                      )}
                      {job.posted_at && (
                        <span>
                          {formatDistanceToNow(new Date(job.posted_at), {
                            addSuffix: true,
                          })}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
