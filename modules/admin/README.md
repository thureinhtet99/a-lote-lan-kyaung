# Admin Module

This module contains all administrative functionality for the job portal application.

## Features

### User Management (`/user-management`)

Handles all user-related administrative tasks:

- **View all users**: Display paginated list of all users
- **Ban/Unban users**: Suspend or restore user accounts
- **Update user roles**: Change user roles (job_seeker, employer, admin)
- **User statistics**: View user activity and metrics
- **Notification preferences**: Manage user notification settings

**Key Files:**

- `components/users-table.tsx` - Main user management table
- `actions/ban-user.ts` - Ban user server action
- `db/users-db.ts` - User database queries

### Employer Requests (`/employer-requests`)

Manages employer account requests:

- **View requests**: List all pending employer requests
- **Approve requests**: Approve employer account creation
- **Reject requests**: Reject employer requests with reason
- **Request statistics**: Track approval/rejection metrics

**Key Files:**

- `components/employer-requests-table.tsx` - Employer requests table
- `actions/approve-employer-request.ts` - Approval action
- `actions/reject-employer-request.ts` - Rejection action

### Dashboard (`/dashboard`)

Admin overview and statistics:

- **System metrics**: User counts, job listings, applications
- **Recent activity**: Latest system activities
- **Quick actions**: Common admin tasks

## Usage Example

```typescript
// In a Next.js page
import { UsersTable } from '@/modules/admin/user-management';

export default function AdminUsersPage() {
  return <UsersTable />;
}
```

## File Structure

```
/admin
├── user-management/
│   ├── components/
│   ├── actions/
│   ├── db/
│   ├── types/
│   └── index.ts
├── employer-requests/
│   ├── components/
│   ├── actions/
│   ├── validations/
│   └── index.ts
├── dashboard/
│   ├── components/
│   ├── pages/
│   └── index.ts
└── components/      # Shared admin components
```

## Permissions

All admin module features require the `admin` role.

## Routes

- `/admin` - Dashboard
- `/admin/users` - User management
- `/admin/employer-requests` - Employer requests

## Dependencies

- **Shared Module**: UI components, data tables
- **Auth Module**: Authentication and authorization
- **Database**: User and employer request tables

## Testing

```bash
# Run admin module tests
npm test -- admin
```

## Contributing

When adding new admin features:

1. Create feature subfolder in `/admin`
2. Follow the standard module structure
3. Export public API in `index.ts`
4. Update this README
