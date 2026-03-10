"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/auth-client";
import { useState, useTransition, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import { differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import { updateUser } from "@/features/users/db/user-db";

export default function ProfilePage() {
  const { data: session, refetch } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });

  // Sync form data with session
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
      });
    }
  }, [session?.user]);

  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateUser({ name: formData.name });
      if (result.success) {
        toast.success(result.message);
        setIsEditing(false);
        refetch();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
    });
    setIsEditing(false);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          Please{" "}
          <Link href={APP_ROUTES.SIGN_IN} className="underline text-primary">
            sign in
          </Link>{" "}
          to view your profile
        </p>
      </div>
    );
  }

  return (
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
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="gap-2 self-center sm:self-start"
          >
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2 self-center sm:self-start">
            <Button onClick={handleSave} disabled={isPending} className="gap-2">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="gap-2"
              disabled={isPending}
            >
              <X className="h-4 w-4" />
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
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                Username
              </Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-sm font-medium">{session.user?.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wide">
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
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Email Verified
              </span>
              <Badge
                variant={session.user?.emailVerified ? "default" : "secondary"}
              >
                {session.user?.emailVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
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
