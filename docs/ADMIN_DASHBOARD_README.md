# Admin Dashboard & Role-Based Access Control

This document outlines the new admin dashboard and role-based access control system implemented using Better-auth.

## Overview

The system now includes:

- **3 User Roles**: User, Employer, and Admin
- **Admin Dashboard**: For user management and employer request approval
- **Employer Request System**: Users can request to become employers
- **Role-Based Permissions**: Different access levels for different roles
- **User Banning**: Admins can ban/unban users

## User Roles

### 1. User (Default Role)

- **Description**: Basic user with limited permissions
- **Default Role**: Yes - all new users start as "user"
- **Permissions**:
  - View and apply for job listings
  - Manage their own profile and resume
  - Request employer access
  - View job applications

### 2. Employer

- **Description**: Users who can create and manage organizations
- **How to Get**:
  1. Request from Settings → Employer Access
  2. Admin approves the request
- **Permissions**:
  - All User permissions
  - Create and manage organizations
  - Invite members to organizations
  - Post and manage job listings
  - View and manage applications
  - Access employer dashboard

### 3. Admin

- **Description**: System administrators with full access
- **How to Get**: Manually set in database (for security)
- **Permissions**:
  - All Employer permissions
  - Access admin dashboard
  - View all users
  - Change user roles
  - Ban/unban users
  - Approve/reject employer requests
  - Full system access

## Admin Dashboard

Access: `/admin` (Admin role required)

### Features

#### 1. Overview Page (`/admin`)

- **Statistics Dashboard**:
  - Total users count
  - Total employers count
  - Total admins count
  - Pending employer requests count

#### 2. User Management (`/admin/users`)

- **View All Users**: Table with user information
- **Change User Roles**: Set users as User, Employer, or Admin
- **Ban Users**: Temporarily or permanently ban users with reason
- **Unban Users**: Remove ban from users
- **User Details**: View user info, email, role, status, join date

#### 3. Employer Requests (`/admin/employer-requests`)

- **Pending Requests**: View all pending employer access requests
- **Request Details**: User info, request message, date
- **Approve Requests**: Approve with optional admin response
- **Reject Requests**: Reject with required reason
- **Review History**: View all approved/rejected requests

## Employer Request System

### For Users

#### 1. Request Employer Access

**Location**: Settings → Employer Access (`/settings/employer-request`)

**Process**:

1. Navigate to Settings → Employer Access
2. Fill out request form with reason (10-500 characters)
3. Submit request
4. Wait for admin review
5. Receive notification when reviewed

**Request States**:

- **Pending**: Waiting for admin review
- **Approved**: Access granted, user role updated to "employer"
- **Rejected**: Request denied with admin feedback

### For Admins

#### 1. Review Requests

**Location**: Admin Dashboard → Employer Requests

**Options**:

- **Approve**: Grant employer access
  - Optional: Add admin response message
  - User role automatically updated to "employer"
  - User can now create organizations
- **Reject**: Deny employer access
  - Required: Provide rejection reason
  - User can submit a new request later

## Organization & Member Management

### Organization Permissions

Only users with **Employer** or **Admin** role can create organizations.

### Organization Roles

Within organizations, members have roles:

- **Owner**: Full control, can delete organization
- **Admin**: Manage listings and members, cannot delete org
- **Member**: Create/edit listings, limited permissions

### Inviting Members

**Updated System**: Members must be registered users

**Process**:

1. Employer invites member by email
2. System checks if user is registered
3. If not registered: Error message shown
4. If registered: Invitation sent
5. Invited user can accept/decline

**Error Message**: "User with email {email} is not registered yet. Please ask them to create an account first."

## User Banning System

### Ban Features

- **Reason**: Required when banning a user
- **Expiration**: Optional - set ban expiry date or permanent
- **Ban Page**: Banned users redirected to `/banned` page
- **Automatic Expiry**: Expired bans automatically lift

### Admin Actions

1. Go to Admin → Users
2. Click actions menu on user
3. Select "Ban User"
4. Provide ban reason
5. Optionally set expiry date
6. Confirm

### User Experience When Banned

- Redirected to `/banned` page
- See ban reason and expiry (if set)
- Can sign out
- Cannot access any protected routes

## Database Schema Changes

### New Fields in `users` Table

```sql
role text DEFAULT 'user' NOT NULL  -- 'user' | 'employer' | 'admin'
banned boolean                     -- Is user banned
ban_reason text                    -- Reason for ban
ban_expires timestamp              -- When ban expires (null = permanent)
```

### New `employer_requests` Table

```sql
id text PRIMARY KEY
user_id text REFERENCES users(id)
status text DEFAULT 'pending'      -- 'pending' | 'approved' | 'rejected'
request_message text               -- User's request message
admin_response text                -- Admin's response
reviewed_by text REFERENCES users(id)
reviewed_at timestamp
created_at timestamp
updated_at timestamp
```

## API Endpoints

All admin actions use Better-auth's built-in security:

### User Management Actions

- `getAllUsers()` - Get all users (admin only)
- `updateUserRole(userId, role)` - Change user role (admin only)
- `banUser(userId, reason, expiresAt?)` - Ban user (admin only)
- `unbanUser(userId)` - Unban user (admin only)

