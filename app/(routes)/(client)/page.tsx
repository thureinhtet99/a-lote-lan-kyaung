import JobListingItem from "@/features/job-listings/components/job-listing-item";
import { Briefcase, Users } from "lucide-react";

export default function ClientPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="h-[72px] px-6 border-b flex items-center justify-between gap-4 bg-gradient-to-r from-primary to-accent">
        <h1 className="text-lg md:text-xl font-bold text-white leading-tight truncate">
          Find Your Dream Job
        </h1>

        <div className="flex items-center gap-6 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-white text-xs font-medium">
            <Briefcase className="size-3" />
            1000+ <span className="hidden md:inline">Active Jobs</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-white text-xs font-medium">
            <Users className="size-3" />
            500+ <span className="hidden md:inline">Organizations</span>
          </span>
        </div>
      </section>

      {/* Listings */}
      <section className="p-6 flex-1">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-foreground">
            Latest Openings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Newest opportunities first
          </p>
        </div>
        <JobListingItem searchParams={searchParams} />
      </section>
    </div>
  );
}
