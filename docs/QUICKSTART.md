# Quick Start Guide

Welcome to the Job Portal! This guide will help you get started quickly with the modular architecture.

## 📋 Table of Contents

1. [Understanding the Structure](#understanding-the-structure)
2. [Finding Code](#finding-code)
3. [Common Tasks](#common-tasks)
4. [Module Examples](#module-examples)
5. [Best Practices](#best-practices)

## Understanding the Structure

### The Big Picture

```
Before (Mixed Architecture)          After (Modular Architecture)
────────────────────────────         ──────────────────────────
/features                            /modules
  /users                               /admin
  /job-listings                          /user-management
  /applications                          /employer-requests
/components                              /dashboard
  /ui                                /employer
  /job-listings                        /job-listings
  /organizations                       /organizations
/app                                   /pricing
  /admin                               /dashboard
  /employer                          /job-seeker
                                       /job-listings
                                       /applications
                                       /profile
                                     /auth
                                     /shared
                                       /components
                                       /hooks
                                       /lib
```

### Module Independence

Each module is **self-contained**:

✅ Has its own components, actions, database queries  
✅ Can be developed independently  
✅ Can be tested in isolation  
✅ Exports a clean public API via `index.ts`

## Finding Code

### Use the Module Pattern

**Question:** Where is the user management code?  
**Answer:** `/modules/admin/user-management/`

**Question:** Where is the job listing form?  
**Answer:** `/modules/employer/job-listings/components/job-listing-form.tsx`

**Question:** Where is the Button component?  
**Answer:** `/modules/shared/components/ui/button.tsx`

### Quick Reference Table

| What You Need       | Where to Look                    |
| ------------------- | -------------------------------- |
| Admin features      | `/modules/admin/`                |
| Employer features   | `/modules/employer/`             |
| Job seeker features | `/modules/job-seeker/`           |
| UI components       | `/modules/shared/components/ui/` |
| Custom hooks        | `/modules/shared/hooks/`         |
| Database schema     | `/drizzle/schema.ts`             |
| Routes              | `/app/`                          |
| Auth config         | `/modules/auth/lib/`             |

## Common Tasks

### Task 1: Import a Component

```typescript
// ✅ Good - Import from module public API
import { Button } from "@/modules/shared/components/ui/button";
import { UsersTable } from "@/modules/admin/user-management";

// ❌ Bad - Don't import internal files
import { UsersTable } from "@/modules/admin/user-management/components/users-table";
```

### Task 2: Create a New Page

Create in `/app`, import from module:

```typescript
// app/admin/reports/page.tsx
import { ReportsTable } from '@/modules/admin/reports';

export default function ReportsPage() {
  return <ReportsTable />;
}
```

### Task 3: Add a Server Action

Create in module's `actions/` folder:

```typescript
// modules/admin/user-management/actions/update-user.ts
"use server";

import { revalidatePath } from "next/cache";
import { updateUserDb } from "../db/users-db";

export async function updateUser(userId: string, data: UserData) {
  await updateUserDb(userId, data);
  revalidatePath("/admin/users");
  return { success: true };
}
```

Export from module:

```typescript
// modules/admin/user-management/index.ts
export * from "./actions/update-user";
```

### Task 4: Create a Database Query

Add to module's `db/` folder:

```typescript
// modules/admin/user-management/db/users-db.ts
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getUserByIdDb(userId: string) {
  return db.select().from(users).where(eq(users.id, userId)).limit(1);
}
```

### Task 5: Update Database Schema

1. Edit `drizzle/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Run migration: `npx drizzle-kit migrate`

## Module Examples

### Example 1: Using Admin Module

```typescript
// Get users table component
import { UsersTable } from "@/modules/admin/user-management";

// Ban a user
import { banUser } from "@/modules/admin/user-management";

async function handleBan(userId: string) {
  const result = await banUser(userId);
  if (result.success) {
    console.log("User banned successfully");
  }
}
```

### Example 2: Using Employer Module

```typescript
// Create job listing
import { createJobListing } from "@/modules/employer/job-listings";

// Get organizations
import { getUserOrganizationsDb } from "@/modules/employer/organizations";

async function createJob(data: JobData) {
  const result = await createJobListing(data);
  return result;
}
```

### Example 3: Using Shared Module

```typescript
// UI Components
import { Button } from '@/modules/shared/components/ui/button';
import { Input } from '@/modules/shared/components/ui/input';

// Hooks
import { useMobile } from '@/modules/shared/hooks/use-mobile';

// Utilities
import { cn } from '@/modules/shared/lib/utils';

function MyComponent() {
  const isMobile = useMobile();

  return (
    <div className={cn('base', isMobile && 'mobile')}>
      <Button>Click me</Button>
    </div>
  );
}
```

## Best Practices

### ✅ DO

**1. Import from module public API:**

```typescript
import { UsersTable } from "@/modules/admin/user-management";
```

**2. Keep modules independent:**

```typescript
// Each module has its own logic
modules/admin/user-management/
modules/employer/job-listings/
```

**3. Use TypeScript:**

```typescript
type User = {
  id: string;
  email: string;
  role: "admin" | "employer" | "job_seeker";
};
```

**4. Export from index.ts:**

```typescript
// modules/admin/user-management/index.ts
export * from "./components/users-table";
export * from "./actions/ban-user";
```

**5. Use server components by default:**

```typescript
// Server component (default)
export async function UsersList() {
  const users = await getUsersDb();
  return <div>{users.map(...)}</div>;
}
```

### ❌ DON'T

**1. Don't import internal module files:**

```typescript
// ❌ Bad
import { UsersTable } from "@/modules/admin/user-management/components/users-table";
```

**2. Don't create circular dependencies:**

```typescript
// ❌ Bad
// Module A imports Module B
// Module B imports Module A
```

**3. Don't use `any` type:**

```typescript
// ❌ Bad
const data: any = fetchData();

// ✅ Good
const data: User[] = fetchData();
```

**4. Don't hardcode values:**

```typescript
// ❌ Bad
const url = "http://localhost:3000";

// ✅ Good
const url = process.env.NEXT_PUBLIC_URL;
```

## Cheat Sheet

### Import Patterns

```typescript
// Shared Components
import { Button } from "@/modules/shared/components/ui/button";
import { DataTable } from "@/modules/shared/components/data-table/DataTable";

// Admin
import { UsersTable } from "@/modules/admin/user-management";
import { banUser } from "@/modules/admin/user-management";

// Employer
import { createJobListing } from "@/modules/employer/job-listings";
import { JobListingForm } from "@/modules/employer/job-listings";

// Job Seeker
import { ApplicationTable } from "@/modules/job-seeker/applications";
import { createApplication } from "@/modules/job-seeker/applications";

// Auth
import { SignInButton } from "@/modules/auth";
import { auth } from "@/modules/auth/lib/auth";
```

### File Structure Template

```
/modules/[domain]/[feature]/
├── components/              # React components
│   ├── feature-table.tsx
│   ├── feature-form.tsx
│   └── _internal.tsx       # Prefix _ for internal
├── actions/                 # Server actions
│   ├── create-feature.ts
│   ├── update-feature.ts
│   └── delete-feature.ts
├── db/                      # Database queries
│   ├── feature-db.ts
│   └── cache/
│       └── feature-cache.ts
├── lib/                     # Utilities
│   ├── utils.ts
│   └── formatters.ts
├── types/                   # TypeScript types
│   └── index.ts
├── validations/             # Zod schemas
│   └── schema.ts
└── index.ts                # Public API exports
```

### Common Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm run start               # Start production server

# Database
npm run db:studio           # Open Drizzle Studio
npm run db:seed             # Seed database
npm run db:restart          # Reset database
npx drizzle-kit generate    # Generate migration
npx drizzle-kit migrate     # Run migrations

# Linting
npm run lint                # Run ESLint
```

## Need Help?

### Documentation

- **Full Architecture:** [docs/ARCHITECTURE.md](./ARCHITECTURE.md)
- **Development Guide:** [docs/DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
- **Module Index:** [docs/MODULE_INDEX.md](./MODULE_INDEX.md)
- **Migration Guide:** [docs/MODULE_MIGRATION_GUIDE.md](./MODULE_MIGRATION_GUIDE.md)

### Module READMEs

- [Admin Module](../modules/admin/README.md)
- [Employer Module](../modules/employer/README.md)
- [Job Seeker Module](../modules/job-seeker/README.md)
- [Shared Module](../modules/shared/README.md)

### Quick Tips

💡 **Can't find something?**  
→ Check the module's `index.ts` to see what's exported

💡 **Need a new feature?**  
→ Follow the [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

💡 **Circular dependency error?**  
→ Extract common code to `/modules/shared`

💡 **Import not working?**  
→ Check if it's exported from module's `index.ts`

---

**Happy Coding! 🚀**

Last Updated: February 17, 2026
