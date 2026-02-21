"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Edit,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/auth-client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { APP_ROUTES } from "@/constants/app-config";
import { differenceInDays } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    location: "",
    bio: "",
    experience: "",
    education: "",
  });

  const userInitials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const handleSave = () => {
    // TODO: Implement save functionality
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
      location: "",
      bio: "",
      experience: "",
      education: "",
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
    <div className="container max-w-5xl mx-auto p-6 space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="">
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
                    Job Seeker
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
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Contact Information */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm font-medium">{session.user?.email}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                {isEditing ? (
                  <Input
                    type="tel"
                    placeholder="+95 9 XXX XXX XXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    {formData.phone || "Not provided"}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                {isEditing ? (
                  <Input
                    placeholder="Yangon, Myanmar"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    {formData.location || "Not provided"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Applications
                </span>
                <Badge className="bg-primary">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Saved Jobs
                </span>
                <Badge className="bg-secondary">0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Profile Views
                </span>
                <Badge className="bg-tertiary">0</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bio and Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  placeholder="Tell employers about yourself, your skills, and what you're looking for..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={5}
                  className="resize-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {formData.bio ||
                    "No bio provided yet. Click 'Edit Profile' to add information about yourself."}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  placeholder="Describe your work experience, previous roles, and achievements..."
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  rows={5}
                  className="resize-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {formData.experience ||
                    "No work experience added yet. Click 'Edit Profile' to add your professional background."}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  placeholder="List your educational qualifications, degrees, and certifications..."
                  value={formData.education}
                  onChange={(e) =>
                    setFormData({ ...formData, education: e.target.value })
                  }
                  rows={4}
                  className="resize-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {formData.education ||
                    "No education information added yet. Click 'Edit Profile' to add your educational background."}
                </p>
              )}
            </CardContent>
          </Card>
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
