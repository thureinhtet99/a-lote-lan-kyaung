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
import { Mail, UserPlus } from "lucide-react";
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

  async function handleResendInvitation() {
    const isValid = await form.trigger("email");

    if (!isValid) return;

    const email = form.getValues("email").trim().toLowerCase();

    setResending(true);

    const invitationsResult = await getInvitations();

    if (!invitationsResult.success) {
      toast.error(invitationsResult.message || "Failed to load invitations");
      setResending(false);
      return;
    }

    const invitation = invitationsResult.data.find(
      (item) => item.email.toLowerCase() === email,
    );

    if (!invitation) {
      toast.error(`No pending invitation found for ${email}`);
      setResending(false);
      return;
    }

    const result = await resendInvitation(invitation.id);

    if (result.success) {
      toast.success(result.message || "Invitation resent");
    } else {
      toast.error(result.message || "Failed to resend invitation");
    }

    setResending(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
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
                      disabled={form.formState.isSubmitting}
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
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendInvitation}
                disabled={form.formState.isSubmitting || resending}
              >
                <Mail className="h-4 w-4" />
                {resending ? "Resending..." : "Send via Email"}
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <LoadingSwap
                  isLoading={form.formState.isSubmitting}
                  children="Invite"
                />
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
