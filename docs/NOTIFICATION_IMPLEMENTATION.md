# Organization Notification System Implementation Guide

## Overview

A complete notification system for organization approval/rejection with a claim functionality using `activeOrganizationId` from the session table.

## What Was Implemented

### 1. Database Schema (`/drizzle/schemas/notification-schema.ts`)

- Created `notificationTable` with fields:
  - `id`, `userId`, `type`, `title`, `message`
  - `organizationId` (to link approved org)
  - `isRead`, `readAt`, `createdAt`
  - Indexes on `userId` and `isRead` for performance

### 2. Database Functions (`/features/organizations/db/notification-db.ts`)

- `createNotification()` - Internal function to create notifications
- `getUserNotifications()` - Fetch all notifications for current user
- `getUnreadNotificationsCount()` - Get count of unread notifications
- `markNotificationAsRead()` - Mark single notification as read
- `markAllNotificationsAsRead()` - Mark all as read
- `claimOrganization()` - **Main function** to set `activeOrganizationId` in session
- `deleteNotification()` - Optional delete function

### 3. Integration with Organization Approval

Updated `/features/organizations/db/organization-request-db.ts`:

- `approveOrganizationRequest()` now creates a notification after approval
- `rejectOrganizationRequest()` now creates a notification after rejection

### 4. UI Components

- `notification-bell.tsx` - Client component with dropdown UI
- `notification-bell-wrapper.tsx` - Server wrapper component

## How to Use

### Step 1: Run Migration

Generate and run the migration for the new notification table:

```bash
npx drizzle-kit generate --name add_notifications
npx drizzle-kit migrate
```

### Step 2: Add Notification Bell to UI

You can add the notification bell to any layout. Common places:

#### Option A: Add to Sidebar (Recommended)

Find your sidebar component (e.g., `components/layout/sidebar/`) and add:

```tsx
import NotificationBellWrapper from "@/features/organizations/components/notification-bell-wrapper";

// Inside your sidebar component
<NotificationBellWrapper />;
```

#### Option B: Add to App Layout

In `app/(routes)/(client)/layout.tsx` or similar:

```tsx
import NotificationBellWrapper from "@/features/organizations/components/notification-bell-wrapper";

export default function ClientLayout({ children }) {
  return (
    <div>
      <header>
        {/* Your existing header content */}
        <NotificationBellWrapper />
      </header>
      {children}
    </div>
  );
}
```

### Step 3: Test the Flow

1. **Admin Approves Organization:**
   - Go to admin panel → Organization Requests
   - Approve a pending request
   - Notification is automatically created for the employer

2. **Employer Receives Notification:**
   - Employer logs in and sees notification bell with badge
   - Clicks bell to see notification with "Claim Organization" button

3. **Employer Claims Organization:**
   - Clicks "Claim Organization" button
   - System sets `activeOrganizationId` in their session
   - They're redirected to employer dashboard with full access
   - Notification is marked as read

## The Claim Process

The `claimOrganization()` function:

1. Verifies the notification belongs to the user
2. Verifies the organization exists and is linked to the notification
3. Calls `auth.api.setActiveOrganization()` to set `activeOrganizationId` in session
4. Marks notification as read
5. Returns success message

This ensures the employer can only claim organizations they were approved for.

## Should You Delete Notification Data?

### Recommendation: **NO, Keep the Data**

Here's why:

#### Reasons to Keep Notifications:

1. **Audit Trail** - Shows history of when organizations were claimed
2. **User Reference** - Employers can review past notifications
3. **Debugging** - Easier to troubleshoot issues if history exists
4. **Re-claim Capability** - If something goes wrong, they can claim again
5. **No Performance Impact** - Millions of notifications won't slow the system

#### If Storage Becomes a Concern:

Instead of deleting immediately, consider:

```typescript
// Option 1: Archive old notifications (90+ days old)
export const archiveOldNotifications = async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  await db
    .update(notificationTable)
    .set({ archived: true })
    .where(
      and(
        eq(notificationTable.isRead, true),
        lt(notificationTable.readAt, cutoffDate),
      ),
    );
};

// Option 2: Allow users to delete manually
// (Already implemented - deleteNotification function)

// Option 3: Periodic cleanup of read notifications older than 1 year
// Run as a cron job or scheduled task
```

#### Best Practice:

```typescript
// Add this to your notification schema if you want archiving:
archived: boolean("archived").default(false).notNull(),

// Then filter archived notifications from the UI:
const notifications = await db
  .select()
  .from(notificationTable)
  .where(
    and(
      eq(notificationTable.userId, userId),
      eq(notificationTable.archived, false)
    )
  );
```

## Additional Features You Can Add

### 1. Real-time Notifications

Add polling or WebSocket to refresh notifications:

```typescript
// In notification-bell.tsx
useEffect(() => {
  const interval = setInterval(refreshNotifications, 30000); // Every 30s
  return () => clearInterval(interval);
}, []);
```

### 2. Notification Preferences

Let users choose notification types:

```typescript
export const userNotificationPreferences = {
  organizationApproved: true,
  organizationRejected: true,
  newJobApplication: true,
  // etc.
};
```

### 3. Email Notifications

Send email when notification is created:

```typescript
// In createNotification()
if (type === "organization_approved") {
  await sendEmail({
    to: userEmail,
    subject: title,
    body: message,
  });
}
```

## Files Created/Modified

### Created:

- `/drizzle/schemas/notification-schema.ts`
- `/features/organizations/db/notification-db.ts`
- `/features/organizations/components/notification-bell.tsx`
- `/features/organizations/components/notification-bell-wrapper.tsx`

### Modified:

- `/drizzle/schema.ts` - Added notification schema export
- `/features/organizations/db/organization-request-db.ts` - Added notification creation

## Summary

✅ Notifications are created when admin approves/rejects organization requests
✅ Employers can view notifications in a dropdown bell UI
✅ Employers can claim organizations using the `activeOrganizationId` mechanism
✅ Notifications are marked as read after claiming
✅ Optional delete functionality exists

**Recommendation:** Keep notification data for audit purposes. Add archiving only if storage becomes a concern (unlikely).
