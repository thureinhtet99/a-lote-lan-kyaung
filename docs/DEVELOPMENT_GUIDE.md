# Development Guide

Complete guide for developing features in the modular job portal application.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Initial Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd job-portal
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup environment variables:**

   ```bash
   cp .env.example .env
   ```

   Required variables:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/jobportal
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=http://localhost:3000
   UPLOADTHING_TOKEN=your-uploadthing-token
   ```

4. **Setup database:**

   ```bash
   # Generate migrations
   npx drizzle-kit generate

   # Run migrations
   npx drizzle-kit migrate

   # Seed database (optional)
   npm run db:seed
   ```

5. **Run development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/job-portal
├── app/                    # Next.js App Router (routes only)
├── modules/                # Feature modules (main logic)
│   ├── admin/
│   ├── employer/
│   ├── job-seeker/
│   ├── auth/
│   └── shared/
├── lib/                    # Core utilities
├── drizzle/               # Database schema
├── config/                # Configuration
├── docs/                  # Documentation
└── public/                # Static assets
```

## Development Workflow

### 1. Creating a New Feature

Follow this step-by-step process:

#### Step 1: Plan Your Feature

- **Identify the domain:** Admin, Employer, Job Seeker, or Shared?
- **Define requirements:** What does the feature do?
- **List dependencies:** What other modules/tables needed?

#### Step 2: Create Module Structure

```bash
# Example: Creating a notifications feature for job seekers
cd modules/job-seeker
mkdir -p notifications/{components,actions,db,types}
```

#### Step 3: Create Database Schema (if needed)

Update `drizzle/schema.ts`:

```typescript
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

Generate and run migration:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

#### Step 4: Create Database Queries

`modules/job-seeker/notifications/db/notifications-db.ts`:

```typescript
import { db } from "@/lib/db";
import { notifications } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getUserNotificationsDb(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(notifications.createdAt);
}

export async function markNotificationReadDb(notificationId: string) {
  return db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));
}
```

#### Step 5: Create Server Actions

`modules/job-seeker/notifications/actions/mark-notification-read.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { markNotificationReadDb } from "../db/notifications-db";

export async function markNotificationRead(notificationId: string) {
  try {
    await markNotificationReadDb(notificationId);
    revalidatePath("/notifications");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark notification as read" };
  }
}
```

#### Step 6: Create Components

`modules/job-seeker/notifications/components/notifications-list.tsx`:

```typescript
import { getUserNotificationsDb } from '../db/notifications-db';
import { NotificationItem } from './notification-item';

export async function NotificationsList({ userId }: { userId: string }) {
  const notifications = await getUserNotificationsDb(userId);

  if (notifications.length === 0) {
    return <p>No notifications</p>;
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
```

#### Step 7: Create Types

`modules/job-seeker/notifications/types/index.ts`:

```typescript
export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
};
```

#### Step 8: Export Public API

`modules/job-seeker/notifications/index.ts`:

```typescript
export * from "./components/notifications-list";
export * from "./actions/mark-notification-read";
export { getUserNotificationsDb } from "./db/notifications-db";
export type * from "./types";
```

#### Step 9: Add Route

`app/(job-seeker)/notifications/page.tsx`:

```typescript
import { NotificationsList } from '@/modules/job-seeker/notifications';
import { auth } from '@/modules/auth/lib/auth';
import { redirect } from 'next/navigation';

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers });

  if (!session) {
    redirect('/sign-in');
  }

  return (
    <div>
      <h1>Notifications</h1>
      <NotificationsList userId={session.user.id} />
    </div>
  );
}
```

#### Step 10: Update Documentation

- Add feature to module README
- Update MODULE_INDEX.md
- Add comments to complex code

### 2. Working with Existing Features

#### Finding Code

Use the module structure to locate code:

```
Need to update job listing form?
→ modules/employer/job-listings/components/job-listing-form.tsx

Need to modify user ban logic?
→ modules/admin/user-management/actions/ban-user.ts

