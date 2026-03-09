"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { claimOrganization } from "@/features/organizations/db/notification-db";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LoadingSwap from "@/components/shared/loading-swap";

interface ClaimOrganizationButtonProps {
  notificationId: string;
  organizationId: string;
}

export function ClaimOrganizationButton({
  notificationId,
  organizationId,
}: ClaimOrganizationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClaimOrganization = () => {
    startTransition(async () => {
      const result = await claimOrganization(notificationId, organizationId);
      if (result.success) {
        toast.success(result.message);
        router.push("/employer");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Button
      onClick={handleClaimOrganization}
      disabled={isPending}
      className="w-full cursor-pointer"
    >
      <ExternalLink className="h-4 w-4" />
      <LoadingSwap isLoading={isPending} children="Claim" />
    </Button>
  );
}
