import JobListingItemSection from "@/features/job-listings/components/job-listing-item-section";
import { Briefcase, Building2, Building2Icon, Users } from "lucide-react";
import { Suspense } from "react";

export default async function ClientPage({
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
      </section>

      <JobListingItemSection searchParams={searchParams} />
    </div>
  );
}
