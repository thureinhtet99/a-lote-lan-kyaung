import { resend } from "@/lib/email/resend-client";
import { OrganizationInvitationEmail } from "@/lib/email/templates/organization-invitation";

interface SendInvitationEmailParams {
  email: string;
  invitedByEmail: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
}

export async function sendInvitationEmail({
  email,
  invitedByEmail,
  organizationName,
  role,
  inviteUrl,
}: SendInvitationEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!!,
      to: email,
      subject: `Invitation to join ${organizationName}`,
      html: OrganizationInvitationEmail({
        invitedByEmail,
        organizationName,
        role,
        inviteUrl,
      }),
    });

    if (error) {
      console.error("Failed to send invitation email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw error;
  }
}
