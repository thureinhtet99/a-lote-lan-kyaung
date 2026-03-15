import { createGmailTransporter } from "@/lib/email/nodemailer-client";
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
    const transporter = createGmailTransporter();

    const info = await transporter.sendMail({
      from: organizationName,
      to: email,
      subject: `Invitation to join ${organizationName}`,
      html: OrganizationInvitationEmail({
        invitedByEmail,
        organizationName,
        role,
        inviteUrl,
      }),
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw error;
  }
}
