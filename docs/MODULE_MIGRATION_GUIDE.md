# Module Migration Guide

This guide explains the migration from the old structure to the new modular architecture.

## Overview

The project has been restructured from a mixed architecture to a **feature-based modular architecture** where each domain and feature is completely self-contained.

## Migration Mapping

### Old Structure → New Structure

```
OLD: /features/*                    → NEW: /modules/[domain]/[feature]/*
OLD: /components/[feature]/*        → NEW: /modules/[domain]/[feature]/components/*
OLD: /app/admin/*                   → NEW: /modules/admin/*
OLD: /app/employer/*                → NEW: /modules/employer/*
OLD: /app/(job-seeker)/*           → NEW: /modules/job-seeker/*
OLD: /components/shared/*           → NEW: /modules/shared/components/*
OLD: /components/ui/*               → NEW: /modules/shared/components/ui/*
OLD: /hooks/*                       → NEW: /modules/shared/hooks/*
```

## Detailed Module Mapping

### 1. Admin Module

| Old Path                                 | New Path                                        |
| ---------------------------------------- | ----------------------------------------------- |
| `/features/users/`                       | `/modules/admin/user-management/`               |
| `/features/employer-requests/`           | `/modules/admin/employer-requests/`             |
| `/app/admin/users/`                      | `/modules/admin/user-management/pages/`         |
| `/app/admin/employer-requests/`          | `/modules/admin/employer-requests/pages/`       |
| `/components/shared/admin-nav.tsx`       | `/modules/admin/components/admin-nav.tsx`       |
| `/components/shared/admin-user-menu.tsx` | `/modules/admin/components/admin-user-menu.tsx` |

### 2. Employer Module

| Old Path                       | New Path                                      |
| ------------------------------ | --------------------------------------------- |
| `/features/job-listings/`      | `/modules/employer/job-listings/`             |
| `/features/organizations/`     | `/modules/employer/organizations/`            |
| `/app/employer/job-listings/`  | `/modules/employer/job-listings/pages/`       |
| `/app/employer/organizations/` | `/modules/employer/organizations/pages/`      |
| `/app/employer/pricing/`       | `/modules/employer/pricing/`                  |
| `/components/job-listings/`    | `/modules/employer/job-listings/components/`  |
| `/components/organizations/`   | `/modules/employer/organizations/components/` |

### 3. Job Seeker Module

| Old Path                                  | New Path                                     |
| ----------------------------------------- | -------------------------------------------- |
| `/features/applications/`                 | `/modules/job-seeker/applications/`          |
| `/app/(job-seeker)/job-listings/`         | `/modules/job-seeker/job-listings/pages/`    |
| `/app/(job-seeker)/settings/`             | `/modules/job-seeker/settings/`              |
| `/components/layout/JobSeekerSidebar.tsx` | `/modules/job-seeker/components/sidebar.tsx` |

### 4. Auth Module

| Old Path               | New Path                       |
| ---------------------- | ------------------------------ |
| `/components/auth/`    | `/modules/auth/components/`    |
| `/app/(auth)/sign-in/` | `/modules/auth/pages/sign-in/` |
| `/app/(auth)/sign-up/` | `/modules/auth/pages/sign-up/` |
| `/lib/auth/`           | `/modules/auth/lib/`           |

### 5. Shared Module

| Old Path                  | New Path                                 |
| ------------------------- | ---------------------------------------- |
| `/components/ui/`         | `/modules/shared/components/ui/`         |
| `/components/data-table/` | `/modules/shared/components/data-table/` |
| `/components/markdown/`   | `/modules/shared/components/markdown/`   |
| `/components/shared/`     | `/modules/shared/components/`            |
| `/hooks/`                 | `/modules/shared/hooks/`                 |
| `/lib/utils/`             | `/modules/shared/lib/`                   |
| `/types/`                 | `/modules/shared/types/`                 |

## Import Path Changes

### Before

```typescript
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/features/users/components/users-table";
import { getUsers } from "@/features/users/actions/get-users";
import { JobListingForm } from "@/components/job-listings/job-listing-form";
```

### After

```typescript
import { Button } from "@/modules/shared/components/ui/button";
import { UsersTable } from "@/modules/admin/user-management";
import { getUsers } from "@/modules/admin/user-management/actions/get-users";
import { JobListingForm } from "@/modules/employer/job-listings/components/job-listing-form";
```

## Module Structure Standards

Every module follows this structure:

```
/modules/[domain]/[feature]/
├── components/              # React components
├── actions/                 # Server actions
├── api/                     # API routes (if needed)
├── hooks/                   # Custom hooks
├── lib/                     # Utilities
├── db/                      # Database queries
├── types/                   # TypeScript types
├── validations/             # Zod schemas
├── constants/               # Constants
└── index.ts                # Public exports
```

## Step-by-Step Migration Process

### Step 1: Create Module Folder Structure

```bash
mkdir -p modules/admin/{user-management,employer-requests,dashboard}
mkdir -p modules/employer/{job-listings,organizations,pricing,dashboard}
mkdir -p modules/job-seeker/{job-listings,applications,profile,resume}
mkdir -p modules/auth
mkdir -p modules/shared/{components,hooks,lib,types}
```

### Step 2: Move Files to Modules

#### Admin Module

```bash
# User Management
mv features/users/* modules/admin/user-management/
mv app/admin/users/* modules/admin/user-management/pages/

# Employer Requests
mv features/employer-requests/* modules/admin/employer-requests/
mv app/admin/employer-requests/* modules/admin/employer-requests/pages/
```

