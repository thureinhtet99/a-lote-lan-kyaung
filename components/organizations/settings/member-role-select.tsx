"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateMemberRole } from "@/features/organizations/actions/update-member-role";
import { useState } from "react";
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
      newRole: newRole as "org-admin" | "hr",
    });

    if (result.success) {
      toast.success(result.message);
      onRoleChange();
    } else {
      toast.error(result.message || "Failed to update role");
    }
    setUpdating(false);
  }

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={updating}
    >
      <SelectTrigger className="w-[120px] h-auto border-none capitalize">
        <SelectValue>{currentRole}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="hr">Hr</SelectItem>
        <SelectItem value="org-admin">Org-Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
