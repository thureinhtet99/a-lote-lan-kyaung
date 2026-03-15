# A-lote-lann-kyaung

A full-stack hiring platform built with Next.js, Drizzle ORM, Better Auth, and PostgreSQL.

The codebase supports three primary audiences:

- **Users** browsing and applying for jobs
- **Employers** managing organizations, listings, invitations, and applications
- **Admins** reviewing access requests and monitoring the platform
  
**Live:** https://a-lote-lan-kyaung.vercel.app/

## Overview

The repository is organized in `app/`, feature-level business logic in `features/`, shared UI in `components/`, and cross-cutting utilities in `lib/`, `services/`, and `drizzle/`. See more details in [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

**View project visualization in:** [a-lote-lann-kyaung.pdf](./docs/a-lote-lann-kyaung.drawio.pdf) or [a-lote-lann-kyaung.drawio](./docs/a-lote-lann-kyaung.drawio).

Core product capabilities include:

- _Job listing_ discovery, filtering, and application workflows
- _Employer_ and _organization_ request review flows
- _Organization membership_, _invitations_, and _role management_
- _Notification-driven_ _organization claim_ flow
- Admin _user management_

## Tech Stack

- Framework: Next.js 16 App Router
- Language: TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication and RBAC (Role-based access control): Better Auth
- UI: Tailwind CSS and shadcn/ui primitives
- File uploads: UploadThing
- Rich text and markdown: MDXEditor
<!-- - Email delivery: Resend-backed invitation service -->

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure environment variables

```bash
cp .env.example .env
```

Minimum local setup usually needs:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_BASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `UPLOADTHING_TOKEN`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_NAME`
- `SEED_ADMIN_PASSWORD`

For BETTER_AUTH_SECRET, go visit to: *https://better-auth.com/docs/installation* and **Generate Secret**.

You can also use:

```bash
openssl rand -base64 32
```

to generate one.

### Prepare the database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed script recreates the default users and organizations, then inserts sample job listings.

### Start the app

```bash
npm run dev
```

Open http://localhost:3000.

## Common Commands

- `npm run dev` starts the development server
- `npm run build` creates the production build
- `npm run db:generate` creates a Drizzle migration
- `npm run db:migrate` applies migrations
- `npm run db:seed` reseeds local development data
- `npm run db:studio` opens Drizzle Studio
- `npm run detect` runs knip
