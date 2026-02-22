"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JobListingTypeType,
  experienceLevels,
  jobListingTypes,
  ExperienceLevelType,
  locationRequirements,
  LocationRequirementType,
} from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  formatExpLevel,
  formatJobType,
  formatLocationRequirement,
} from "@/features/job-listings/lib/formatters";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/shared/loading-swap";
import { Form } from "@/components/ui/form";
import { useSidebar } from "@/components/ui/sidebar";
import { StateSelectItems } from "./state-select-items";

const ANY_VALUE = "any";

// Schema
const jobListingFilterSchema = z.object({
  title: z.string().optional(),
  locationRequirement: z
    .enum(locationRequirements)
    .or(z.literal(ANY_VALUE))
    .optional(),
  city: z.string().optional(),
  state: z.string().or(z.literal(ANY_VALUE)).optional(),
  type: z.enum(jobListingTypes).or(z.literal(ANY_VALUE)).optional(),
  experienceLevel: z.enum(experienceLevels).or(z.literal(ANY_VALUE)).optional(),
});

export default function JobListingFilterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  // Job listing filter schema form
  const form = useForm({
    resolver: zodResolver(jobListingFilterSchema),
    defaultValues: {
      title: searchParams.get("title") ?? "",
      city: searchParams.get("city") ?? "",
      locationRequirement:
        (searchParams.get("location") as LocationRequirementType) ?? ANY_VALUE,
      state: searchParams.get("state") ?? ANY_VALUE,
      experienceLevel:
        (searchParams.get("experience") as ExperienceLevelType) ?? ANY_VALUE,
      type: (searchParams.get("type") as JobListingTypeType) ?? ANY_VALUE,
    },
  });

  const onSubmit = async (data: z.infer<typeof jobListingFilterSchema>) => {
    const newParams = new URLSearchParams();

    if (data.title) newParams.set("title", data.title);
    if (data.city) newParams.set("city", data.city);

    if (data.locationRequirement && data.locationRequirement !== ANY_VALUE)
      newParams.set("location", data.locationRequirement);

    if (data.state && data.state !== ANY_VALUE)
      newParams.set("state", data.state);

    if (data.experienceLevel && data.experienceLevel !== ANY_VALUE)
      newParams.set("experience", data.experienceLevel);

    if (data.type && data.type !== ANY_VALUE) newParams.set("type", data.type);

    router.push(`${pathname}?${newParams.toString()}`);
    setOpenMobile(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 @container"
      >
        {/* Title */}
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          name="locationRequirement"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {locationRequirements.map((require, index) => (
                    <SelectItem key={index} value={require}>
                      {formatLocationRequirement(require)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* City */}
        <FormField
          name="city"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* State */}
        <FormField
          name="state"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  <StateSelectItems />
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Type */}
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {jobListingTypes.map((type, index) => (
                    <SelectItem key={index} value={type}>
                      {formatJobType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Experience level */}
        <FormField
          name="experienceLevel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience level</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  {experienceLevels.map((level, index) => (
                    <SelectItem key={index} value={level}>
                      {formatExpLevel(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Filter
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
