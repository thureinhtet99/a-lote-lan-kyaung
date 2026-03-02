# Organization Member Management with Resend Email Integration

## 🎉 What's New

This update adds complete member management capabilities to the organization system, including:

1. **Email Invitations with Resend** - Professional email invitations sent via Resend
2. **Remove Members** - Organization admins can remove members
3. **Update Member Roles** - Switch members between HR and Org Admin roles
4. **Enhanced UI** - Dropdown menu with member actions

---

## 📧 Email Integration Setup

### 1. Get Your Resend API Key

1. Go to [https://resend.com](https://resend.com) and sign up
2. Navigate to **API Keys** in your dashboard
3. Click **Create API Key**
4. Copy your API key

### 2. Configure Your Domain (Optional but Recommended)

To send emails from your own domain instead of `onboarding@resend.dev`:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually takes a few minutes)
6. Use `invitations@yourdomain.com` or `noreply@yourdomain.com` as your from address

### 3. Add Environment Variables

Add these to your `.env` file:

```bash
# Resend (for email invitations)
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=invitations@yourdomain.com  # Or onboarding@resend.dev for testing
```

### 4. Test Your Integration

```bash
# Run the seed script to create test data
npm run db:seed

# Start the development server
npm run dev

# Login as an employer and try inviting a member
# Check your email inbox for the invitation
```

---

## 🚀 Features Guide

### Member Invitation Flow

1. **Org Admin invites a user**
   - Only users with `employer` role in the user table can be invited
   - Choose role: `HR` or `Org Admin`
   - Email is sent automatically via Resend

2. **User receives email**
   - Professional HTML email with organization details
   - Role description and permissions
   - Accepts or rejects invitation

3. **User accepts invitation**
   - Becomes a member with assigned role
   - Can access organization features based on role

### Role Permissions

#### **HR Role** (`hr`)

- Manage job listings
- Review applications
- View organization settings (read-only)

#### **Organization Admin Role** (`org-admin`)

- All HR permissions
- Invite new members
- Remove members
- Update member roles
- Full organization management

### Member Management Actions

**Remove Member:**

- Click the 3-dot menu (⋮) next to any member
- Select "Remove Member"
- Confirm in the dialog
- Member is removed and loses access

**Change Member Role:**

- Click the 3-dot menu next to any member
- Select "Change to HR" or "Change to Org Admin"
- Role is updated immediately
- Member's permissions change accordingly

**Restrictions:**

- Can't remove yourself
- Can't change your own role
- Only org-admins can perform these actions

---

## 📁 File Structure

```
lib/
  email/
    resend-client.ts              # Resend SDK initialization
    templates/
      organization-invitation.tsx  # HTML email template

services/
  email/
    send-invitation.ts            # Email sending logic

features/
  organizations/
    actions/
      remove-member.ts            # Remove member action
      update-member-role.ts       # Update role action
    components/
      members-table.tsx           # Enhanced table with actions
      invite-member-dialog.tsx    # Invitation dialog

drizzle/
  schema.ts                       # Updated with org roles
  migrations/
    0001_update_organization_roles.sql  # Migration file
```

---

## 🧪 Testing

### Test Accounts (from seed script)

```bash
# Employers (can create/manage organizations)
employer.one@test.com   # Password: Test123!
employer.two@test.com   # Password: Test123!
employer.three@test.com # Password: Test123!

# Users (can be invited to organizations)
user.one@test.com      # Password: Test123!
user.two@test.com      # Password: Test123!
```

### Testing Workflow

1. **Login as employer.one@test.com**
2. **Navigate to Members page** (`/employer/organizations/members`)
3. **Click "Invite Member"**
4. **Enter user.one@test.com and select "HR" role**
5. **Check the terminal logs** - you'll see the email send confirmation
6. **Check email inbox** for the invitation (if using real email)
7. **Test member actions:**
   - Change role from HR to Org Admin
   - Change back to HR
   - Remove the member

---

## 🎨 Email Template Customization

The email template is in [`lib/email/templates/organization-invitation.tsx`](lib/email/templates/organization-invitation.tsx).

