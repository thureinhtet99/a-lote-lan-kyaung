# Module Index

Quick reference guide for all modules in the job portal application.

## Module Overview

| Module         | Path                  | Purpose                  | Key Features                                           |
| -------------- | --------------------- | ------------------------ | ------------------------------------------------------ |
| **Admin**      | `/modules/admin`      | Administrative functions | User management, employer approvals, system monitoring |
| **Employer**   | `/modules/employer`   | Employer features        | Job listings, organizations, subscriptions             |
| **Job Seeker** | `/modules/job-seeker` | Job seeker features      | Job browsing, applications, profile                    |
| **Auth**       | `/modules/auth`       | Authentication           | Sign in/up, session management                         |
| **Shared**     | `/modules/shared`     | Common utilities         | UI components, hooks, utilities                        |

---

## Admin Module

**Location:** `/modules/admin`

### Sub-modules

#### User Management

- **Path:** `/modules/admin/user-management`
- **Features:** Ban/unban users, role management, user statistics
- **Components:** UsersTable, NotificationsForm
- **Routes:** `/admin/users`

#### Employer Requests

- **Path:** `/modules/admin/employer-requests`
- **Features:** Approve/reject employer account requests
- **Components:** EmployerRequestsTable, EmployerRequestForm
- **Routes:** `/admin/employer-requests`

#### Dashboard

- **Path:** `/modules/admin/dashboard`
- **Features:** Admin statistics, system overview
- **Routes:** `/admin`

**Usage:**

```typescript
import { UsersTable } from "@/modules/admin/user-management";
import { EmployerRequestsTable } from "@/modules/admin/employer-requests";
```

---

## Employer Module

**Location:** `/modules/employer`

### Sub-modules

#### Job Listings

- **Path:** `/modules/employer/job-listings`
- **Features:** Create, edit, publish, delete job postings
- **Components:** JobListingForm, JobListingItem
- **Routes:** `/employer/job-listings/*`

#### Organizations

- **Path:** `/modules/employer/organizations`
- **Features:** Organization management, team members, roles
- **Components:** SidebarOrgButton, StatusToggleButton
- **Routes:** `/employer/organizations/*`

#### Pricing

- **Path:** `/modules/employer/pricing`
- **Features:** Subscription plans, billing
- **Components:** PricingTable
- **Routes:** `/employer/pricing`

#### Dashboard

- **Path:** `/modules/employer/dashboard`
- **Features:** Employer metrics, active listings
- **Routes:** `/employer`

**Usage:**

```typescript
import { createJobListing } from "@/modules/employer/job-listings";
import { getUserOrganizationsDb } from "@/modules/employer/organizations";
```

---

## Job Seeker Module

**Location:** `/modules/job-seeker`

### Sub-modules

#### Job Listings

- **Path:** `/modules/job-seeker/job-listings`
- **Features:** Browse jobs, search, filter
- **Routes:** `/`, `/job-listings/[id]`

#### Applications

- **Path:** `/modules/job-seeker/applications`
- **Features:** Apply for jobs, track applications
- **Components:** ApplicationTable, NewJobListingApplicationForm
- **Routes:** N/A (embedded in job listings)

#### Profile

- **Path:** `/modules/job-seeker/profile`
- **Features:** Edit profile, upload photo
- **Routes:** `/settings/profile`

#### Resume

- **Path:** `/modules/job-seeker/resume`
- **Features:** Upload/manage resume
- **Routes:** `/settings/resume`

#### Settings

- **Path:** `/modules/job-seeker/settings`
- **Features:** User preferences, notifications
- **Routes:** `/settings/*`

**Usage:**

```typescript
import { ApplicationTable } from "@/modules/job-seeker/applications";
import { createJobListingApplication } from "@/modules/job-seeker/applications";
```

---

## Auth Module

**Location:** `/modules/auth`

### Features

- Sign in/Sign up
- Session management
- Auth buttons and status
- Protected routes

**Components:**

- `AuthButtons` - Sign in/out buttons
- `AuthStatus` - Display auth state

**Routes:**

- `/sign-in`
- `/sign-up`

**Usage:**

```typescript
import { SignInButton, SignOutButton } from "@/modules/auth";
import { auth } from "@/modules/auth/lib/auth";

// Check session
const session = await auth.api.getSession({ headers });
```

---

## Shared Module

**Location:** `/modules/shared`

### Components

#### UI Components

- **Path:** `/modules/shared/components/ui`
- **Components:** Button, Input, Select, Dialog, Avatar, Badge, Card, etc.
- **Usage:** `import { Button } from '@/modules/shared/components/ui/button'`

#### Data Table

