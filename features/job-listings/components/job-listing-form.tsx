"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
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
  experienceLevels,
  jobListingTable,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/drizzle/schema";
import {
  formatExpLevel,
  formatJobType,
  formatLocationRequirement,
  formatWageInterval,
} from "@/features/job-listings/lib/formatters";
import { MarkdownEditor } from "@/components/markdown/markdown-editor";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createJobListing,
  updateJobListing,
} from "@/features/job-listings/db/job-listing-db";
import { jobListingFormSchema } from "@/features/job-listings/schema/job-listing-form-schema";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import cities from "@/constants/cities.json";
import { CityType } from "@/types/index.type";

const createDefaultValues: z.infer<typeof jobListingFormSchema> = {
  title: "",
  description: "",
  experienceLevel: "junior",
  locationRequirement: "on-site",
  type: "full-time",
  wage: 0,
  wageInterval: "monthly",
  state: "Myanmar",
  city: "",
};

export default function JobListingForm({
  jobListing,
}: {
  jobListing?: Pick<
    typeof jobListingTable.$inferSelect,
    | "id"
    | "title"
    | "wage"
    | "wageInterval"
    | "city"
    | "locationRequirement"
    | "type"
    | "experienceLevel"
    | "description"
  >;
}) {
  const router = useRouter();
  const isEditing = jobListing != null;
  const [markdownResetKey, setMarkdownResetKey] = useState(0);
  const form = useForm({
    resolver: zodResolver(jobListingFormSchema),
    defaultValues: jobListing ?? createDefaultValues,
  });

  const cityNames = (Object.values(cities) as CityType[])
    .map((item) => item.city)
    .sort((nameA, nameB) => nameA.localeCompare(nameB));

  const onSubmit = async (data: z.infer<typeof jobListingFormSchema>) => {
    const submitAction = jobListing
      ? updateJobListing.bind(null, jobListing.id)
      : createJobListing;

    const result = await submitAction(data);
    if (result.success) {
      toast.success(result.message);
      if (!isEditing) {
        form.reset(createDefaultValues);
        setMarkdownResetKey((prev) => prev + 1);
      }
      router.refresh();
    } else toast.error(result.message);
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 @container"
      >
        <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
          {/* Title */}
          <FormField
            name="title"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    value={field.value ?? ""}
                    placeholder="Enter job title"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Wage */}
          <FormField
            name="wage"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wage</FormLabel>
                <div className="flex">
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      value={field.value ?? ""}
                      className="rounded-r-none"
                      onChange={(e) =>
                        field.onChange(
                          isNaN(e.target.valueAsNumber)
                            ? null
                            : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>

                  {/* Wage Interval */}
                  <FormField
                    name="wageInterval"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(val) => field.onChange(val)}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-l-none">
                              / <SelectValue />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {wageIntervals.map((wageItv, index) => (
                              <SelectItem key={index} value={wageItv}>
                                {formatWageInterval(wageItv)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
          <div className="grid grid-cols-1 @xs:grid-cols-2 gap-x-2 gap-y-6 items-start">
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
          </div>

          {/* Location */}
          <FormField
            name="locationRequirement"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work mode</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
        </div>

        <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
          {/* Job type */}
          <FormField
            name="type"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Type</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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

          {/* LocationRequirement */}
          <FormField
            name="experienceLevel"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceLevels.map((exp, index) => (
                      <SelectItem key={index} value={exp}>
                        {formatExpLevel(exp)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <MarkdownEditor
                  key={markdownResetKey}
                  {...field}
                  markdown={field.value ?? ""}
                  placeholder="Enter description"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </form>
    </Form>
  );
}
