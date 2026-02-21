# Project Architecture Documentation

## Overview

This is a **Job Portal Application** built with Next.js 15 (App Router), featuring a modular architecture where each feature is self-contained and independent. The application serves three main user types: Job Seekers, Employers, and Administrators.

## Technology Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Better Auth
- **UI:** Shadcn UI + Tailwind CSS
- **File Upload:** UploadThing
- **Markdown:** MDXEditor
- **State Management:** React Server Components + Server Actions

## Modular Architecture

The project follows a **feature-based modular architecture** where each module is completely self-contained. This approach provides:

- ✅ **Isolation:** Changes in one module don't affect others
- ✅ **Scalability:** Easy to add new features
- ✅ **Maintainability:** Clear boundaries and responsibilities
- ✅ **Team Collaboration:** Multiple developers can work independently
- ✅ **Testing:** Each module can be tested in isolation

## Directory Structure

```
/job-portal
├── app/                          # Next.js App Router (Route Handlers only)
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (job-seeker)/
│   ├── admin/
│   ├── employer/
│   └── api/
│
├── modules/                      # Feature Modules (Main Application Logic)
│   ├── admin/
│   │   ├── user-management/
│   │   ├── employer-requests/
│   │   └── dashboard/
│   ├── employer/
│   │   ├── job-listings/
│   │   ├── organizations/
│   │   ├── pricing/
│   │   └── dashboard/
│   ├── job-seeker/
│   │   ├── job-listings/
│   │   ├── applications/
│   │   ├── profile/
│   │   └── resume/
│   ├── auth/
│   │   ├── components/
│   │   ├── actions/
│   │   ├── lib/
│   │   └── types/
│   └── shared/                   # Shared utilities and components
│       ├── components/
│       │   ├── ui/              # Shadcn UI components
│       │   ├── data-table/
│       │   └── markdown/
│       ├── hooks/
│       ├── lib/
│       └── types/
│
├── lib/                          # Core application utilities
│   ├── db/                      # Database connection
│   └── auth/                    # Auth configuration
│
├── drizzle/                     # Database schema & migrations
│   ├── schema.ts
│   ├── migrations/
│   └── seed.ts
│
├── config/                      # Application configuration
├── constants/                   # Global constants
└── docs/                        # Documentation

```

## Module Structure

Each feature module follows a consistent structure:

```
/modules/[domain]/[feature]/
├── components/              # React components specific to this feature
│   ├── feature-form.tsx
│   ├── feature-table.tsx
│   └── _internal-component.tsx    # Prefix with _ for internal use
│
├── actions/                 # Server Actions
│   ├── create-feature.ts
│   ├── update-feature.ts
│   └── delete-feature.ts
│
├── api/                    # API Route Handlers (if needed)
│   └── route.ts
│
├── hooks/                  # Custom React hooks
│   └── use-feature.ts
│
├── lib/                    # Utilities and helpers
│   ├── utils.ts
│   ├── formatters.ts
│   └── helpers.ts
│
├── db/                     # Database queries
│   ├── feature-db.ts
│   └── cache/
│       └── feature-cache.ts
│
├── types/                  # TypeScript types
│   └── index.ts
│
├── validations/            # Zod schemas
│   └── schema.ts
│
├── constants/              # Feature-specific constants
│   └── index.ts
│
└── index.ts               # Public API exports
```

## Module Domains

### 1. Admin Module (`/modules/admin`)

Manages administrative functions including user management, employer request approvals, and system monitoring.

#### Sub-modules:

- **user-management:** User CRUD, ban/unban, role management
- **employer-requests:** Approve/reject employer requests
- **dashboard:** Admin statistics and overview

### 2. Employer Module (`/modules/employer`)

Handles employer-specific features for posting jobs and managing organizations.

#### Sub-modules:

- **job-listings:** Create, edit, delete, publish job postings
- **organizations:** Organization management, team members, roles
- **pricing:** Subscription plans and billing
- **dashboard:** Employer metrics and overview

