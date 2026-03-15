# Architecture

## System Shape

The application is a Next.js App Router project with a feature-oriented backend and shared component library.

- `app/` defines routes, layouts, pages, and route handlers
- `features/` contains domain logic, server actions, queries, schemas, and feature-local components
- `components/` contains reusable UI and shared presentation building blocks
- `lib/` contains authentication, authorization, caching, database wiring, and shared utilities
- `services/` contains external integration code
- `drizzle/` contains the schema, migrations, seed, and reset helpers

## Top-Level Layout

```text
app/
  globals.css
  layout.tsx
  not-found.tsx
  (routes)/
    (client)/
      admin/
      auth/
      employer/
  api/
    auth/
    uploadthing/
  banned/

components/
  data-table/
  layout/
  markdown/
  organizations/
  shared/
  ui/

features/
  admin/
  applications/
  auth/
  employer/
  job-listings/
  organizations/
  users/

drizzle/
  migrations/
  schema.ts
  schemas/
  seed.ts

lib/
  auth/
  access-control.ts
  permissions.ts
  data-cache.ts
  db.ts

services/
  uploadthing/
```

## Responsibilities by Area

### app/

`app/` is the composition layer. It wires layouts, pages, route groups, and route handlers together. Business logic should stay thin here and be delegated into `features/` or shared libraries.

### features/

`features/` is the main domain layer.

- `features/admin/` handles admin dashboards, moderation, and request review flows
- `features/applications/` handles job applications, statuses, and related UI helpers
- `features/auth/` holds authentication-facing schemas and feature code
- `features/employer/` contains employer-specific presentation or navigation concerns
- `features/job-listings/` contains listing creation, browse queries, formatting, and status transitions
- `features/organizations/` contains organization requests, membership, invitations, notifications, and organization settings
- `features/users/` contains user-management concerns used by admin flows

Most feature areas follow a recurring pattern such as:

- `actions/` for server actions
- `db/` for Drizzle queries and mutations
- `schema/` or `schemas/` for Zod validators and search params
- `components/` for feature-local UI
- `lib/` for helper functions and formatters

### components/

`components/` contains reusable presentation code that is not owned by a single domain.

- `components/ui/` contains shared primitive UI components
- `components/shared/` contains reusable widgets such as loaders, headers, and cards
- `components/layout/` contains layout-specific pieces such as sidebar composition
- `components/data-table/` contains reusable table building blocks
- `components/markdown/` contains shared markdown editor and renderer pieces
- `components/organizations/` contains shared organization settings UI that spans the organization feature set

### lib/

`lib/` contains cross-cutting application services.

- `lib/db.ts` initializes the Drizzle client
- `lib/auth/` configures Better Auth and auth helpers
- `lib/access-control.ts` defines organization permissions and roles
- `lib/permissions.ts` exposes runtime permission helpers
- `lib/data-cache.ts` centralizes cache tag naming

### services/

`services/` contains integration adapters that talk to external systems.

- `services/uploadthing/` configures UploadThing server behavior

## Runtime Flow

Most state-changing flows follow the same pattern:

1. A page or component in `app/` renders a feature component.
2. The feature component submits to a server action in `features/.../actions` or a function in `features/.../db`.
3. Input is validated with Zod.
4. Session or permission checks run through Better Auth helpers and `lib/permissions.ts`.
5. Data is read or written through Drizzle models from `drizzle/schema.ts`.
6. Cache tags and paths are revalidated when necessary.

## Data Model Summary

The main schema groups are:

- Authentication: users, accounts, sessions, verifications
- Employer and organization operations: organizations, members, invitations, employer requests, organization requests, notifications
- Hiring workflows: job listings and applications
- Candidate data: resumes and profile-related entities

Important runtime relationships include:

- A `user` can have a platform role of `user`, `employer`, or `admin`
- An `organization` has many `members`, `invitations`, and `job_listings`
- A `job_listing` belongs to an `organization` and can have many `applications`
- Organization approval creates an organization record and a notification that allows the user to claim it into their active session

## Access Control Model

There are two role layers in the system.

### Platform roles

- `user`: default end-user capabilities
- `employer`: allowed into employer flows and organization-related actions
- `admin`: full administrative access

### Organization roles

Defined in [lib/access-control.ts](./lib/access-control.ts):

- `hr`: can read the active organization and manage job listings and applications
- `org-admin`: has the `hr` capabilities plus organization switching, organization management, member management, and broader invitation control

Direct organization creation through the Better Auth organization plugin is disabled. Organizations are created through the admin-reviewed organization request flow instead.

## Caching and Revalidation

The codebase relies on Next.js cache tags for feature-specific freshness. Shared tag factories live in `lib/data-cache.ts`, and feature actions revalidate or update those tags after writes.

## Repository Status

Older docs described a migration toward a `modules/` tree. The live repository is still organized around `features/`, `components/`, and `lib/`. New documentation should describe the live structure unless that migration is actually completed.
