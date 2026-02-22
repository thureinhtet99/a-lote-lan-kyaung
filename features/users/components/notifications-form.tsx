"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  // FormMessage,
} from "@/components/ui/form";
import { userNotificationSettingsTable } from "@/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userNotificationSettingsSchema } from "../actions/schema";
import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/shared/loading-swap";
import z from "zod";
import { toast } from "sonner";
import { updateNotificationSetting } from "../actions/notification-actions";

export default function NotificationsForm({
  notificationSettings,
}: {
  notificationSettings?: Pick<
    typeof userNotificationSettingsTable.$inferSelect,
    "newJobEmailNotification"
  >;
}) {
  const form = useForm({
    resolver: zodResolver(userNotificationSettingsSchema),
    defaultValues: notificationSettings ?? {
      // aiPrompt: "",
      newJobEmailNotification: false,
    },
  });

  const onSubmit = async (
    data: z.infer<typeof userNotificationSettingsSchema>,
  ) => {
    const result = await updateNotificationSetting(data);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  };

  // const newJobEmailNotification = form.watch("newJobEmailNotification"); // To get values of notification in real-time

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border rounded-lg p-4 shadow-sm space-y-6">
          <FormField
            name="newJobEmailNotification"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Daily Email Notifications</FormLabel>
                    <FormDescription>
                      Receive emails about new job listings that match your
                      interests
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          {/* {newJobEmailNotification && (
            <FormField
              name="aiPrompt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-0.5">
                    <FormLabel>Filter Prompt</FormLabel>
                    <FormDescription>
                      Our AI will use this prompt to filter job listings and
                      only send you notifications for jobs that match your
                      criteria.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      className="min-h-32"
                      placeholder="Describe the jobs you're interested in. For example: 'I'm looking for remote frontend development positions that use React and pay at least $100k per year.'"
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank to receive notifications of all new job
                    listings.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )} */}
        </div>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Save Notification Settings
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