#### Employer Module

```bash
# Job Listings
mv features/job-listings/* modules/employer/job-listings/
mv components/job-listings/* modules/employer/job-listings/components/
mv app/employer/job-listings/* modules/employer/job-listings/pages/

# Organizations
mv features/organizations/* modules/employer/organizations/
mv components/organizations/* modules/employer/organizations/components/
mv app/employer/organizations/* modules/employer/organizations/pages/

# Pricing
mv app/employer/pricing/* modules/employer/pricing/
```

#### Job Seeker Module

```bash
# Applications
mv features/applications/* modules/job-seeker/applications/

# Job Listings (Job Seeker View)
mv app/'(job-seeker)'/job-listings/* modules/job-seeker/job-listings/pages/

# Settings
mv app/'(job-seeker)'/settings/* modules/job-seeker/settings/
```

#### Auth Module

```bash
mv components/auth/* modules/auth/components/
mv app/'(auth)'/* modules/auth/pages/
mv lib/auth/* modules/auth/lib/
```

#### Shared Module

```bash
mv components/ui/* modules/shared/components/ui/
mv components/data-table/* modules/shared/components/data-table/
mv components/markdown/* modules/shared/components/markdown/
mv components/shared/* modules/shared/components/
mv hooks/* modules/shared/hooks/
mv lib/utils/* modules/shared/lib/
```

### Step 3: Create index.ts for Each Module

Each module should export its public API:

```typescript
// modules/admin/user-management/index.ts
export * from "./components/users-table";
export * from "./actions/ban-user";
export * from "./actions/get-users";
export type * from "./types";
```

### Step 4: Update Import Paths

Use find and replace to update all imports:

```bash
# Example: Update Button imports
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/components/ui/|@/modules/shared/components/ui/|g'

# Update feature imports
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/features/users/|@/modules/admin/user-management/|g'
```

### Step 5: Update tsconfig.json Paths (if needed)

Ensure TypeScript recognizes the new structure:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/modules/*": ["./modules/*"]
    }
  }
}
```

### Step 6: Update App Router

Keep app router lean - it should only import from modules:

```typescript
// app/admin/users/page.tsx
import { UsersTable } from '@/modules/admin/user-management';

export default function UsersPage() {
  return <UsersTable />;
}
```

### Step 7: Test the Application

```bash
# Clear cache
rm -rf .next

# Run development server
npm run dev

# Build to check for errors
npm run build
```

## Common Migration Issues

### Issue 1: Circular Dependencies

**Problem:** Module A imports from Module B, and Module B imports from Module A.

**Solution:**

- Extract common code to shared module
- Use dependency inversion (both depend on shared interface)

```typescript
// ❌ Bad
// modules/admin/user-management/actions.ts
import { revalidateOrg } from "@/modules/employer/organizations";

// modules/employer/organizations/actions.ts
import { getUsers } from "@/modules/admin/user-management";

// ✅ Good
// modules/shared/lib/cache.ts
export function revalidateCache(path: string) {
  revalidatePath(path);
}

// Both modules import from shared
import { revalidateCache } from "@/modules/shared/lib/cache";
```

### Issue 2: Import Path Not Found

**Problem:** TypeScript can't find the new import paths.

**Solution:**

- Check `tsconfig.json` paths configuration
- Restart TypeScript server in VS Code
- Clear `.next` folder

### Issue 3: Component Rendering Issues

**Problem:** Components not rendering after migration.

**Solution:**

- Verify all exports in `index.ts`
- Check for 'use client' directives
- Ensure imports are correct

### Issue 4: Database Query Errors

**Problem:** Database queries failing after moving files.

**Solution:**

- Check database connection in `lib/db`
- Verify schema imports from `drizzle/schema`
- Update cache keys if using caching

## Verification Checklist

After migration, verify:

- [ ] All files have been moved to appropriate modules
- [ ] All import paths have been updated
- [ ] Each module has an `index.ts` with public exports
- [ ] No circular dependencies
- [ ] Application builds successfully (`npm run build`)
- [ ] All routes work correctly
- [ ] Database queries work
- [ ] Authentication still works
- [ ] All tests pass (if applicable)
- [ ] No TypeScript errors
- [ ] No console errors

## Rollback Plan

If migration causes issues, you can rollback:

```bash
# 1. Checkout previous commit
git checkout [previous-commit]

# 2. Or revert specific files
git checkout HEAD~1 -- [file-path]

# 3. Or use git revert
git revert [commit-hash]
```

## Benefits After Migration

✅ **Clear Module Boundaries:** Each feature is isolated
✅ **Easy Navigation:** Find related files quickly
✅ **Better Testing:** Test modules independently
✅ **Scalability:** Add new features without touching existing code
✅ **Team Collaboration:** Multiple developers work without conflicts
✅ **Code Reusability:** Shared module for common utilities
✅ **Maintainability:** Clear responsibilities and dependencies

## Next Steps

After successful migration:

1. Update documentation
2. Train team members on new structure
3. Setup code ownership (CODEOWNERS file)
4. Create module-specific tests
5. Monitor for any issues

## Support

If you encounter issues during migration:

1. Check this guide thoroughly
2. Review the main ARCHITECTURE.md documentation
3. Check Git history for recent changes
4. Create an issue in the repository

---

**Migration Version:** 2.0.0  
**Last Updated:** February 17, 2026
