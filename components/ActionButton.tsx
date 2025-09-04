"use client";

import { ComponentPropsWithRef, useTransition } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import LoadingSwap from "./LoadingSwap";
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
import { APP_ROUTES } from "@/lib/appConfig";

export default function ActionButton({
  action,
  areYouSure = false,
  sureDescription = "This action can't be undone.",
  ...props
}: Omit<ComponentPropsWithRef<typeof Button>, "onClick"> & {
  action: () => Promise<{
    error: boolean;
    message?: string;
    deleted?: boolean;
  }>;
  areYouSure?: boolean;
  sureDescription?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const performAction = () => {
    startTransition(async () => {
      const { error, message, deleted } = await action();
      if (error) toast.error(message);
      else {
        toast.success(message);
        if (deleted) router.push(APP_ROUTES.EMPLOYER.HOME);
      }
    });
  };

  if (areYouSure) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button {...props} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>{sureDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={performAction}>
              <LoadingSwap isLoading={isPending}>Yes</LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button {...props} disabled={isPending} onClick={performAction}>
      <LoadingSwap
        isLoading={isPending}
        className="inline-flex items-center gap-2"
      >
        {props.children}
      </LoadingSwap>
    </Button>
  );
}
