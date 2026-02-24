# Migration TODO Checklist

Use this checklist to complete the migration to the modular architecture.

## ✅ Completed (Already Done)

- [x] Module folder structure created
- [x] All files copied to modules
- [x] Module `index.ts` files created
- [x] Module-specific READMEs written
- [x] Comprehensive documentation created
- [x] Main README updated

## 🔄 Phase 1: Update Shared Module Imports (Start Here)

This is the safest place to start as shared components are used everywhere.

### UI Component Imports

- [ ] Find all `@/components/ui/*` imports
- [ ] Replace with `@/modules/shared/components/ui/*`
- [ ] Test UI components render correctly

**Example:**

```typescript
// Find
import { Button } from "@/components/ui/button";

// Replace with
import { Button } from "@/modules/shared/components/ui/button";
```

### Hook Imports

- [ ] Find all `@/hooks/*` imports
- [ ] Replace with `@/modules/shared/hooks/*`
- [ ] Test hooks work correctly

**Example:**

```typescript
// Find
import { useMobile } from "@/hooks/use-mobile";

// Replace with
import { useMobile } from "@/modules/shared/hooks/use-mobile";
```

### Utility Imports

- [ ] Find all `@/lib/utils` imports
- [ ] Replace with `@/modules/shared/lib/utils`
- [ ] Test utilities work

**Example:**

```typescript
// Find
import { cn } from "@/lib/utils";

// Replace with
import { cn } from "@/modules/shared/lib/utils";
```

### Data Table Imports

- [ ] Find all `@/components/data-table/*` imports
- [ ] Replace with `@/modules/shared/components/data-table/*`
- [ ] Test tables render correctly

### Markdown Imports

- [ ] Find all `@/components/markdown/*` imports
- [ ] Replace with `@/modules/shared/components/markdown/*`
- [ ] Test markdown editor works

### Shared Component Imports

- [ ] Find all `@/components/shared/*` imports
- [ ] Replace with `@/modules/shared/components/*`
- [ ] Test components work

## 🔄 Phase 2: Update Admin Module Imports

### User Management Imports

- [ ] Find all `@/features/users/*` imports
- [ ] Replace with `@/modules/admin/user-management/*`
- [ ] Update admin user pages
- [ ] Test user management features

**Example:**

```typescript
// Find
import { UsersTable } from "@/features/users/components/users-table";
import { banUser } from "@/features/users/actions/ban-user";

// Replace with
import { UsersTable, banUser } from "@/modules/admin/user-management";
```

### Employer Requests Imports

- [ ] Find all `@/features/employer-requests/*` imports
- [ ] Replace with `@/modules/admin/employer-requests/*`
- [ ] Update employer request pages
- [ ] Test employer request features

**Example:**

```typescript
// Find
import { EmployerRequestsTable } from "@/features/employer-requests/components/employer-requests-table";

// Replace with
import { EmployerRequestsTable } from "@/modules/admin/employer-requests";
```

### Admin Component Imports

- [ ] Update admin navigation imports
- [ ] Update admin user menu imports
- [ ] Test admin layout

## 🔄 Phase 3: Update Employer Module Imports

### Job Listings Imports

- [ ] Find all `@/features/job-listings/*` imports
- [ ] Replace with `@/modules/employer/job-listings/*`
- [ ] Find all `@/components/job-listings/*` imports
- [ ] Replace with `@/modules/employer/job-listings/components/*`
- [ ] Update job listing pages
- [ ] Test job listing features

**Example:**

```typescript
// Find
import { JobListingForm } from "@/components/job-listings/job-listing-form";
import { createJobListing } from "@/features/job-listings/actions";

// Replace with
import {
  JobListingForm,
  createJobListing,
} from "@/modules/employer/job-listings";
```

### Organizations Imports

- [ ] Find all `@/features/organizations/*` imports
- [ ] Replace with `@/modules/employer/organizations/*`
- [ ] Find all `@/components/organizations/*` imports
- [ ] Replace with `@/modules/employer/organizations/components/*`
- [ ] Update organization pages
- [ ] Test organization features