- **Path:** `/modules/shared/components/data-table`
- **Components:** DataTable, sortable headers, filters, pagination
- **Usage:** `import { DataTable } from '@/modules/shared/components/data-table/DataTable'`

#### Markdown

- **Path:** `/modules/shared/components/markdown`
- **Components:** MarkdownEditor, MarkdownRenderer
- **Usage:** `import { MarkdownEditor } from '@/modules/shared/components/markdown/markdown-editor'`

#### Common Components

- ActionButton
- CheckCondition
- Loading
- LoadingSwap
- Logo
- PricingTable
- StatCard

### Hooks

- `use-async-action` - Handle async operations
- `use-breakpoint` - Responsive breakpoints
- `use-darkmode` - Dark mode toggle
- `use-mobile` - Mobile detection
- `use-sign-out` - Sign out functionality

**Usage:**

```typescript
import { useMobile } from "@/modules/shared/hooks/use-mobile";
import { cn } from "@/modules/shared/lib/utils";
```

---

## Module Dependencies

### Dependency Graph

```
┌─────────────┐
│   Shared    │◄─────────────┐
└─────────────┘              │
      ▲                      │
      │                      │
┌─────┴──────┬──────────────┼──────────┐
│            │              │          │
│            │              │          │
┌───────┐ ┌────────┐ ┌──────────┐ ┌─────┐
│ Admin │ │Employer│ │Job Seeker│ │Auth │
└───────┘ └────────┘ └──────────┘ └─────┘
```

**Rules:**

- All modules can depend on **Shared** and **Auth**
- Feature modules (Admin, Employer, Job Seeker) should not depend on each other
- Extract common code to Shared module

---

## Quick Reference

### Import Patterns

```typescript
// ✅ Good - Import from module index
import { UsersTable } from "@/modules/admin/user-management";
import { Button } from "@/modules/shared/components/ui/button";

// ❌ Bad - Import internal files directly
import { UsersTable } from "@/modules/admin/user-management/components/users-table";
```

### Creating New Features

1. **Choose the right module:**
   - Admin-only feature → `/modules/admin/`
   - Employer feature → `/modules/employer/`
   - Job seeker feature → `/modules/job-seeker/`
   - Reusable component → `/modules/shared/`

2. **Create feature structure:**

   ```
   /modules/[domain]/[feature]/
   ├── components/
   ├── actions/
   ├── db/
   ├── lib/
   ├── types/
   └── index.ts
   ```

3. **Export from index.ts:**
   ```typescript
   export * from "./components/my-component";
   export * from "./actions/my-action";
   ```

### Common Tasks

| Task               | Module                    | Import                                                                            |
| ------------------ | ------------------------- | --------------------------------------------------------------------------------- |
| Create job listing | Employer - Job Listings   | `import { createJobListing } from '@/modules/employer/job-listings'`              |
| Apply for job      | Job Seeker - Applications | `import { createJobListingApplication } from '@/modules/job-seeker/applications'` |
| Ban user           | Admin - User Management   | `import { banUser } from '@/modules/admin/user-management'`                       |
| Show button        | Shared                    | `import { Button } from '@/modules/shared/components/ui/button'`                  |
| Use mobile hook    | Shared                    | `import { useMobile } from '@/modules/shared/hooks/use-mobile'`                   |

---

## File Naming Conventions

| Type                | Convention                | Example                      |
| ------------------- | ------------------------- | ---------------------------- |
| Components          | kebab-case.tsx            | `job-listing-form.tsx`       |
| Actions             | kebab-case.ts             | `create-job-listing.ts`      |
| Database            | feature-db.ts             | `job-listing-db.ts`          |
| Types               | types.ts or index.type.ts | `types.ts`                   |
| Constants           | kebab-case.ts             | `application-statuses.ts`    |
| Internal components | \_kebab-case.tsx          | `_sidebar-button-client.tsx` |

---

## Module Checklist

When creating or updating a module:

- [ ] Create proper folder structure
- [ ] Add `index.ts` with exports
- [ ] Write module README
- [ ] Add TypeScript types
- [ ] Implement components
- [ ] Write server actions
- [ ] Add database queries
- [ ] Write tests
- [ ] Update this index
- [ ] Document dependencies

---

## Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [Module Migration Guide](./MODULE_MIGRATION_GUIDE.md)
- [Admin Module README](../modules/admin/README.md)
- [Employer Module README](../modules/employer/README.md)
- [Job Seeker Module README](../modules/job-seeker/README.md)
- [Shared Module README](../modules/shared/README.md)

---

**Last Updated:** February 17, 2026
**Version:** 2.0.0
