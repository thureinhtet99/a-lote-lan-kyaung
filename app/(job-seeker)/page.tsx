import JobListingItem from "./components/job-listing-item";

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