**Example:**

```typescript
// Find
import { SidebarOrgButton } from "@/components/organizations/sidebar-org-button";

// Replace with
import { SidebarOrgButton } from "@/modules/employer/organizations";
```

### Pricing Imports

- [ ] Update pricing page imports
- [ ] Test pricing features

## 🔄 Phase 4: Update Job Seeker Module Imports

### Applications Imports

- [ ] Find all `@/features/applications/*` imports
- [ ] Replace with `@/modules/job-seeker/applications/*`
- [ ] Update application pages
- [ ] Test application features

**Example:**

```typescript
// Find
import { ApplicationTable } from "@/features/applications/components/application-table";

// Replace with
import { ApplicationTable } from "@/modules/job-seeker/applications";
```

### Job Seeker Pages

- [ ] Update job seeker job listings pages
- [ ] Update settings pages
- [ ] Update profile pages
- [ ] Update resume pages
- [ ] Test all job seeker features

## 🔄 Phase 5: Update Auth Module Imports

### Auth Component Imports

- [ ] Find all `@/components/auth/*` imports
- [ ] Replace with `@/modules/auth/*`
- [ ] Test auth components

**Example:**

```typescript
// Find
import { SignInButton, SignOutButton } from "@/components/auth/auth-buttons";

// Replace with
import { SignInButton, SignOutButton } from "@/modules/auth";
```

### Auth Library Imports

- [ ] Find all `@/lib/auth/*` imports
- [ ] Replace with `@/modules/auth/lib/*`
- [ ] Test authentication

**Example:**

```typescript
// Find
import { auth } from "@/lib/auth/auth";

// Replace with
import { auth } from "@/modules/auth/lib/auth";
```

## 🔄 Phase 6: Update App Router Pages

### Admin Routes

- [ ] Update `app/admin/page.tsx`
- [ ] Update `app/admin/users/page.tsx`
- [ ] Update `app/admin/employer-requests/page.tsx`
- [ ] Update `app/admin/layout.tsx`
- [ ] Test all admin routes

### Employer Routes

- [ ] Update `app/employer/page.tsx`
- [ ] Update `app/employer/job-listings/*`
- [ ] Update `app/employer/organizations/*`
- [ ] Update `app/employer/pricing/page.tsx`
- [ ] Update `app/employer/layout.tsx`
- [ ] Test all employer routes

### Job Seeker Routes

- [ ] Update `app/(job-seeker)/page.tsx`
- [ ] Update `app/(job-seeker)/job-listings/*`
- [ ] Update `app/(job-seeker)/settings/*`
- [ ] Update `app/(job-seeker)/layout.tsx`
- [ ] Test all job seeker routes

### Auth Routes

- [ ] Update `app/(auth)/sign-in/page.tsx`
- [ ] Update `app/(auth)/sign-up/page.tsx`
- [ ] Update `app/(auth)/layout.tsx`
- [ ] Test auth routes

## 🧪 Phase 7: Testing

### Build Test

- [ ] Clear Next.js cache: `rm -rf .next`
- [ ] Run build: `npm run build`
- [ ] Fix any build errors
- [ ] Verify build succeeds

### Development Test

- [ ] Start dev server: `npm run dev`
- [ ] Test homepage loads
- [ ] Test all navigation works
- [ ] Fix any runtime errors

### Feature Testing

#### Admin Features

- [ ] Login as admin
- [ ] Test user management
  - [ ] View users table
  - [ ] Ban/unban user
  - [ ] Update user role
- [ ] Test employer requests
  - [ ] View requests
  - [ ] Approve request
  - [ ] Reject request
- [ ] Test admin dashboard

#### Employer Features

- [ ] Login as employer
- [ ] Test job listings
  - [ ] Create job listing
  - [ ] Edit job listing
  - [ ] Delete job listing
  - [ ] Publish/unpublish job
- [ ] Test organizations
  - [ ] Create organization
  - [ ] Manage members
  - [ ] Update organization
- [ ] Test pricing page
- [ ] Test employer dashboard

#### Job Seeker Features

