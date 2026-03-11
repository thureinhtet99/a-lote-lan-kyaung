"use client";
import { useRouter } from "next/navigation";
import { updateUser } from "@/features/users/db/user-db";
import LoadingSwap from "@/components/shared/loading-swap";
import { userProfileSchema } from "@/features/users/schema/user-profile-schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserType } from "@/types/index.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, X } from "lucide-react";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { differenceInDays } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function UserProfileClient({
  session,
  userInitials,
}: {
  session: any;
  userInitials: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<Pick<UserType, "name">>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: Pick<UserType, "name">) => {
    startTransition(async () => {
      const result = await updateUser(values);
      if (result.success) {
        setIsEditing(false);
        toast.success(result.message);
        router.refresh();
      } else toast.error(result.message);
    });
  };

  const onEditProfile = () => {
    form.reset({ name: session.user?.name ?? "" });
    setIsEditing(true);
  };

  const onCancel = () => {
    form.reset({ name: session.user?.name ?? "" });
    setIsEditing(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
          {/* Header with Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage
                  src={session.user?.image || undefined}
                  alt={session.user?.name || "User"}
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold">
                  {session.user?.name}
                </h1>
                <p className="text-muted-foreground text-sm">
                  Joined {daySinceJoined(session.user?.createdAt)}
                </p>
              </div>
            </div>
            {!isEditing ? (
              <Button
                type="button"
                onClick={onEditProfile}
                variant="outline"
                className="gap-2 self-center sm:self-start"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2 self-center sm:self-start">
                <Button type="submit" disabled={isPending} className="gap-2">
                  <LoadingSwap isLoading={isPending} children="Save" />
                </Button>
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  className="gap-2"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Profile Information</h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground text-sm tracking-wide">
                          Username
                        </FormLabel>
                        {isEditing ? (
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="Enter your name"
                              disabled={isPending}
                            />
                          </FormControl>
                        ) : (
                          <p className="text-sm font-medium">
                            {session.user?.name}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                    Username
                  </Label>
                  {isEditing ? (
                    <Input
                      name="name"
                      content
                      //   value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-sm font-medium">{session.user?.name}</p>
                  )} */}
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm tracking-wide">
                    Email
                  </Label>
                  <p className="text-sm font-medium">{session.user?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Account Information</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm tracking-wide">
                    Email Verified
                  </span>
                  <Badge
                    variant={
                      session.user?.emailVerified ? "default" : "secondary"
                    }
                  >
                    {session.user?.emailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm tracking-wide">
                    Member Since
                  </span>
                  <span className="text-sm">
                    {new Date(session.user?.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

const daySinceJoined = (createdAt: Date) => {
  const daySincePosted = differenceInDays(createdAt, Date.now());
  if (daySincePosted === 0) {
    return "New";
  }

  return new Intl.RelativeTimeFormat(undefined, {
    style: "narrow",
    numeric: "always",
  }).format(daySincePosted, "days");
};
