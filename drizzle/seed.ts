import {
  jobListingTable,
  memberTable,
  organizationTable,
  userTable,
  type ExperienceLevelType,
  type JobListingStatusType,
  type JobListingTypeType,
  type LocationRequirementType,
  type WageIntervalType,
} from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { UserRoleType } from "@/types/index.type";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

type SeedAccount = {
  email: string;
  username: string;
  password: string;
  role: UserRoleType;
};

type SeedOrganization = {
  employerEmail: string;
  name: string;
  slug: string;
  logo?: string | null;
};

type SeedJobListing = {
  employerEmail: string;
  title: string;
  description: string;
  wage: number;
  wageInterval: WageIntervalType;
  city: string;
  locationRequirement: LocationRequirementType;
  experienceLevel: ExperienceLevelType;
  status: JobListingStatusType;
  type: JobListingTypeType;
  postedDaysAgo: number;
};

const seedAccounts: SeedAccount[] = [
  {
    email: "user.one@test.com",
    username: "testuserone",
    password: "Test123!",
    role: "user",
  },
  {
    email: "user.two@test.com",
    username: "testusertwo",
    password: "Test123!",
    role: "user",
  },
  {
    email: "employer.one@test.com",
    username: "testemployerone",
    password: "Test123!",
    role: "employer",
  },
  {
    email: "employer.two@test.com",
    username: "testemployertwo",
    password: "Test123!",
    role: "employer",
  },
  {
    email: process.env.SEED_ADMIN_EMAIL || "admin.one@test.com",
    username: process.env.SEED_ADMIN_NAME || "testadmin",
    password: process.env.SEED_ADMIN_PASSWORD || "Test123!",
    role: "admin",
  },
];

const seedOrganizations: SeedOrganization[] = [
  {
    employerEmail: "employer.one@test.com",
    name: "Acme Talent Co",
    slug: "acme-talent-co",
  },
  {
    employerEmail: "employer.two@test.com",
    name: "Nexus Career Lab",
    slug: "nexus-career-lab",
  },
];

