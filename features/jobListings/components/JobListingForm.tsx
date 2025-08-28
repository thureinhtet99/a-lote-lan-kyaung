"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jobListingSchema } from "../actions/schemas";
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
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/drizzle/schema";
import {
  formatExpLevel,
  formatJobType,
  formatLocationRequirement,
  formatWageInterval,
} from "../lib/formatters";
import { StateSelectItems } from "./StateSelectItems";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";
import { createJobListing } from "../actions/actions";
import { toast } from "sonner";

const noneSelectedValue = "none";

export function JobListingForm() {
  const form = useForm({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      title: "",
      description: "",
      experienceLevel: "junior",
      locationRequirement: "on-site",
      type: "full-time",
      wage: 0,
      wageInterval: "monthly",
      stateAbbreviation: "",
      city: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof jobListingSchema>) => {
    const res = await createJobListing(data);
    console.log("response", res);

    if (res.error) {
      toast("Event has been created.");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 @container"
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
                  <Input {...field} />
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
                            : e.target.valueAsNumber
                        )
                      }
                    />
                  </FormControl>

                  <FormField
                    name="wageInterval"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(val) => field.onChange(val)}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-l-none">
                              / <SelectValue placeholder="" />
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
                <FormDescription>optional</FormDescription>
                {/* <FormMessage /> */}
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
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              name="stateAbbreviation"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) =>
                      field.onChange(val === noneSelectedValue ? null : val)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {field.value != null && (
                        <SelectItem
                          value={noneSelectedValue}
                          className="text-red-500"
                        >
                          Clear
                        </SelectItem>
                      )}
                      <StateSelectItems />
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          {/* LocationRequirement */}
          <FormField
            name="locationRequirement"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Requirement</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
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

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <MarkdownEditor {...field} markdown={field.value ?? ""} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {/* {form.formState.isSubmitting} */}
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Create Job Listing
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