### 3. Job Seeker Module (`/modules/job-seeker`)

Features for job seekers to find jobs and manage applications.

#### Sub-modules:

- **job-listings:** Browse and search job listings
- **applications:** Apply for jobs, track applications
- **profile:** User profile management
- **resume:** Resume upload and management

### 4. Auth Module (`/modules/auth`)

Handles authentication and authorization.

**Components:**

- Sign-in/Sign-up forms
- Auth buttons
- Session management

### 5. Shared Module (`/modules/shared`)

Common utilities and components used across multiple modules.

**Sub-modules:**

- **components/ui:** Shadcn UI components (Button, Input, etc.)
- **components/data-table:** Reusable data table
- **components/markdown:** Markdown editor and renderer
- **hooks:** Common hooks (use-mobile, use-darkmode, etc.)
- **lib:** Utility functions
- **types:** Shared TypeScript types

## App Router Structure

The `/app` directory contains only route definitions and imports components from modules:

```typescript
// app/admin/users/page.tsx
import { UsersTable } from '@/modules/admin/user-management/components/users-table';

export default function UsersPage() {
  return <UsersTable />;
}
```

## Import Conventions

### Absolute Imports

Use TypeScript path aliases for clean imports:

```typescript
// ✅ Good
import { UserTable } from "@/modules/admin/user-management";
import { Button } from "@/modules/shared/components/ui/button";

// ❌ Bad
import { UserTable } from "../../../modules/admin/user-management";
```

### Module Public API

Each module exports its public API through `index.ts`:

```typescript
// modules/admin/user-management/index.ts
export * from "./components/users-table";
export * from "./actions/ban-user";
export { type User } from "./types";
```

### Cross-Module Dependencies

Modules should minimize dependencies on other modules:

```typescript
// ✅ Good - Depend on shared module
import { Button } from "@/modules/shared/components/ui/button";

// ⚠️ Acceptable - Clear cross-feature dependency
import { revalidateAdminStats } from "@/modules/admin/dashboard/lib/cache";

// ❌ Bad - Direct dependency on another domain module
import { JobListingsTable } from "@/modules/employer/job-listings/components/table";
```

## Database Layer

### Drizzle ORM Schema

All database schemas are defined in `/drizzle/schema.ts`:

```typescript
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  // ...
});
```

### Module Database Queries

Each module has its own database query functions:

```typescript
// modules/admin/user-management/db/users-db.ts
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

export async function getAllUsers() {
  return db.select().from(users);
}
```

## Server Actions

Server actions are colocated with their features:

```typescript
// modules/admin/user-management/actions/ban-user.ts
"use server";

import { revalidatePath } from "next/cache";
import { banUserDb } from "../db/users-db";

export async function banUser(userId: string) {
  await banUserDb(userId);
  revalidatePath("/admin/users");
}
```

## Component Conventions

### File Naming

- **Public components:** `component-name.tsx`
- **Internal components:** `_component-name.tsx` (prefix with underscore)
- **Client components:** `_component-name-client.tsx`

### Component Structure

```typescript
// modules/admin/user-management/components/users-table.tsx
import { getUsersDb } from '../db/users-db';
import { banUser } from '../actions/ban-user';

export async function UsersTable() {
  const users = await getUsersDb();

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Styling

- **Global Styles:** `/app/globals.css`
- **Tailwind Config:** `/tailwind.config.ts`
- **Component Styles:** Inline Tailwind classes
- **Theme:** Shadcn UI theming system

## Authentication & Authorization

Authentication is handled by **Better Auth**:

```typescript
// lib/auth/auth.ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  // configuration
});
```

### Role-Based Access Control

User roles: `job_seeker`, `employer`, `admin`

```typescript
// Example: Protect admin routes
import { auth } from '@/lib/auth';