Need to update button styles?
→ modules/shared/components/ui/button.tsx
```

#### Making Changes

1. **Open the module folder**
2. **Locate the specific file**
3. **Make your changes**
4. **Update tests**
5. **Update documentation if needed**

### 3. Database Operations

#### View Database

```bash
# Open Drizzle Studio
npm run db:studio
```

#### Reset Database

```bash
# ⚠️ Warning: Deletes all data!
npm run db:restart
```

#### Seed Database

```bash
npm run db:seed
```

## Best Practices

### Code Organization

✅ **DO:**

- Keep modules independent
- Use TypeScript for all files
- Export through `index.ts`
- Follow naming conventions
- Write descriptive comments

❌ **DON'T:**

- Create circular dependencies
- Mix business logic in components
- Use `any` type
- Import from internal module files
- Hardcode values

### Component Patterns

#### Server Components (Default)

```typescript
// Async server component
export async function UsersList() {
  const users = await getUsersDb();

  return (
    <div>
      {users.map(user => <UserCard key={user.id} user={user} />)}
    </div>
  );
}
```

#### Client Components

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Server Actions

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  // 1. Validate input
  const data = schema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  // 2. Check permissions
  const session = await auth.api.getSession({ headers });
  if (!session) {
    return { error: "Unauthorized" };
  }

  // 3. Perform action
  try {
    await createUserDb(data);

    // 4. Revalidate cache
    revalidatePath("/users");

    return { success: true };
  } catch (error) {
    return { error: "Failed to create user" };
  }
}
```

### Error Handling

```typescript
// Server action with error handling
export async function updateProfile(data: ProfileData) {
  try {
    await updateProfileDb(data);
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### TypeScript Types

```typescript
// Define proper types
export type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "employer" | "job_seeker";
};

// Use Zod for validation
import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["admin", "employer", "job_seeker"]),
});

export type UserFormData = z.infer<typeof userSchema>;
```

## Testing

### Unit Tests (Recommended)

```typescript
// __tests__/create-job-listing.test.ts
import { createJobListing } from "../actions/create-job-listing";

describe("createJobListing", () => {
  it("creates job listing successfully", async () => {
    const result = await createJobListing(mockData);
    expect(result.success).toBe(true);
  });

  it("validates required fields", async () => {
    const result = await createJobListing({});
    expect(result.error).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// __tests__/job-listing-flow.test.ts
import { createJobListing, publishJobListing } from "../actions";

describe("Job Listing Flow", () => {
  it("creates and publishes job listing", async () => {
    // Create
    const createResult = await createJobListing(mockData);
    expect(createResult.success).toBe(true);

    // Publish
    const publishResult = await publishJobListing(createResult.id);
    expect(publishResult.success).toBe(true);
  });
});
```

## Debugging

### Server-Side Debugging

```typescript
// Add console.log in server actions
export async function myAction() {
  console.log("Action called with:", arguments);

  const result = await someOperation();
  console.log("Result:", result);

  return result;
}
```

### Client-Side Debugging

```typescript
'use client';

import { useEffect } from 'react';

export function MyComponent() {
  useEffect(() => {
    console.log('Component mounted');
  }, []);

  return <div>Content</div>;
}
```

### Database Debugging

```bash
# View database queries in console
DATABASE_URL=postgresql://... npm run dev -- --verbose
```

## Common Tasks

### Add New Route

1. Create page in `/app`
2. Import module components
3. Handle authentication if needed

```typescript
// app/admin/reports/page.tsx
import { ReportsTable } from '@/modules/admin/reports';
import { auth } from '@/modules/auth/lib/auth';
import { redirect } from 'next/navigation';

export default async function ReportsPage() {
  const session = await auth.api.getSession({ headers });

  if (session?.user.role !== 'admin') {
    redirect('/');
  }

  return <ReportsTable />;
}
```

### Add New Database Table

1. Update `drizzle/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Run migration: `npx drizzle-kit migrate`
4. Create database query functions
5. Create server actions

### Update Shared Component

1. Locate component in `/modules/shared/components`
2. Make changes
3. Test in all places it's used
4. Update documentation if props changed

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

Ensure all required environment variables are set in production:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `UPLOADTHING_TOKEN`

### Database Migration

Run migrations before deploying:

```bash
npx drizzle-kit migrate
```

## Troubleshooting

### "Module not found" Error

- Check import path
- Verify `index.ts` exports
- Restart TypeScript server

### Database Connection Error

- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Test connection

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://better-auth.com/)
- [Shadcn UI](https://ui.shadcn.com/)

---

**Last Updated:** February 17, 2026
