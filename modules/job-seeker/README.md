# Job Seeker Module

This module contains all job seeker functionality for browsing jobs and managing applications.

## Features

### Job Listings (`/job-listings`)

Browse and search for jobs:

- **Search jobs**: Filter by title, location, type
- **View job details**: See full job descriptions
- **Browse listings**: Paginated job list
- **Filter by state**: Location-based filtering
- **Featured jobs**: Highlighted opportunities

### Applications (`/applications`)

Manage job applications:

- **Apply for jobs**: Submit applications with cover letter
- **Track applications**: View application status
- **Application history**: See past applications
- **Application ratings**: Employer ratings (if provided)
- **Status updates**: Track application progress

**Key Files:**

- `components/application-table.tsx` - Application list
- `components/NewJobListingApplicationForm.tsx` - Application form
- `actions/create-job-listing-application.ts` - Submit application
- `db/job-listing-application-db.ts` - Application queries

**Application Statuses:**

- `pending` - Under review
- `reviewing` - Being evaluated
- `accepted` - Offer extended
- `rejected` - Application declined

### Profile (`/profile`)

User profile management:

- **Edit profile**: Update personal information
- **Profile picture**: Upload profile photo
- **Contact details**: Manage email, phone
- **Bio**: Personal summary

### Resume (`/resume`)

Resume management:

- **Upload resume**: Upload PDF resume
- **Update resume**: Replace existing resume
- **Download resume**: Get current resume file
- **Resume preview**: View uploaded resume

### Settings (`/settings`)

User preferences:

- **Notifications**: Email notification settings
- **Account settings**: Privacy preferences
- **Employer request**: Request employer account

## Usage Example

```typescript
// Applying for a job
import { createJobListingApplication } from "@/modules/job-seeker/applications";

export async function handleApply(data: ApplicationFormData) {
  const result = await createJobListingApplication(data);
  return result;
}
```

## File Structure

```
/job-seeker
├── job-listings/
│   ├── components/
│   ├── pages/
│   └── index.ts
├── applications/
│   ├── components/
│   ├── actions/
│   ├── db/
│   ├── lib/
│   ├── types/
│   └── index.ts
├── profile/
│   ├── components/
│   └── index.ts
├── resume/
│   ├── components/
│   └── index.ts
└── settings/
    ├── components/
    └── index.ts
```

## Permissions

Job seeker module features require the `job_seeker` role.

## Routes

- `/` - Job listings homepage
- `/job-listings/[id]` - Job details
- `/settings` - Settings menu
- `/settings/profile` - Profile settings
- `/settings/resume` - Resume management
- `/settings/notifications` - Notification preferences
- `/settings/employer-request` - Request employer account

## Dependencies

- **Shared Module**: UI components, markdown viewer
- **Auth Module**: User authentication
- **Employer Module**: Job listings (read-only)
- **Database**: Applications, users tables

## Features

### Application Tracking

Job seekers can track their applications through various stages:

1. **Submit Application**: Initial submission
2. **Under Review**: Employer reviewing
3. **Interview**: Interview scheduled
4. **Offer**: Job offer received
5. **Rejected**: Application not selected

### Notifications

Users can receive notifications for:

- New job postings matching preferences
- Application status updates
- Interview invitations
- Job offers

## Testing

```bash
# Run job seeker module tests
npm test -- job-seeker
```

## Contributing

When adding new job seeker features:

1. Create feature subfolder in `/job-seeker`
2. Follow the standard module structure
3. Consider notification integration
4. Export public API in `index.ts`
5. Update this README
