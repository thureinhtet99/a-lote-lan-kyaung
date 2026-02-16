import JobListingItem from "@/components/job-listings/job-listing-item";
import { Briefcase, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function JobSeekerHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Find Your Dream Job in Myanmar
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Connect with top employers and discover opportunities across
              Myanmar
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
            <Card className="border-primary/20 bg-background/80 backdrop-blur">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">1000+</p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 bg-background/80 backdrop-blur">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">500+</p>
                  <p className="text-sm text-muted-foreground">Companies</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-tertiary/20 bg-background/80 backdrop-blur">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-lg bg-tertiary/10">
                  <TrendingUp className="h-6 w-6 text-tertiary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-tertiary">5000+</p>
                  <p className="text-sm text-muted-foreground">Job Seekers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Job Listings Section */}
      <section className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Latest Job Openings
          </h2>
          <p className="text-muted-foreground">
            Browse through our newest opportunities
          </p>
        </div>
        <JobListingItem searchParams={searchParams} />
      </section>
    </div>
  );
}
