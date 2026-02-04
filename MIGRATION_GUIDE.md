# Migration from Clerk to Better-Auth - Complete Guide

This document provides a comprehensive overview of the migration from Clerk authentication to better-auth, including all changes made to the job portal application.

## Table of Contents

1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Database Schema Changes](#database-schema-changes)
4. [Authentication Setup](#authentication-setup)
5. [API Routes](#api-routes)
6. [Component Updates](#component-updates)
7. [Environment Variables](#environment-variables)
8. [Migration Steps](#migration-steps)
9. [Important Notes](#important-notes)

---

## Overview

The application has been migrated from Clerk authentication to better-auth, a modern, lightweight authentication solution that provides more control and flexibility. The migration includes:

- Complete authentication flow (sign-in, sign-up, sign-out)
- Organization management (create, list, switch, delete)
- Role-based permissions system
- Updated database schema to support better-auth

---

## What Changed

### Files Removed

- `app/(clerk)/` - Entire directory removed
- `services/clerk/` - Entire directory removed
- `drizzle/schema/user-schema.ts` - Replaced with better-auth schema
- `drizzle/schema/organization-schema.ts` - Replaced with better-auth schema

### Files Added

#### Authentication

- `lib/auth.ts` - Better-auth server configuration
- `lib/auth-client.ts` - Better-auth client hooks
- `lib/auth-helpers.ts` - Helper functions for getting current user/org
- `lib/org-user-permission.ts` - Permission checking logic
- `app/api/auth/[...all]/route.ts` - Better-auth API endpoint

#### UI Components

- `app/(auth)/sign-in/page.tsx` - Custom sign-in page
- `app/(auth)/sign-up/page.tsx` - Custom sign-up page
- `app/(auth)/layout.tsx` - Auth pages layout
- `app/(auth)/organizations/page.tsx` - Organization management page
- `components/auth/AuthButtons.tsx` - Sign-out button component

#### Database Schema

- `drizzle/schema/auth-schema.ts` - User, session, account, verification tables
- `drizzle/schema/better-auth-organization-schema.ts` - Organization, member, invitation tables

#### API Routes

- `app/api/organizations/route.ts` - List user's organizations
- `app/api/organizations/[id]/route.ts` - Delete organization

### Files Modified

#### Core Files

- `middleware.ts` - Updated to use better-auth session checking
- `app/layout.tsx` - Removed ClerkProvider
- `package.json` - Removed Clerk packages, added better-auth
- `.env.example` - Updated environment variables
- `.gitignore` - Removed Clerk-specific entries

#### Schema Files

- `drizzle/schema.ts` - Updated exports
- `drizzle/schema/user-resume-schema.ts` - Updated foreign key references
- `drizzle/schema/user-notification-setting-schema.ts` - Updated foreign key references
- `drizzle/schema/organization-user-setting-schema.ts` - Updated foreign key references
- `drizzle/schema/job-listing-schema.ts` - Updated foreign key references
- `drizzle/schema/job-listing-application-schema.ts` - Updated foreign key references

#### Action Files

- `features/jobListings/actions.ts` - Updated imports and permission checks
- `features/jobListings/lib/plan-feature-helpers.ts` - Simplified plan checking
- `features/jobListingApplications/actions/actions.ts` - Updated imports and permission checks
- `features/users/actions/notificationActions.ts` - Updated imports

#### Component Files

- `features/users/components/sidebar-user-button.tsx` - Updated imports
- `features/users/components/_sidebar-user-button-client.tsx` - Removed Clerk hooks
- `features/organizations/components/sidebar-org-button.tsx` - Updated imports
- `features/organizations/components/_sidebar-org-button-client.tsx` - Removed Clerk hooks
- `components/PricingTable.tsx` - Removed Clerk pricing table

#### Types

- `types/index.type.ts` - Updated UserPermissionType and UserType

---

## Database Schema Changes

### Authentication Tables (Better-Auth)

#### `user` table

```typescript
{
  id: text(PK);
  name: text;
  email: text(unique);
  emailVerified: boolean;
  image: text;
  firstName: text;
  lastName: text;
  username: text(unique);
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

#### `session` table

```typescript
{
  id: text (PK)
  expiresAt: timestamp
  token: text (unique)
  createdAt: timestamp
  updatedAt: timestamp
  ipAddress: text
  userAgent: text
  userId: text (FK -> user.id)
  activeOrganizationId: text (stored in session)
}
```

#### `account` table

```typescript
{
  id: text (PK)
  accountId: text
  providerId: text
  userId: text (FK -> user.id)
  accessToken: text
  refreshToken: text
  idToken: text
  password: text (hashed)
  // ... other OAuth fields
}
```

#### `verification` table

```typescript
{
  id: text(PK);
  identifier: text;
  value: text;
  expiresAt: timestamp;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Organization Tables (Better-Auth Plugin)

#### `organization` table

```typescript
{
  id: text(PK);
  name: text;
  slug: text(unique);
  logo: text;
  createdAt: timestamp;
  updatedAt: timestamp;
  metadata: text;
}
```

#### `member` table

```typescript
{
  id: text (PK)
  organizationId: text (FK -> organization.id)
  userId: text (FK -> user.id)
  role: text ('admin' | 'member')
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `invitation` table

```typescript
{
  id: text (PK)
  organizationId: text (FK -> organization.id)
  email: text
  role: text
  status: text
  expiresAt: timestamp
  inviterId: text (FK -> user.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Updated Application Tables

All application tables (`job_listings`, `job_listing_applications`, `user_resumes`, etc.) now reference the new `user` and `organization` tables instead of the old Clerk-based tables.

---

## Authentication Setup

### Server Configuration (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 3,
    }),
  ],
  user: {
    additionalFields: {
      firstName: { type: "string", required: true },
      lastName: { type: "string", required: true },
      username: { type: "string", required: true, unique: true },
    },
  },
});
```

### Client Configuration (`lib/auth-client.ts`)

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
```

### Helper Functions (`lib/auth-helpers.ts`)

- `getCurrentUser()` - Get current authenticated user
- `getCurrentOrg()` - Get current active organization
- `getSession()` - Get current session

### Permission System (`lib/org-user-permission.ts`)

Role-based permissions:

- **Admin**: Full access (create, update, delete listings, manage members)
- **Member**: Limited access (create, update listings, view applications)

Permissions:

- `org:job_listing:create`
- `org:job_listing:update`
- `org:job_listing:delete`
- `org:application:read`
- `org:application:update`
- `org:member:invite`
- `org:member:remove`

---

## API Routes

### Authentication API

- `POST /api/auth/sign-in` - Sign in with email/password
- `POST /api/auth/sign-up` - Create new account
- `POST /api/auth/sign-out` - Sign out current user
- `GET /api/auth/session` - Get current session

### Organization API

- `GET /api/organizations` - List user's organizations
- `POST /api/organizations` - Create new organization (via better-auth client)
- `DELETE /api/organizations/[id]` - Delete organization (admin only)

---

## Component Updates

### Sign-In Page (`app/(auth)/sign-in/page.tsx`)

- Custom form with email and password fields
- Error handling with toast notifications
- Redirect to home after successful sign-in

### Sign-Up Page (`app/(auth)/sign-up/page.tsx`)

- Custom registration form with:
  - First Name
  - Last Name
  - Username
  - Email
  - Password (with confirmation)
- Validation and error handling
- Redirect to sign-in after successful registration

### Organizations Page (`app/(auth)/organizations/page.tsx`)

- List all user's organizations
- Create new organization
- Switch between organizations
- Delete organization (admin only)

### Sidebar Components

- Updated to use better-auth helpers
- Removed Clerk-specific hooks (`useClerk`)
- Custom profile navigation

---

## Environment Variables

### Required Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL=postgres://postgres:password@localhost:5432/jobportal

# Better Auth
BETTER_AUTH_SECRET=your_secret_key_here_min_32_characters_long
BETTER_AUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Uploadthing
UPLOADTHING_TOKEN=YOUR_UPLOADTHING_TOKEN
```

### Generate Secret Key

```bash
openssl rand -base64 32
```

---

## Migration Steps

### 1. Install Dependencies

```bash
npm install better-auth bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2. Remove Old Dependencies

```bash
npm uninstall @clerk/clerk-sdk-node @clerk/nextjs @clerk/themes
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Edit `.env` and add your values, especially `BETTER_AUTH_SECRET`.

### 4. Update Database Schema

The schema files have already been updated. Now generate and run migrations:

```bash
# Drop existing tables (WARNING: This will delete all data!)
npm run db:drop

# Generate new migration
npm run db:generate

# Run migration
npm run db:migrate

# Or use push for development
npm run db:push
```

### 5. Seed Database (Optional)

If you have a seed file, update it to work with the new schema and run:

```bash
npm run db:seed
```

### 6. Test the Application

```bash
npm run dev
```

Visit http://localhost:3000 and test:

1. Sign up with a new account
2. Sign in
3. Create an organization
4. Switch between organizations
5. Test job listing creation (if you're an admin)

---

## Important Notes

### Data Migration

⚠️ **WARNING**: This migration requires dropping and recreating database tables. **All existing data will be lost**.

If you need to preserve existing data, you'll need to:

1. Export data from old Clerk-based tables
2. Transform the data to match new schema
3. Import into new better-auth tables

### User ID Changes

- Old Clerk user IDs were strings like `user_xxxxx`
- Better-auth generates UUIDs or custom IDs
- All foreign key references have been updated

### Session Management

- Sessions are now managed by better-auth
- Session data includes `activeOrganizationId` for organization context
- Sessions are stored in the database

### Organization Context

- Users can be members of multiple organizations
- Active organization is stored in session
- Switch organizations via the organizations page or sidebar

### Permissions

- Permissions are now role-based (admin/member)
- Check permissions using `hasOrgUserPermission()`
- Extend roles/permissions in `lib/org-user-permission.ts`

### Pricing/Plans

- Clerk's pricing table has been removed
- Current implementation uses simple limits (50 published jobs, 3 featured)
- Implement custom pricing system as needed in `components/PricingTable.tsx`

### Email Verification

- Currently disabled (`requireEmailVerification: false`)
- Enable in `lib/auth.ts` if needed
- Configure email provider (see better-auth docs)

### Password Requirements

- Minimum 8 characters (enforced in sign-up form)
- Add more requirements as needed

---

## Troubleshooting

### Common Issues

**Issue**: "Unauthorized" error when accessing protected routes

- **Solution**: Make sure you're signed in and have a valid session

**Issue**: Cannot create organization

- **Solution**: Check that organization plugin is enabled in `lib/auth.ts`

**Issue**: Database connection errors

- **Solution**: Verify `DATABASE_URL` in `.env` is correct

**Issue**: Session not persisting

- **Solution**: Check `BETTER_AUTH_SECRET` is set and at least 32 characters

### Debug Tips

1. Check server logs for detailed error messages
2. Use browser DevTools Network tab to inspect API calls
3. Verify database tables were created correctly using `npm run db:studio`
4. Check session data in the database `session` table

---

## Next Steps

### Recommended Enhancements

1. **Email Verification**: Enable and configure email verification
2. **OAuth Providers**: Add Google, GitHub, etc. sign-in options
3. **Password Reset**: Implement forgot password functionality
4. **Two-Factor Authentication**: Add 2FA for enhanced security
5. **Custom Pricing**: Implement subscription/pricing system
6. **Organization Invitations**: Enable inviting users to organizations
7. **Role Management**: Add more granular roles and permissions
8. **Audit Logs**: Track user and organization actions

### Resources

- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Better-Auth Next.js Integration](https://www.better-auth.com/docs/integrations/next)
- [Better-Auth Organization Plugin](https://www.better-auth.com/docs/plugins/organization)

---

## Support

For issues or questions:

1. Check the better-auth documentation
2. Review this migration guide
3. Inspect server and browser console logs
4. Check database schema and data

---

**Migration Date**: February 4, 2026
**Better-Auth Version**: Latest
**Next.js Version**: 15.4.7
