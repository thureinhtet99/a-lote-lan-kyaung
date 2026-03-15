import { APP_CONFIG } from "@/constants/app-config";

interface OrganizationInvitationEmailProps {
  invitedByEmail: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function OrganizationInvitationEmail({
  invitedByEmail,
  organizationName,
  role,
  inviteUrl,
}: OrganizationInvitationEmailProps) {
  const safeInvitedByEmail = escapeHtml(invitedByEmail);
  const safeOrganizationName = escapeHtml(organizationName);
  const safeRole = escapeHtml(
    role === "org-admin" ? "Organization Admin" : "HR",
  );
  const safeInviteUrl = escapeHtml(inviteUrl);
  const safeAppName = escapeHtml(APP_CONFIG.APP_NAME);

  return `
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invitation to ${safeAppName}</title>
      </head>
      <body style="margin:0;padding:24px;background:#f5f6f8;font-family:Arial,sans-serif;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:10px;padding:28px;">
          <tr>
            <td style="font-size:22px;font-weight:700;padding-bottom:8px;">Invitation to ${safeAppName}</td>
          </tr>
          <tr>
            <td style="font-size:15px;line-height:1.7;padding-bottom:12px;">Hi ${safeInvitedByEmail},</td>
          </tr>
          <tr>
            <td style="font-size:15px;line-height:1.7;padding-bottom:12px;">
              You have been invited to join <strong>${safeOrganizationName}</strong> as <strong>${safeRole}</strong>.
            </td>
          </tr>
          <tr>
            <td style="font-size:15px;line-height:1.7;padding-bottom:20px;">
              By accepting this invitation, you will gain access to the organization's resources and collaboration tools.
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:18px;">
              <a href="${safeInviteUrl}" style="display:inline-block;background:#5f51e8;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:14px;font-weight:600;">Accept Invitation</a>
            </td>
          </tr>
          <tr>
            <td style="font-size:13px;line-height:1.6;color:#6b7280;padding-bottom:10px;">If the button does not work, open this link:</td>
          </tr>
          <tr>
            <td style="font-size:12px;line-height:1.6;color:#6b7280;word-break:break-all;">
              <a href="${safeInviteUrl}" style="color:#5f51e8;text-decoration:underline;">${safeInviteUrl}</a>
            </td>
          </tr>
          <tr>
            <td style="font-size:14px;line-height:1.6;padding-top:24px;">Best,<br/>${safeOrganizationName}</td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export default OrganizationInvitationEmail;