### Employer Request Actions

- `createEmployerRequest(data)` - Submit employer request (user)
- `getEmployerRequests()` - Get all requests (admin only)
- `getUserEmployerRequest()` - Get user's own request (user)
- `approveEmployerRequest(requestId, adminResponse?)` - Approve (admin only)
- `rejectEmployerRequest(requestId, adminResponse)` - Reject (admin only)

### Helper Functions

- `isAdmin()` - Check if current user is admin
- `isEmployer()` - Check if current user is employer
- `isUser()` - Check if current user is regular user
- `getUserRole()` - Get current user's role
- `isBanned()` - Check if current user is banned

## Middleware Protection

Routes are protected in [middleware.ts](middleware.ts):

```typescript
// Public routes: anyone can access
["/sign-in", "/sign-up", "/", "/job-listings"][
  // Employer routes: employer or admin only
  "/employer/*"
][
  // Admin routes: admin only
  "/admin/*"
];

// Banned users redirected to /banned
```

## Test Accounts

After running `npm run db:seed`:

### Admin Account

- Email: `admin@test.com`
- Password: `Test123!`
- Role: Admin
- Access: Full system access

### Employer Accounts

- `owner@test.com` - John Owner (has organizations)
- `jane.owner@test.com` - Jane Owner (has organizations)
- `employer@test.com` - Alice Employer
- `bob.employer@test.com` - Bob Employer

### Regular User Accounts

- `user@test.com` - Charlie User
- `member@test.com` - Diana Member (member of organization)
- `tom.member@test.com` - Tom Member (member of organization)
- `pending@test.com` - Has pending employer request
- `rejected@test.com` - Has rejected employer request

All passwords: `Test123!`

## Usage Guide

### Setting Up

1. **Run Migrations**:

   ```bash
   npm run db:restart
   ```

2. **Seed Database**:

   ```bash
   npm run db:seed
   ```

3. **Start Dev Server**:
   ```bash
   npm run dev
   ```

### Testing the System

#### As Admin

1. Sign in as `admin@test.com`
2. Navigate to `/admin`
3. View dashboard statistics
4. Go to "Users" to manage user roles
5. Go to "Employer Requests" to review pending requests
6. Approve the pending request from `pending@test.com`
7. Try banning/unbanning a user

#### As Regular User

1. Sign in as `user@test.com`
2. Navigate to Settings → Employer Access
3. Submit employer request with a message
4. Sign out and sign in as admin
5. Approve the request
6. Sign back as user - should now have employer access

#### As Employer

1. Sign in as `owner@test.com`
2. Access `/employer` dashboard
3. Create/manage organizations
4. Post job listings
5. Try inviting a non-registered email (should see error)
6. Invite a registered user (e.g., `user@test.com`)

#### Testing Member Invitations

1. As employer, try inviting `nonexistent@example.com` → Error
2. Invite `user@test.com` → Success (user is registered)

## Security Considerations

1. **Admin Role**: Should only be set manually in production
2. **Employer Requests**: All requests logged for audit trail
3. **Ban System**: Includes reason and optional expiry
4. **Middleware Protection**: Routes protected at middleware level
5. **Better-auth Integration**: Uses Better-auth's security features
6. **Permission Checks**: Server-side validation on all actions

## Future Enhancements

Potential improvements:

- Email notifications for employer request status
- Payment integration for premium employer features
- Activity logs for admin actions
- Bulk user management
- Advanced filtering for user/request tables
- Export user/request data
- User suspension (temporary access removal without full ban)
- Self-service ban appeals

## Files Modified/Created

### New Files

- `/app/admin/layout.tsx` - Admin dashboard layout
- `/app/admin/page.tsx` - Admin overview
- `/app/admin/users/page.tsx` - User management page
- `/app/admin/employer-requests/page.tsx` - Employer requests page
- `/app/banned/page.tsx` - Banned user page
- `/app/(job-seeker)/settings/employer-request/page.tsx` - Employer request form
- `/features/employer-requests/actions/*.ts` - Employer request actions
- `/features/employer-requests/components/*.tsx` - Employer request components
- `/features/users/actions/manage-users.ts` - User management actions
- `/features/users/components/users-table.tsx` - User management UI
- `/components/ui/alert.tsx` - Alert component

### Modified Files

- `/drizzle/schemas/auth-schema.ts` - Added role, ban fields, employer_requests table
- `/lib/auth/auth.ts` - Added admin plugin, employer creation restriction
- `/lib/auth/auth-client.ts` - Added admin client plugin
- `/lib/auth/auth-helpers.ts` - Added role checking functions
- `/lib/utils/access-control.ts` - Updated roles (removed user, added admin)
- `/middleware.ts` - Added role-based route protection
- `/drizzle/seed.ts` - Updated with new roles and sample data
- `/config/app-config.ts` - Added admin and employer request routes
- `/features/organizations/actions/invite-member.ts` - Check for registered users

## Support

For issues or questions, refer to:

- [Better-auth Documentation](https://www.better-auth.com/docs)
- [Better-auth Admin Plugin](https://www.better-auth.com/docs/plugins/admin)
