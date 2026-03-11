"use client";

import LoadingSwap from "@/components/shared/loading-swap";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { inviteMember } from "@/features/organizations/actions/invite-member";
import {
  getInvitations,
  resendInvitation,
} from "@/features/organizations/actions/manage-invitations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, PlusIcon, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["org-admin", "hr"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function MemberInviteDialog() {
  const [open, setOpen] = useState(false);
  const [resending, setResending] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "hr",
    },
  });

  const isBusy = form.formState.isSubmitting || resending;

  async function onSubmit(data: InviteFormData) {
    const result = await inviteMember(data);

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      form.reset();
    } else {
      toast.error(result.message);
    }
  }

  async function handleEmailInvitation() {
    const isValid = await form.trigger("email");
    if (!isValid) return;

    const email = form.getValues("email").trim().toLowerCase();

    setResending(true);

    try {
      const invitationsResult = await getInvitations();

      if (!invitationsResult.success) {
        toast.error(invitationsResult.message || "Failed to load invitations");
        return;
      }

      const invitation = invitationsResult.data.find(
        (item) =>
          item.email.toLowerCase() === email && item.status === "pending",
      );

      if (invitation) {
        const resendResult = await resendInvitation(invitation.id, email);
        if (resendResult.success) {
          toast.success(resendResult.message || "Invitation resent");
        } else {
          toast.error(resendResult.message || "Failed to resend invitation");
        }
        return;
      }

      const inviteResult = await inviteMember({ email, role: "hr" });
      if (inviteResult.success) {
        toast.success(inviteResult.message || `Invitation sent to ${email}`);
        form.reset();
      } else {
        toast.error(inviteResult.message || "Failed to send invitation");
      }
    } finally {
      setResending(false);
      setOpen(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isBusy) return;
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(event) => {
          if (isBusy) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isBusy) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization. The invited user must
            already have the <strong className="text-black">employer</strong>{" "}
            role to accept the invitation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="member@example.com"
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleEmailInvitation}
                disabled={isBusy}
              >
                <Mail className="h-4 w-4" />
                <LoadingSwap isLoading={isBusy} children="Send via Email" />
              </Button>
              <Button type="submit" disabled={isBusy}>
                <LoadingSwap
                  isLoading={isBusy}
                  children={
                    <>
                      <PlusIcon className="h-4 w-4" />
                      Invite
                    </>
                  }
                />
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
