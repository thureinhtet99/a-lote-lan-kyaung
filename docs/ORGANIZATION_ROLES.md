# Organization Roles & Permissions

This document explains the role-based access control (RBAC) system implemented using better-auth's organization plugin.

## Overview

The application implements a three-tier role system for organizations:

- **Owner**: Full control over everything
- **Admin**: Full control except organization deletion and owner changes
- **Member** (User): Limited permissions for basic operations

## Roles & Permissions

### Owner Role

The owner has **full access** to all organization features:

#### Organization Permissions

- ✅ Create organizations
- ✅ Update organization details
- ✅ **Delete organizations** (Owner only)

#### Job Listing Permissions

- ✅ Create job listings
- ✅ Update job listings
- ✅ Delete job listings
- ✅ Change job listing status (publish/delist)

#### Application Permissions

- ✅ Read applications
- ✅ Update applications
- ✅ Change application ratings
- ✅ Change application status

#### Member Permissions

- ✅ Invite new members
- ✅ Remove members
- ✅ Update member roles

---

### Admin Role

Admins have full control except for organization deletion:

#### Organization Permissions

- ❌ Create organizations
- ✅ Update organization details
- ❌ **Delete organizations** (Owner only)

#### Job Listing Permissions

- ✅ Create job listings
- ✅ Update job listings
- ✅ Delete job listings
- ✅ Change job listing status (publish/delist)

#### Application Permissions

- ✅ Read applications
- ✅ Update applications
- ✅ Change application ratings
- ✅ Change application status

#### Member Permissions

- ✅ Invite new members
- ✅ Remove members
- ✅ Update member roles

---

### Member Role (User)

Members have limited permissions for day-to-day operations:

#### Organization Permissions

- ❌ Create organizations
- ❌ Update organization details
- ❌ Delete organizations

#### Job Listing Permissions

- ✅ Create job listings
- ✅ Update job listings
- ❌ Delete job listings
- ❌ Change job listing status

#### Application Permissions

- ✅ Read applications
- ✅ Update applications
- ❌ Change application ratings
- ❌ Change application status

#### Member Permissions

- ❌ Invite new members
- ❌ Remove members
- ❌ Update member roles

---

## Implementation Details

### Access Control Setup

The access control is defined in `/lib/utils/permissions.ts`:

```typescript
import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  organization: ["create", "update", "delete"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
} as const;

export const ac = createAccessControl(statement);

// Define roles
export const owner = ac.newRole({
  organization: ["create", "update", "delete"],
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
});

export const admin = ac.newRole({
  organization: ["update"], // No create or delete
  job_listing: ["create", "update", "delete", "change_status"],
  application: ["read", "update", "change_rating", "change_status"],
  member: ["invite", "remove", "update_role"],
});

export const user = ac.newRole({
  job_listing: ["create", "update"], // No delete or status change
  application: ["read", "update"], // No rating or status change
});
```

### Better-Auth Configuration

In `/lib/auth/auth.ts`:

```typescript
import { organization } from "better-auth/plugins";
import { ac, owner, admin, user } from "@/lib/utils/permissions";

export const auth = betterAuth({
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      ac,
      roles: {
        owner,
        admin,
        member: user, // Map 'user' role to 'member' in database
      },
    }),
  ],
});
```

### Client Configuration

In `/lib/auth/auth-client.ts`:

```typescript
import { organizationClient } from "better-auth/client/plugins";
import { ac, owner, admin, user } from "@/lib/utils/permissions";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac,
      roles: {
        owner,
        admin,
        member: user,
      },
    }),
  ],
});
```

## Using Permissions in Code

### Server-Side Permission Checks

```typescript
import { hasOrgUserPermission } from "@/lib/utils/permissions";

// Check if user can delete job listings
const canDelete = await hasOrgUserPermission("job_listing", ["delete"]);

// Check multiple permissions
const canManage = await hasOrgUserPermission("job_listing", [
  "create",
  "update",
  "delete",
]);
```

### Legacy Permission Helper (Backward Compatibility)

For existing code using the old permission string format:

```typescript
import { hasOrgUserPermissionLegacy } from "@/lib/utils/permissions";

// Old format: "resource.action"
const canCreate = await hasOrgUserPermissionLegacy("job_listing.create");
```

### Using Better-Auth API Directly

```typescript
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

const result = await auth.api.hasPermission({
  headers: await headers(),
  body: {
    permissions: {
      organization: ["delete"],
    },
  },
});

if (result.success) {
  // User has permission
}
```

### Check User Role

```typescript
import {
  getCurrentOrgRole,
  isOrgOwner,
  isOrgAdminOrOwner,
} from "@/lib/utils/permissions";

// Get current role
const role = await getCurrentOrgRole(); // Returns: "owner" | "admin" | "member" | null

// Check if owner
const isOwner = await isOrgOwner();

// Check if admin or owner
const isAdminOrOwner = await isOrgAdminOrOwner();
```

## UI Integration

### Organizations Page

The organizations page shows role badges and restricts delete action to owners only:

```tsx
// Role badge display
<Badge variant={getRoleBadgeVariant(org.role)}>
  {getRoleIcon(org.role)}
  <span className="ml-1 capitalize">{org.role}</span>
</Badge>;

// Delete button (only for owners)
{
  org.role === "owner" && (
    <DropdownMenuItem
      onClick={() => handleDeleteOrganization(org.id)}
      className="text-destructive"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>
  );
}
```

### Conditional Rendering

Use the `CheckCondition` component for conditional rendering:

```tsx
import CheckCondition from "@/components/shared/check-condition";
import { hasOrgUserPermissionLegacy } from "@/lib/utils/permissions";

<CheckCondition
  condition={() => hasOrgUserPermissionLegacy("job_listing.delete")}
>
  <DeleteButton />
</CheckCondition>;
```

## API Routes

### Creating Organizations

```typescript
// POST /api/organizations/create
// Uses better-auth's createOrganization method
const result = await auth.api.createOrganization({
  body: { name, slug },
  headers: await headers(),
});
```

### Deleting Organizations

```typescript
// DELETE /api/organizations/[id]
// Checks for owner permission before deletion
const hasPermission = await auth.api.hasPermission({
  headers: await headers(),
  body: { permissions: { organization: ["delete"] } },
});

if (hasPermission.success) {
  await auth.api.deleteOrganization({
    body: { organizationId: orgId },
    headers: await headers(),
  });
}
```

### Switching Organizations

```typescript
// POST /api/organizations/switch
await auth.api.setActiveOrganization({
  body: { organizationId },
  headers: await headers(),
});
```

## Database Schema

The role is stored in the `members` table:

```sql
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', or 'member'
  created_at TIMESTAMP NOT NULL
);
```

## Best Practices

1. **Always check permissions** before performing sensitive operations
2. **Use the new AC system** for new features
3. **Use legacy wrapper** for backward compatibility with existing code
4. **Set active organization** before checking permissions in API routes
5. **Display role badges** to make it clear to users what permissions they have
6. **Disable UI elements** that users don't have permission to use (don't just hide them)

## Migration Notes

- The role previously called "member" in code is now called "user" in the permissions system but still stored as "member" in the database
- The creator of an organization now gets the "owner" role by default (previously "admin")
- All permission checks have been updated to use the new better-auth AC system

## Testing Roles

To test different roles:

1. Create an organization (you'll be the owner)
2. Invite another user with admin or member role
3. Switch between accounts to test different permissions
4. Verify UI elements appear/disappear based on role
5. Test API endpoints return proper 403 errors for unauthorized actions