const seedJobListings: SeedJobListing[] = [
  {
    employerEmail: "employer.one@test.com",
    title: "Frontend Engineer",
    description: `
## Frontend Engineer

### Role Summary
You will build responsive, fast, and accessible interfaces for job seekers and employers. This role focuses on shipping product features end-to-end with design and backend teammates.

### Responsibilities
- Build and maintain pages and reusable UI components with Next.js and TypeScript.
- Implement polished user flows for job search, application, and employer dashboards.
- Improve performance metrics such as LCP, INP, and bundle size.
- Collaborate with designers to translate wireframes into production-ready interfaces.
- Write tests and participate in code reviews.

### Requirements
- 3+ years of frontend product development experience.
- Strong TypeScript, React, and modern CSS skills.
- Practical knowledge of accessibility and responsive design.
- Experience integrating REST or RPC APIs into frontend apps.

### Nice to Have
- Experience with markdown editors/renderers.
- Familiarity with design systems and component libraries.

### Benefits
- Flexible hybrid work setup.
- Learning budget and mentorship support.
- Opportunity to shape a growing recruitment platform.
`.trim(),
    wage: 2500000,
    wageInterval: "monthly",
    city: "Yangon",
    locationRequirement: "hybrid",
    experienceLevel: "mid-level",
    status: "published",
    type: "full-time",
    postedDaysAgo: 1,
  },
  {
    employerEmail: "employer.one@test.com",
    title: "Backend Engineer",
    description: `
## Backend Engineer

### Role Summary
You will design and operate backend services that power job listings, applications, notifications, and organization workflows. The role requires a strong balance of delivery speed, reliability, and clean architecture.

### Responsibilities
- Design APIs and data models for hiring and employer workflows.
- Build background jobs for notifications, email delivery, and lifecycle events.
- Improve query performance and database reliability.
- Implement authorization and role-based access controls across services.
- Document technical decisions and support incident response when needed.

### Requirements
- 4+ years of backend engineering experience.
- Strong Node.js and TypeScript fundamentals.
- Solid SQL and relational database design skills.
- Experience with authentication, authorization, and secure API patterns.

### Nice to Have
- Experience with Drizzle ORM and Neon/PostgreSQL.
- Familiarity with observability and queue-based architectures.

### Benefits
- Competitive monthly compensation.
- Clear growth path to senior/staff ownership.
- High-impact role in a core product team.
`.trim(),
    wage: 3200000,
    wageInterval: "monthly",
    city: "Mandalay",
    locationRequirement: "on-site",
    experienceLevel: "senior",
    status: "published",
    type: "full-time",
    postedDaysAgo: 2,
  },
  {
    employerEmail: "employer.one@test.com",
    title: "Product Design Intern",
    description: `
## Product Design Intern

### Role Summary
You will support product designers in improving candidate and employer experiences. This internship is ideal for someone building practical UX skills through real product work.

### Responsibilities
- Assist with user research preparation, interview notes, and synthesis.
- Create wireframes and high-fidelity mockups for new features.
- Help maintain design system documentation and component usage examples.
- Partner with engineers to review implementation quality.
- Contribute to usability improvements and accessibility checks.

### Requirements
- Portfolio with at least 2 UX or product design projects.
- Basic understanding of user flows, information architecture, and visual hierarchy.
- Comfortable using Figma for layout and prototyping.
- Strong communication and willingness to learn quickly.

### Nice to Have
- Experience in internship, student club, or freelance product design work.
- Interest in recruitment, career, or marketplace products.

### Benefits
- Structured mentorship and feedback cycles.
- Real production features for your portfolio.
- Supportive cross-functional team environment.
`.trim(),
    wage: 180000,
    wageInterval: "monthly",
    city: "Yangon",
    locationRequirement: "hybrid",
    experienceLevel: "junior",
    status: "published",
    type: "internship",
    postedDaysAgo: 3,
  },
  {
    employerEmail: "employer.two@test.com",
    title: "Technical Recruiter",
    description: `
## Technical Recruiter

### Role Summary
You will own the recruiting funnel for technical roles and partner closely with hiring managers to improve hiring speed and candidate quality.

### Responsibilities
- Build sourcing strategies for engineering and product roles.
- Manage screening, interview scheduling, and candidate communications.
- Maintain a high-quality candidate experience from first touch to offer.
- Track pipeline health and report weekly hiring metrics.
- Partner with employers to refine job descriptions and interview rubrics.

### Requirements
- 2+ years of technical recruiting experience.
- Strong communication and stakeholder management skills.
- Ability to evaluate basic technical fit for software roles.
- Experience using ATS tools and structured interview processes.

### Nice to Have
- Experience recruiting for startup or high-growth teams.
- Familiarity with employer branding content and campaigns.

### Benefits
- Performance bonus tied to hiring outcomes.
- Direct collaboration with founders and hiring leaders.
- Clear ownership over recruiting operations.
`.trim(),
    wage: 2200000,
    wageInterval: "monthly",
    city: "Naypyitaw",
    locationRequirement: "on-site",
    experienceLevel: "mid-level",
    status: "published",
    type: "full-time",
    postedDaysAgo: 4,
  },
  {
    employerEmail: "employer.two@test.com",
    title: "Customer Support Specialist",
    description: `
## Customer Support Specialist

### Role Summary
You will help employers and applicants resolve platform issues with speed, empathy, and clear communication. You will also identify recurring problems and help improve support operations.

### Responsibilities
- Resolve tickets related to job posts, applications, and account access.
- Guide users through troubleshooting steps across web and email channels.
- Escalate product bugs with clear reproduction details.
- Maintain support documentation and response templates.
- Share weekly insights on recurring pain points and user feedback.

### Requirements
- 1+ years of customer support experience in a digital product.
- Excellent written communication and problem-solving skills.
- Ability to prioritize multiple conversations and meet SLA targets.
- Comfort with dashboards, admin tools, and support workflows.

### Nice to Have
- Experience supporting SaaS products for B2B customers.
- Familiarity with basic SQL or analytics tooling.

### Benefits
- Remote-friendly workflow.
- Training on support playbooks and product domain knowledge.
- Opportunity to grow into support operations or success roles.
`.trim(),
    wage: 15000,
    wageInterval: "hourly",
    city: "Mandalay",
    locationRequirement: "remote",
    experienceLevel: "junior",
    status: "published",
    type: "part-time",
    postedDaysAgo: 5,
  },
];

function createPastDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

async function seedAccount(account: SeedAccount) {
  const result = await auth.api.signUpEmail({
    body: {
      email: account.email,
      password: account.password,
      name: account.username,
    },
  });

  if (!result?.user?.id) {
    throw new Error(`Failed to create account: ${account.email}`);
  }

  await db
    .update(userTable)
    .set({ role: account.role })
    .where(eq(userTable.id, result.user.id));

  return result.user.id;
}

async function seedOrganization(
  employerUserId: string,
  organization: SeedOrganization,
) {
  const organizationId = nanoid();

  await db.insert(organizationTable).values({
    id: organizationId,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo ?? null,
    createdAt: new Date(),
  });

  await db.insert(memberTable).values({
    id: nanoid(),
    organizationId,
    userId: employerUserId,
    role: "org-admin",
    createdAt: new Date(),
  });

  return organizationId;
}

async function seedOrganizationsForEmployers(
  userIdsByEmail: Map<string, string>,
  organizations: SeedOrganization[] = seedOrganizations,
) {
  const organizationIdsByEmployerEmail = new Map<string, string>();

  for (const organization of organizations) {
    const employerUserId = userIdsByEmail.get(organization.employerEmail);
    if (!employerUserId) {
      throw new Error(
        `Failed to create organization: missing employer ${organization.employerEmail}`,
      );
    }

    const organizationId = await seedOrganization(employerUserId, organization);
    organizationIdsByEmployerEmail.set(
      organization.employerEmail,
      organizationId,
    );
  }

  return organizationIdsByEmployerEmail;
}

async function seedJobListingsForOrganizations(
  organizationIdsByEmployerEmail: Map<string, string>,
  listings: SeedJobListing[] = seedJobListings,
) {
  const values = listings.map((listing) => {
    const organizationId = organizationIdsByEmployerEmail.get(
      listing.employerEmail,
    );

    if (!organizationId) {
      throw new Error(
        `Failed to create job listing: missing organization for ${listing.employerEmail}`,
      );
    }

    return {
      id: nanoid(),
      organizationId,
      title: listing.title,
      description: listing.description,
      wage: listing.wage,
      wageInterval: listing.wageInterval,
      city: listing.city,
      locationRequirement: listing.locationRequirement,
      experienceLevel: listing.experienceLevel,
      status: listing.status,
      type: listing.type,
      posted_at: createPastDate(listing.postedDaysAgo),
    };
  });

  await db.insert(jobListingTable).values(values);

  return values.map((listing) => listing.id);
}

async function seed(accounts: SeedAccount[] = seedAccounts) {
  try {
    console.log("Cleaning up existing data...");
    await db.delete(organizationTable);
    await db.delete(userTable);
    console.log("Cleanup complete!");

    const createdUserIds: string[] = [];
    const userIdsByEmail = new Map<string, string>();

    for (const account of accounts) {
      const id = await seedAccount(account);
      createdUserIds.push(id);
      userIdsByEmail.set(account.email, id);
    }

    const organizationIdsByEmployerEmail =
      await seedOrganizationsForEmployers(userIdsByEmail);
    const createdJobListingIds = await seedJobListingsForOrganizations(
      organizationIdsByEmployerEmail,
    );

    console.log(`Created ${createdUserIds.length} accounts successfully!`);
    console.log(
      `Created ${organizationIdsByEmployerEmail.size} organizations successfully!`,
    );
    console.log(
      `Created ${createdJobListingIds.length} job listings successfully!`,
    );

    return createdUserIds;
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed script failed:", error);
      process.exit(1);
    });
}

export { seed };