export default async function AdminLayout() {
  const session = await auth.api.getSession({ headers });

  if (session?.user.role !== 'admin') {
    redirect('/');
  }

  return <>{children}</>;
}
```

## Testing Strategy

### Unit Tests

Test individual functions and utilities:

```typescript
// modules/admin/user-management/lib/__tests__/formatters.test.ts
import { formatUserRole } from "../formatters";

test("formats user role correctly", () => {
  expect(formatUserRole("job_seeker")).toBe("Job Seeker");
});
```

### Integration Tests

Test server actions and database queries:

```typescript
// modules/admin/user-management/__tests__/ban-user.test.ts
import { banUser } from "../actions/ban-user";

test("bans user successfully", async () => {
  // test implementation
});
```

### E2E Tests

Use Playwright or Cypress for end-to-end testing.

## Performance Optimization

### Server Components

Use React Server Components by default for better performance:

```typescript
// ✅ Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

### Client Components

Only use `'use client'` when necessary:

```typescript
// ✅ Client Component (when needed)
'use client';

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Data Caching

Use Next.js caching and React Cache:

```typescript
import { cache } from "react";
import { unstable_cache } from "next/cache";

export const getUsers = cache(async () => {
  return unstable_cache(async () => db.select().from(users), ["users"], {
    revalidate: 3600,
  })();
});
```

## Development Workflow

### 1. Adding a New Feature

```bash
# Create module structure
modules/[domain]/[feature]/
  ├── components/
  ├── actions/
  ├── db/
  ├── types/
  └── index.ts

# Add route in app directory
app/[route]/page.tsx
```

### 2. Database Changes

```bash
# Update schema
vim drizzle/schema.ts

# Generate migration
npx drizzle-kit generate

# Run migration
npx drizzle-kit migrate
```

### 3. Running the Project

```bash
# Development
npm run dev

# Build
npm run build

# Database commands
npm run db:studio      # Open Drizzle Studio
npm run db:seed        # Seed database
npm run db:restart     # Reset and restart database
```

## Deployment

### Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=...

# Upload Thing
UPLOADTHING_TOKEN=...
```

### Build Process

```bash
npm run build
npm run start
```

## Best Practices

### 1. **Keep Modules Independent**

- Minimize cross-module dependencies
- Use shared module for common utilities

### 2. **Use TypeScript Strictly**

- Enable strict mode
- Define proper types for all functions
- Avoid `any` types

### 3. **Server Actions Naming**

- Use verb-noun pattern: `createUser`, `deleteJob`
- Export from `actions/` folder

### 4. **Component Organization**

- Keep components small and focused
- Extract complex logic to utilities
- Use proper TypeScript types

### 5. **Database Queries**

- Keep queries in `db/` folder
- Use proper indexing
- Implement caching where appropriate

### 6. **Error Handling**

- Use try-catch in server actions
- Return proper error messages
- Log errors appropriately

## File Naming Conventions

- **Components:** `kebab-case.tsx`
- **Utilities:** `kebab-case.ts`
- **Types:** `index.type.ts` or `types.ts`
- **Server Actions:** `kebab-case.ts`
- **Database queries:** `feature-db.ts`

## Git Workflow

### Branching Strategy

- `master` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `refactor/*` - Refactoring branches
- `bugfix/*` - Bug fix branches

### Commit Messages

Follow conventional commits:

```
feat: add user management module
fix: resolve job listing filter bug
refactor: restructure employer module
docs: update architecture documentation
```

## Troubleshooting

### Common Issues

**Issue:** Import path not found

```typescript
// Solution: Check tsconfig.json paths configuration
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

**Issue:** Database connection error

```bash
# Solution: Check DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

**Issue:** Build errors after restructuring

```bash
# Solution: Clear Next.js cache
rm -rf .next
npm run build
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Better Auth Documentation](https://better-auth.com/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## Contributing

When contributing to this project:

1. Follow the modular architecture
2. Keep modules self-contained
3. Write tests for new features
4. Update documentation
5. Follow TypeScript and ESLint rules
6. Use conventional commit messages

## License

[Your License Here]

---

**Last Updated:** February 17, 2026
**Version:** 2.0.0
