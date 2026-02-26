"use client";

import { ComponentPropsWithRef, useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingSwap from "@/components/shared/loading-swap";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/constants/app-config";

export default function ActionButton({
  action,
  areYouSure = false,
  sureDescription = "This action can't be undone.",
  ...props
}: Omit<ComponentPropsWithRef<typeof Button>, "onClick"> & {
  action: () => Promise<{
    success: boolean;
    message?: string;
    deleted?: boolean;
  }>;
  areYouSure?: boolean;
  sureDescription?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const performAction = () => {
    startTransition(async () => {
      const { success, message } = await action();
      if (success) {
        toast.success(message);
        router.push(APP_ROUTES.EMPLOYER.HOME);
      } else {
        toast.error(message);
      }
    });
  };

  if (areYouSure) {
    return (
      <AlertDialog
        open={open}
        onOpenChange={(v) => {
          if (!isPending) setOpen(v);
        }}
      >
        <AlertDialogTrigger asChild>
          <Button
            className="cursor-pointer"
            {...props}
            onClick={() => setOpen(true)}
          />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>{sureDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer"
              disabled={isPending}
              onClick={async () => {
                performAction();
                // Do not close dialog while loading
              }}
            >
              <LoadingSwap isLoading={isPending}>Yes</LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button
      className="cursor-pointer"
      {...props}
      disabled={isPending}
      onClick={performAction}
    >
      <LoadingSwap
        isLoading={isPending}
        className="inline-flex items-center gap-2"
      >
        {props.children}
      </LoadingSwap>
    </Button>
  );
}
