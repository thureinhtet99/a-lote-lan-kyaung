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
  city: string | null;
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
    email: process.env.SEED_ADMIN_EMAIL!!,
    username: process.env.SEED_ADMIN_NAME!!,
    password: process.env.SEED_ADMIN_PASSWORD!!,
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
    description:
      "Build responsive candidate-facing experiences with Next.js, TypeScript, and modern component patterns.",
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
    description:
      "Design APIs, data models, and background processing for high-traffic hiring workflows.",
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
    description:
      "Support UX research, wireframing, and design system documentation for recruiting tools.",
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
    description:
      "Own outreach, screening, and candidate coordination across engineering and product roles.",
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
    description:
      "Help employers and applicants troubleshoot job posts, applications, and account issues.",
    wage: 15000,
    wageInterval: "hourly",
    city: null,
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
