"use client";

import {
  Activity as ActivityIcon,
  Users,
  Briefcase,
  Mail,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

// Mock data for demonstration
// In a real app, you'd fetch this from a database or API
const mockActivities = [
  {
    id: 1,
    type: "member_added",
    description: "John Doe joined the organization",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    icon: Users,
  },
  {
    id: 2,
    type: "job_created",
    description: "Created new job listing: Senior Developer",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: Briefcase,
  },
  {
    id: 3,
    type: "invitation_sent",
    description: "Sent invitation to admin@example.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    icon: Mail,
  },
  {
    id: 4,
    type: "role_changed",
    description: "Updated Jane Smith's role to Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    icon: Shield,
  },
  {
    id: 5,
    type: "member_removed",
    description: "Removed Bob Johnson from organization",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    icon: Users,
  },
];

export function ActivityLog() {
  if (mockActivities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ActivityIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mockActivities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div
            key={activity.id}
            className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
          >
            <div className="mt-1 rounded-full bg-muted p-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(activity.timestamp)}
              </p>
            </div>
          </div>
        );
      })}

      <div className="pt-4">
        <p className="text-xs text-center text-muted-foreground">
          Showing recent activity from the last 7 days
        </p>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  return format(date, "MMM d, yyyy 'at' h:mm a");
}
