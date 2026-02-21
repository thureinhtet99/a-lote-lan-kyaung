# Employer Module

This module contains all employer-specific functionality for managing job postings and organizations.

## Features

### Job Listings (`/job-listings`)

Complete job listing management:

- **Create job listings**: Post new job opportunities
- **Edit job listings**: Update existing postings
- **Delete job listings**: Remove job postings
- **Publish/Draft**: Control job listing visibility
- **Featured listings**: Promote important job postings
- **View applications**: See applicants for each job

**Key Files:**

- `components/job-listing-form.tsx` - Job creation/editing form
- `components/job-listing-item.tsx` - Individual listing card
- `actions.ts` - All job listing server actions
- `db/job-listing-db.ts` - Database queries

### Organizations (`/organizations`)

Organization and team management:

- **Create organizations**: Set up company profiles
- **Manage members**: Invite and manage team members
- **Role management**: Assign roles (owner, admin, member)
- **Organization settings**: Configure company information
- **Subscription management**: Handle organization plans

**Key Files:**

- `components/sidebar-org-button.tsx` - Organization switcher
- `actions/manage-organizations.ts` - Organization CRUD
- `db/organizations-db.ts` - Organization queries

### Pricing (`/pricing`)

Subscription plans and billing:

- **Plan selection**: Choose subscription tier
- **Feature comparison**: View plan features
- **Upgrade/Downgrade**: Change subscription
- **Billing history**: View past transactions

### Dashboard (`/dashboard`)

Employer overview:

- **Active listings**: View all job postings
- **Application metrics**: Track application statistics
- **Recent applications**: Latest applicant activity
- **Quick actions**: Common tasks

## Usage Example

```typescript
// Creating a job listing
import { createJobListing } from "@/modules/employer/job-listings";

export async function handleCreateJob(data: JobListingFormData) {
  const result = await createJobListing(data);
  return result;
}
```

## File Structure

```
/employer
├── job-listings/
│   ├── components/
│   ├── actions/
│   ├── db/
│   ├── lib/
│   ├── schemas/
│   └── index.ts
├── organizations/
│   ├── components/
│   ├── actions/
│   ├── db/
│   └── index.ts
├── pricing/
│   ├── components/
│   └── index.ts
└── dashboard/
    ├── components/
    └── index.ts
```

## Permissions

Employer module features require the `employer` role.

## Plan Limits

Different subscription plans have different limits:

- **Free**: 3 active listings, no featured listings
- **Pro**: 10 active listings, 2 featured listings
- **Enterprise**: Unlimited listings, unlimited featured

## Routes

- `/employer` - Dashboard
- `/employer/job-listings` - Job listings management
- `/employer/job-listings/new` - Create new job listing
- `/employer/job-listings/[id]` - View job and applications
- `/employer/job-listings/[id]/edit` - Edit job listing
- `/employer/organizations` - Organization management
- `/employer/pricing` - Plans and billing

## Dependencies

- **Shared Module**: UI components, markdown editor
- **Auth Module**: User authentication
- **Job Seeker Module**: Application components (view-only)
- **Database**: Job listings, organizations tables

## Testing

```bash
# Run employer module tests
npm test -- employer
```

## Contributing

When adding new employer features:

1. Create feature subfolder in `/employer`
2. Follow the standard module structure
3. Check plan limits before allowing actions
4. Export public API in `index.ts`
5. Update this README
