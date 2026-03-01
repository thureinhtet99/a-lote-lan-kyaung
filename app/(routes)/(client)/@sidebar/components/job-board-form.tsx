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
import {
  formatExpLevel,
  formatJobType,
  formatLocationRequirement,
} from "@/features/job-listings/lib/formatters";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useSidebar } from "@/components/ui/sidebar";
import { jobBoardFormSchema } from "../job-board-form-schema";
import z from "zod";
import { Loader2Icon } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import cities from "@/constants/cities.json";
import { Suspense } from "react";
import { CityType } from "@/types/index.type";

const ANY_VALUE = "any";

export default function JobBoardForm() {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
}

const SuspendedComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const cityNames = (Object.values(cities) as CityType[])
    .map((item) => item.city)
    .sort((nameA, nameB) => nameA.localeCompare(nameB));

  const form = useForm({
    resolver: zodResolver(jobBoardFormSchema),
    defaultValues: {
      title: searchParams.get("title") ?? "",
      city: searchParams.get("city") ?? ANY_VALUE,
      locationRequirement:
        (searchParams.get("location") as LocationRequirementType) ?? ANY_VALUE,
      experienceLevel:
        (searchParams.get("experience") as ExperienceLevelType) ?? ANY_VALUE,
      type: (searchParams.get("type") as JobListingTypeType) ?? ANY_VALUE,
    },
  });

  const onSubmit = async (data: z.infer<typeof jobBoardFormSchema>) => {
    const newParams = new URLSearchParams();

    if (data.title) newParams.set("title", data.title);

    if (data.locationRequirement && data.locationRequirement !== ANY_VALUE)
      newParams.set("location", data.locationRequirement);

    if (data.city && data.city !== ANY_VALUE) newParams.set("city", data.city);

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
                <Input {...field} placeholder="Enter job title..." />
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
              <FormLabel>Work mode</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>any</SelectItem>
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
              <Combobox
                items={cityNames}
                autoHighlight
                value={field.value}
                onValueChange={field.onChange}
              >
                <ComboboxInput showClear placeholder="Select a city" />
                <ComboboxContent>
                  <ComboboxEmpty>No city found.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
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
                  <SelectItem value={ANY_VALUE}>any</SelectItem>
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
                  <SelectItem value={ANY_VALUE}>any</SelectItem>
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
          {form.formState.isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>
    </Form>
  );
};
