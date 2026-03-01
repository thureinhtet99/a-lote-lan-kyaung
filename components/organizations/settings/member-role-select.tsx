"use client";

import { useState } from "react";
import { updateMemberRole } from "@/features/organizations/actions/update-member-role";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type MemberRoleSelectProps = {
  memberId: string;
  currentRole: string;
  onRoleChange: () => void;
};

export function MemberRoleSelect({
  memberId,
  currentRole,
  onRoleChange,
}: MemberRoleSelectProps) {
  const [updating, setUpdating] = useState(false);

  async function handleRoleChange(newRole: string) {
    if (newRole === currentRole) return;

    setUpdating(true);
    const result = await updateMemberRole({
      memberId,
      newRole: newRole as "employer" | "user",
    });

    if (result.success) {
      toast.success(result.message);
      onRoleChange();
    } else {
      toast.error(result.message || "Failed to update role");
    }
    setUpdating(false);
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case "admin":
        return "default";
      case "employer":
        return "secondary";
      default:
        return "outline";
    }
  }

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={updating}
    >
      <SelectTrigger className="w-[120px] h-auto p-0 border-none">
        <SelectValue>
          <Badge variant={getRoleBadgeVariant(currentRole)}>
            {currentRole}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">
          <Badge variant="outline">user</Badge>
        </SelectItem>
        <SelectItem value="employer">
          <Badge variant="secondary">employer</Badge>
        </SelectItem>
        <SelectItem value="admin" disabled>
          <Badge variant="default">admin</Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