**Customize:**

- Colors (change `#3b82f6` to your brand color)
- Logo (add `<img>` tag in header)
- Footer text
- Button styling
- Role descriptions

**Example - Add Logo:**

```tsx
<div className="header">
  <img
    src="https://yourdomain.com/logo.png"
    alt="Logo"
    style={{ width: "120px", marginBottom: "16px" }}
  />
  <h1>🎉 You've been invited!</h1>
</div>
```

---

## 🔧 Troubleshooting

### Email Not Sending

**Check these:**

1. **API Key Valid?**

   ```bash
   echo $RESEND_API_KEY
   # Should show: re_xxxxx...
   ```

2. **Environment Variables Loaded?**
   - Restart your dev server after adding vars
   - Check `.env` (not `.env.example`)

3. **Check Terminal Logs**

   ```
   ✅ Invitation email sent successfully: <message-id>
   # OR
   ❌ Failed to send invitation email: <error>
   ```

4. **Domain Issues?**
   - Use `onboarding@resend.dev` for testing
   - Verify your domain in Resend dashboard
   - Check DNS records are correct

### Resend API Errors

**Error: "Invalid API Key"**

- Double-check your API key in `.env`
- Make sure it starts with `re_`
- Create a new API key in Resend dashboard

**Error: "Domain not verified"**

- Use `onboarding@resend.dev` for testing
- Or complete domain verification in Resend

**Error: "Rate limit exceeded"**

- Free tier: 100 emails/day
- Upgrade plan or wait 24 hours

---

## 🌟 Best Practices

### Security

- ✅ Better-auth handles invitation validation
- ✅ Only employer-role users can be invited
- ✅ Only org-admins can manage members
- ✅ API keys stored in environment variables

### User Experience

- ✅ Clear role descriptions in emails
- ✅ Confirmation dialogs for destructive actions
- ✅ Toast notifications for success/errors
- ✅ Disabled states during async operations

### Email Deliverability

- ✅ Use verified domain for production
- ✅ Professional email design
- ✅ Clear call-to-action button
- ✅ Plain text fallback (Resend handles automatically)

---

## 📊 Monitoring

### Check Email Status

In Resend dashboard:

1. Go to **Logs**
2. See all sent emails
3. Check delivery status
4. View email content

### Database Queries

```sql
-- Check all invitations
SELECT * FROM invitations;

-- Check members by organization
SELECT m.*, u.name, u.email
FROM members m
JOIN users u ON m."userId" = u.id
WHERE m."organizationId" = 'your-org-id';

-- Check invitation acceptance rate
SELECT
  status,
  COUNT(*) as count
FROM invitations
GROUP BY status;
```

---

## 🚀 Next Steps

Consider adding:

1. **Resend Webhook** - Get real-time delivery status
2. **Email Templates for:**
   - Member removed notification
   - Role changed notification
   - Welcome email after accepting
3. **Invitation Analytics**
   - Track open rates
   - Track acceptance rates
4. **Batch Invitations** - Invite multiple users at once
5. **Custom Invitation Messages** - Let admins add personal note

---

## 📝 Migration Notes

The schema migration has been applied, updating:

- `members.role` enum: `["org-admin", "hr"]` (default: "hr")
- `invitations.role` enum: `["org-admin", "hr"]`

Old data with roles like "admin", "user", "employer" will need manual migration if it exists.

---

## 💡 Tips

1. **Testing Emails Locally**: Use [Mailpit](https://github.com/axllent/mailpit) or [MailHog](https://github.com/mailhog/MailHog) to catch outgoing emails
2. **Template Development**: Use [React Email](https://react.email) for better email components
3. **Analytics**: Track invitation metrics in your database
4. **Rate Limiting**: Implement rate limits on invitation endpoints
5. **Audit Logs**: Log all member management actions for compliance

---

## 🤝 Support

- [Resend Documentation](https://resend.com/docs)
- [Better-Auth Organization Docs](https://better-auth.com/docs/plugins/organization)
- [React Email](https://react.email) for advanced templates

---

**Happy coding! 🎉**
