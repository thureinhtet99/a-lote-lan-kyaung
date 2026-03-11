interface OrganizationInvitationEmailProps {
  invitedByName: string;
  invitedByEmail: string;
  organizationName: string;
  role: string;
  inviteUrl: string;
}

export function OrganizationInvitationEmail({
  invitedByName,
  invitedByEmail,
  organizationName,
  role,
  inviteUrl,
}: OrganizationInvitationEmailProps) {
  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .header h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin: 0 0 8px 0;
          }
          .content {
            margin-bottom: 32px;
          }
          .content p {
            margin: 0 0 16px 0;
            color: #4a4a4a;
          }
          .invite-details {
            background-color: #f8f9fa;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
          }
          .invite-details p {
            margin: 8px 0;
            font-size: 14px;
          }
          .invite-details strong {
            color: #1a1a1a;
          }
          .role-badge {
            background-color: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: capitalize;
          }
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            padding: 12px 32px;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 16px 0;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .footer {
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          .link {
            color: #3b82f6;
            text-decoration: none;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>You've been invited!</h1>
          </div>

          <div className="content">
            <p>
              <strong>{invitedByName}</strong> ({invitedByEmail}) has invited
              you to join <strong>{organizationName}</strong> as a{" "}
              <span className="role-badge">{role}</span>.
            </p>

            <div className="invite-details">
              <p>
                <strong>Organization:</strong> {organizationName}
              </p>
              <p>
                <strong>Role:</strong>{" "}
                {role === "org-admin" ? "Organization Admin" : "HR"}
              </p>
              <p>
                <strong>Invited by:</strong> {invitedByName} ({invitedByEmail})
              </p>
            </div>

            <p>
              {role === "org-admin"
                ? "As an Organization Admin, you'll have full access to manage organization members, settings, job listings, and applications."
                : "As an HR member, you'll be able to manage job listings and review applications for this organization."}
            </p>

            <div style={{ textAlign: "center" }}>
              <a href={inviteUrl} className="button">
                Accept Invitation
              </a>
            </div>

            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              If you don't want to join this organization, you can safely ignore
              this email. The invitation will expire in 7 days.
            </p>
          </div>

          <div className="footer">
            <p>This invitation was sent to you by {organizationName}.</p>
            <p>
              Having trouble with the button? Copy and paste this link into your
              browser:
              <br />
              <a href={inviteUrl} className="link">
                {inviteUrl}
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

export default OrganizationInvitationEmail;
