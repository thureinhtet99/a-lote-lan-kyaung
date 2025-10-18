import JobListingItem from "./_shared/JobListingItem";

export default function JobSeekerHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  return (
    <div className="m-4">
      <JobListingItem searchParams={searchParams} />
    </div>
  );
}