- [ ] Login as job seeker
- [ ] Test job browsing
  - [ ] View job listings
  - [ ] Search/filter jobs
  - [ ] View job details
- [ ] Test applications
  - [ ] Apply for job
  - [ ] View application status
  - [ ] Track applications
- [ ] Test profile management
- [ ] Test resume upload
- [ ] Test settings

#### Auth Features

- [ ] Test sign up
- [ ] Test sign in
- [ ] Test sign out
- [ ] Test protected routes

### Database Testing

- [ ] Open Drizzle Studio: `npm run db:studio`
- [ ] Verify all database queries work
- [ ] Test data persistence

### TypeScript Validation

- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Fix any type errors
- [ ] Verify no `any` types

### ESLint Check

- [ ] Run linter: `npm run lint`
- [ ] Fix any linting errors
- [ ] Verify code quality

## 🧹 Phase 8: Cleanup

### Remove Old Files (Only After Everything Works!)

⚠️ **BACKUP FIRST!** Consider committing to git before removing files.

- [ ] Remove old features folder

  ```bash
  rm -rf features/
  ```

- [ ] Remove old component folders

  ```bash
  rm -rf components/auth
  rm -rf components/data-table
  rm -rf components/job-listings
  rm -rf components/organizations
  rm -rf components/markdown
  ```

- [ ] Remove old hooks folder

  ```bash
  rm -rf hooks/
  ```

- [ ] Remove old lib/utils (if fully migrated)

  ```bash
  # Only if no longer needed
  rm -rf lib/utils/
  ```

- [ ] Remove old types folder
  ```bash
  # Only if no longer needed
  rm -rf types/
  ```

### Verify After Cleanup

- [ ] Build still works: `npm run build`
- [ ] Dev server still works: `npm run dev`
- [ ] All features still work
- [ ] No broken imports

## 📝 Phase 9: Update Configuration

### Update tsconfig.json (if needed)

- [ ] Add module paths if needed
- [ ] Verify TypeScript config

### Update package.json

- [ ] Update scripts if needed
- [ ] Update project description

### Update .gitignore

- [ ] Ensure proper files ignored
- [ ] Add any new patterns needed

## 📚 Phase 10: Documentation Updates

### Code Documentation

- [ ] Add JSDoc comments to public APIs
- [ ] Document complex logic
- [ ] Add usage examples

### Update Team

- [ ] Share documentation with team
- [ ] Explain new structure
- [ ] Provide training if needed

### Create CHANGELOG

- [ ] Document what changed
- [ ] Note breaking changes
- [ ] List migration steps

## 🎯 Final Verification

### Complete Checklist

- [ ] All imports updated
- [ ] All routes working
- [ ] All features tested
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Old files removed
- [ ] Documentation complete
- [ ] Team informed

### Performance Check

- [ ] Check bundle size
- [ ] Verify performance hasn't degraded
- [ ] Check for any regressions

### Security Check

- [ ] Verify auth still works
- [ ] Check protected routes
- [ ] Review any exposed APIs

## 🚀 Deployment Preparation

### Pre-Deployment

- [ ] Run full test suite
- [ ] Verify environment variables
- [ ] Check database migrations
- [ ] Review logs

### Deployment

- [ ] Deploy to staging first
- [ ] Test in staging environment
- [ ] Deploy to production
- [ ] Monitor for issues

## 📊 Success Metrics

After migration, verify:

- [ ] Faster development (can work on modules independently)
- [ ] Easier navigation (know where to find code)
- [ ] Better organization (clear module boundaries)
- [ ] Improved maintainability (isolated changes)
- [ ] Enhanced testability (test modules independently)

## 🎉 Migration Complete!

Once all items are checked:

1. Celebrate! 🎊
2. Document lessons learned
3. Share success with team
4. Continue building with modular architecture

---

**Started:** February 17, 2026  
**Target Completion:** [Set your target date]  
**Status:** In Progress

**Tips:**

- Work on one phase at a time
- Test after each phase
- Commit changes frequently
- Don't remove old files until everything works
- Ask for help if stuck (check documentation)
