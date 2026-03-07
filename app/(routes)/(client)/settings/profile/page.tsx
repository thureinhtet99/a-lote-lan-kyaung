"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, Edit, Save, X, Loader2 } from "lucide-react";
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
import { updateUser } from "@/features";

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
    <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={session.user?.image || undefined}
                  alt={session.user?.name || "User"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <CardTitle className="text-3xl">
                    {session.user?.name}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    {session.user?.role === "employer"
                      ? "Employer"
                      : session.user?.role === "admin"
                        ? "Administrator"
                        : "Job Seeker"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className={`bg-secondary ${session.session.userId ? "text-green-400" : "text-red-400"}`}
                  >
                    {session.session.userId ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">
                    {daySinceJoined(session.user?.createdAt)}
                  </Badge>
                </div>
              </div>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                <span className="hidden md:inline">Edit Profile</span>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isPending}
                  className="gap-2"
                >
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
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
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

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <p className="text-sm font-medium">{session.user?.email}</p>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Account Type
              </span>
              <Badge variant="outline" className="capitalize">
                {session.user?.role}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Email Verified
              </span>
              <Badge
                variant={session.user?.emailVerified ? "default" : "secondary"}
              >
                {session.user?.emailVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Member Since
              </span>
              <span className="text-sm">
                {new Date(session.user?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
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
