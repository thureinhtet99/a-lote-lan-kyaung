import {
  accountTable,
  applicationTable,
  employerRequestTable,
  invitationTable,
  jobListingTable,
  memberTable,
  notificationTable,
  organizationTable,
  organizationRequestTable,
  resumeTable,
  sessionTable,
  notificationSettingsTable,
  userTable,
  verificationTable,
} from "@/drizzle/schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

type AppRole = "admin" | "employer" | "user";
type OrgRole = "org-admin" | "hr";

type SeedUser = {
  email: string;
  name: string;
  role: AppRole;
};

type CreatedSeedUser = SeedUser & { id: string };
type EmployerRequestInsert = typeof employerRequestTable.$inferInsert;
type OrganizationRequestInsert = typeof organizationRequestTable.$inferInsert;

async function createUser(
  email: string,
  name: string,
  password: string = "Test123!",
) {
  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name,
    },
  });

  if (!result?.user?.id) {
    throw new Error(`Failed to create user: ${email}`);
  }

  console.log(`✅ Created user: ${email} (${name})`);
  return result.user.id;
}

async function createUserWithRole(user: SeedUser): Promise<CreatedSeedUser> {
  const userId = await createUser(user.email, user.name);

  await db
    .update(userTable)
    .set({ role: user.role })
    .where(eq(userTable.id, userId));

  console.log(`✅ Set role=${user.role} for ${user.email}`);
  await new Promise((resolve) => setTimeout(resolve, 50));

  return { ...user, id: userId };
}

async function addMemberToOrg(
  userId: string,
  organizationId: string,
  role: OrgRole,
) {
  await db.insert(memberTable).values({
    id: nanoid(),
    userId,
    organizationId,
    role,
    createdAt: new Date(),
  });
}

async function seed() {
  try {
    console.log("🌱 Starting seed...");
    console.log("🧹 Cleaning up existing data...");

    await db.delete(applicationTable);
    await db.delete(notificationTable);
    await db.delete(jobListingTable);
    await db.delete(notificationSettingsTable);
    await db.delete(resumeTable);
    await db.delete(memberTable);
    await db.delete(invitationTable);
    await db.delete(employerRequestTable);
    await db.delete(organizationRequestTable);
    await db.delete(accountTable);
    await db.delete(sessionTable);
    await db.delete(verificationTable);
    await db.delete(organizationTable);
    await db.delete(userTable);

    console.log("✅ Cleanup complete");
    console.log("");

    console.log("👤 Creating users (2 admins, 3 employers, 14 users)");

    const baseUserPlan: SeedUser[] = [
      { email: "admin.one@test.com", name: "Admin One", role: "admin" },
      { email: "admin.two@test.com", name: "Admin Two", role: "admin" },
      {
        email: "employer.one@test.com",
        name: "Employer One",
        role: "employer",
      },
      {
        email: "employer.two@test.com",
        name: "Employer Two",
        role: "employer",
      },
      {
        email: "employer.three@test.com",
        name: "Employer Three",
        role: "employer",
      },
      { email: "user.one@test.com", name: "User One", role: "user" },
      { email: "user.two@test.com", name: "User Two", role: "user" },
      { email: "user.three@test.com", name: "User Three", role: "user" },
      { email: "user.four@test.com", name: "User Four", role: "user" },
    ];
    const extraUserPlan: SeedUser[] = Array.from({ length: 10 }, (_, index) => {
      const userNumber = index + 5;
      return {
        email: `user.${userNumber}@test.com`,
        name: `User ${userNumber}`,
        role: "user",
      };
    });
    const userPlan: SeedUser[] = [...baseUserPlan, ...extraUserPlan];

    const createdUsers: CreatedSeedUser[] = [];
    for (const user of userPlan) {
      createdUsers.push(await createUserWithRole(user));
    }

    const admins = createdUsers.filter((u) => u.role === "admin");
    const employers = createdUsers.filter((u) => u.role === "employer");
    const users = createdUsers.filter((u) => u.role === "user");

    console.log("✅ 19 users created ");
    console.log("");

    console.log("🏢 Creating organizations (1 organization per employer)...");

    const orgBlueprints = [
      { name: "Atlas Tech", slug: "atlas-tech" },
      { name: "Vertex Labs", slug: "vertex-labs" },
      { name: "Blue Orbit", slug: "blue-orbit" },
    ];

    const orgSeeds = employers.map((employer, index) => ({
      id: nanoid(),
      name: orgBlueprints[index]?.name ?? `Employer Org ${index + 1}`,
      slug: orgBlueprints[index]?.slug ?? `employer-org-${index + 1}`,
      ownerId: employer.id,
      hrUserId: users[index % users.length].id,
    }));

    await db.insert(organizationTable).values(
      orgSeeds.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: null,
        metadata: null,
        createdAt: new Date(),
      })),
    );

    for (const org of orgSeeds) {
      console.log(`✅ Created organization: ${org.name}`);
    }

    console.log("");
    console.log("👥 Creating organization members...");

    for (let i = 0; i < orgSeeds.length; i++) {
      const org = orgSeeds[i];
      const userMember = users[i % users.length];

      await addMemberToOrg(org.ownerId, org.id, "org-admin");
      await addMemberToOrg(userMember.id, org.id, "hr");

      console.log(`✅ Added 2 members to ${org.name}`);
    }

    console.log("🔔 Creating user notification settings...");
    await db.insert(notificationSettingsTable).values(
      createdUsers.map((u, index) => ({
        userId: u.id,
        newJobEmailNotification: index % 2 === 0,
        aiPrompt:
          u.role === "user"
            ? "Notify me for remote software roles."
            : "Notify me for relevant marketplace updates.",
      })),
    );
    console.log("✅ Notification settings inserted");
    console.log("");

    console.log("📄 Creating resumes for all regular users...");
    await db.insert(resumeTable).values(
      users.map((u, index) => ({
        userId: u.id,
        resumeFileUrl: `https://example.com/resumes/${u.email.replace("@", "-at-")}.pdf`,
        resumeFileKey: `resume-${index + 1}`,
        resumeFileName: `${u.email.split("@")[0]}-resume.pdf`,
      })),
    );
    console.log("✅ Resumes inserted");
    console.log("");

    console.log("✉️ Creating invitations...");
    const invitationTargets = [users[0], users[1], users[2], users[3]];
    await db.insert(invitationTable).values(
      orgSeeds.slice(0, 4).map((org, index) => ({
        id: nanoid(),
        organizationId: org.id,
        email: invitationTargets[index].email,
        role: (index % 2 === 0 ? "hr" : "org-admin") as "hr" | "org-admin",
        status: index === 3 ? "accepted" : "pending",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        inviterId: org.ownerId,
      })),
    );
    console.log("✅ Invitations inserted");
    console.log("");

    console.log("💼 Creating employer requests...");
    const baseEmployerRequests: EmployerRequestInsert[] = [
      {
        id: nanoid(),
        userId: users[0].id,
        status: "pending",
        requestMessage: "I want to post jobs for my startup.",
      },
      {
        id: nanoid(),
        userId: users[1].id,
        status: "rejected",
        requestMessage: "Please upgrade me to employer.",
        adminResponse: "Need more business information.",
        reviewedBy: admins[0].id,
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        id: nanoid(),
        userId: employers[0].id,
        status: "approved",
        requestMessage: "Historical request for employer access.",
        adminResponse: "Approved.",
        reviewedBy: admins[1].id,
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
    ];
    const extraEmployerRequests: EmployerRequestInsert[] = Array.from(
      { length: 22 },
      (_, index) => {
        const requester = users[index % users.length];
        const requestNumber = index + 1;
        const isPending = index < 11;
        const reviewer = admins[index % admins.length];
        const isApproved = index % 2 === 0;

        if (isPending) {
          return {
            id: nanoid(),
            userId: requester.id,
            status: "pending" as const,
            requestMessage: `Pagination request ${requestNumber}: requesting employer access for hiring needs.`,
          };
        }

        return {
          id: nanoid(),
          userId: requester.id,
          status: (isApproved ? "approved" : "rejected") as
            | "approved"
            | "rejected",
          requestMessage: `Reviewed pagination request ${requestNumber}: employer access follow-up.`,
          adminResponse: isApproved
            ? "Approved for pagination test data."
            : "Rejected for pagination test data.",
          reviewedBy: reviewer.id,
          reviewedAt: new Date(
            Date.now() - 1000 * 60 * 60 * (requestNumber + 12),
          ),
        };
      },
    );
    await db
      .insert(employerRequestTable)
      .values([...baseEmployerRequests, ...extraEmployerRequests]);
    console.log("✅ Employer requests inserted");
    console.log("");

    console.log("🏢 Creating organization requests...");
    const baseOrganizationRequests: OrganizationRequestInsert[] = [
      {
        id: nanoid(),
        userId: employers[1].id,
        orgName: "Harbor Analytics",
        orgSlug: "harbor-analytics",
        orgLogo: "https://example.com/logos/harbor-analytics.png",
        requestMessage:
          "We need an organization workspace to manage hiring for our analytics consultancy.",
        status: "pending",
      },
      {
        id: nanoid(),
        userId: employers[2].id,
        orgName: "Cedar Systems",
        orgSlug: "cedar-systems",
        orgLogo: null,
        requestMessage:
          "Requesting organization creation so our team can post engineering roles this quarter.",
        status: "rejected",
        adminResponse:
          "Please provide a company website and legal entity details before resubmitting.",
        reviewedBy: admins[0].id,
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
      },
      {
        id: nanoid(),
        userId: employers[0].id,
        orgName: "Atlas Tech",
        orgSlug: "atlas-tech",
        orgLogo: "https://example.com/logos/atlas-tech.png",
        requestMessage:
          "Historical approved request used to bootstrap this organization in seed data.",
        status: "approved",
        adminResponse: "Approved. Organization created.",
        reviewedBy: admins[1].id,
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 60),
        createdOrganizationId: orgSeeds[0].id,
      },
    ];
    const extraOrganizationRequests: OrganizationRequestInsert[] = Array.from(
      { length: 22 },
      (_, index) => {
        const requester = employers[index % employers.length];
        const orgNumber = index + 1;
        const isPending = index < 11;
        const reviewer = admins[index % admins.length];
        const isApproved = index % 2 === 0;

        if (isPending) {
          return {
            id: nanoid(),
            userId: requester.id,
            orgName: `Requested Org ${orgNumber}`,
            orgSlug: `requested-org-${orgNumber}`,
            orgLogo: null,
            requestMessage: `Pagination request ${orgNumber}: creating organization workspace for recruiting.`,
            status: "pending",
          };
        }

        return {
          id: nanoid(),
          userId: requester.id,
          orgName: `Reviewed Org ${orgNumber}`,
          orgSlug: `reviewed-org-${orgNumber}`,
          orgLogo: null,
          requestMessage: `Reviewed pagination request ${orgNumber}: organization setup request.`,
          status: isApproved ? "approved" : "rejected",
          adminResponse: isApproved
            ? "Approved for pagination test data."
            : "Rejected for pagination test data.",
          reviewedBy: reviewer.id,
          reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * (orgNumber + 20)),
        };
      },
    );
    await db
      .insert(organizationRequestTable)
      .values([...baseOrganizationRequests, ...extraOrganizationRequests]);
    console.log("✅ Organization requests inserted");
    console.log("");

    console.log("📝 Creating job listings (different set for each org)...");

    const jobListings = orgSeeds.flatMap((org, index) => {
      const stateCity = [
        "Yangon",
        "Mandalay",
        "Bago",
        "Pakokku",
        "An",
        "Nay Pyi Taw",
        "Kyaukse",
        "Sagaing",
        "Magway",
      ];
      const city = stateCity[index];

      return [
        {
          id: nanoid(),
          organizationId: org.id,
          title: `${org.name} Senior Engineer`,
          description: `About the role:
${org.name} is hiring a Senior Engineer to lead delivery on core product initiatives and improve platform reliability as we scale.

What you will do:
- Design and ship backend/frontend features used by customers daily.
- Lead technical design reviews and guide implementation across services.
- Mentor junior engineers through code reviews and pairing.
- Improve performance, observability, and incident response workflows.
- Work closely with product and design to break down roadmap items.

What we are looking for:
- 5+ years of software engineering experience in production systems.
- Strong TypeScript/JavaScript fundamentals and modern web stack knowledge.
- Experience with SQL databases, API design, and scalable architectures.
- Clear communication and ownership mindset.

Nice to have:
- Experience in hiring platforms, marketplaces, or workflow products.
- Familiarity with CI/CD, feature flags, and monitoring tools.

Benefits:
- Competitive salary, flexible schedule, and remote-friendly collaboration.
- Career growth, mentorship opportunities, and high ownership.`,
          wage: 130000 + index * 2000,
          wageInterval: "yearly" as const,
          city,
          isFeatured: true,
          locationRequirement: "hybrid" as const,
          experienceLevel: "senior" as const,
          status: "published" as const,
          type: "full-time" as const,
          posted_at: new Date(),
        },
        {
          id: nanoid(),
          organizationId: org.id,
          title: `${org.name} Product Designer`,
          description: `About the role:
${org.name} is looking for a Product Designer to craft intuitive experiences across our employer and candidate workflows.

What you will do:
- Run lightweight discovery and convert insights into clear design direction.
- Design user flows, wireframes, prototypes, and production-ready UI.
- Partner with PMs and engineers from concept to launch.
- Contribute to and evolve our design system and accessibility standards.
- Use metrics and feedback to iterate on shipped experiences.

What we are looking for:
- 3+ years in product design for SaaS or web applications.
- Strong portfolio showing problem framing and shipped outcomes.
- Proficiency with Figma and component-based design systems.
- Comfort collaborating in fast-moving cross-functional teams.

Nice to have:
- Experience with B2B dashboards and data-dense interfaces.
- Familiarity with UX writing and information architecture.

Benefits:
- Flexible work environment and supportive product culture.
- Opportunity to shape foundational UX patterns at scale.`,
          wage: 90000 + index * 1000,
          wageInterval: "yearly" as const,

          city,
          isFeatured: false,
          locationRequirement: "remote" as const,
          experienceLevel: "mid-level" as const,
          status: "published" as const,
          type: "full-time" as const,
          posted_at: new Date(),
        },
        {
          id: nanoid(),
          organizationId: org.id,
          title: `${org.name} Intern`,
          description: `About the internship:
${org.name} is offering a hands-on internship for students and early-career candidates interested in real-world product development.

What you will do:
- Support engineers/designers with small scoped tickets and bug fixes.
- Write tests, improve documentation, and assist with QA checks.
- Participate in standups, sprint planning, and demo sessions.
- Learn development best practices, version control, and team workflows.

What we are looking for:
- Basic understanding of web development fundamentals.
- Eagerness to learn, ask questions, and act on feedback.
- Good communication and time management skills.

What you will gain:
- Mentorship from experienced team members.
- Portfolio-ready project contributions.
- Exposure to product, engineering, and collaboration tools used in industry.`,
          wage: 24 + index,
          wageInterval: "hourly" as const,

          city,
          isFeatured: false,
          locationRequirement: "on-site" as const,
          experienceLevel: "junior" as const,
          status: index % 2 === 0 ? ("draft" as const) : ("delisted" as const),
          type: "internship" as const,
          posted_at: null,
        },
      ];
    });

    await db.insert(jobListingTable).values(jobListings);
    console.log(`✅ Inserted ${jobListings.length} job listings`);
    console.log("");

    console.log("📬 Creating applications from regular users...");

    const publishedListings = jobListings.filter(
      (j) => j.status === "published",
    );
    if (publishedListings.length < 2) {
      throw new Error(
        "Expected at least 2 published job listings to seed applications.",
      );
    }

    const applicationRows = users.flatMap((u, userIndex) => {
      const first =
        publishedListings[(userIndex * 2) % publishedListings.length];
      const second =
        publishedListings[(userIndex * 2 + 1) % publishedListings.length];
      const resumeFileUrl = `https://example.com/resumes/${u.email.replace("@", "-at-")}.pdf`;

      return [
        {
          jobListingId: first.id,
          userId: u.id,
          resumeFileUrl,
          coverLetter: `Hello, I am ${u.name} and I am interested in this role.`,
          status: "applied" as const,
          rating: null,
        },
        {
          jobListingId: second.id,
          userId: u.id,
          resumeFileUrl,
          coverLetter: `I believe I am a strong fit for this opportunity.`,
          status:
            userIndex % 2 === 0
              ? ("interviewed" as const)
              : ("applied" as const),
          rating: userIndex % 2 === 0 ? 4 : null,
        },
      ];
    });

    await db.insert(applicationTable).values(applicationRows);
    console.log(`✅ Inserted ${applicationRows.length} applications`);
    console.log("");

    console.log("✨ Seeding completed successfully!");
    console.log("");
    console.log("=".repeat(60));
    console.log("📋 TEST CREDENTIALS");
    console.log("=".repeat(60));
    console.log("🔑 All passwords: Test123!");
    console.log("");
    console.log("👨‍💼 ADMINS:");
    console.log("  • admin.one@test.com");
    console.log("  • admin.two@test.com");
    console.log("");
    console.log("👑 EMPLOYERS:");
    console.log("  • employer.one@test.com");
    console.log("  • employer.two@test.com");
    console.log("  • employer.three@test.com");
    console.log("");
    console.log("👤 USERS:");
    console.log("  • user.one@test.com");
    console.log("  • user.two@test.com");
    console.log("  • user.three@test.com");
    console.log("  • user.four@test.com");
    console.log("");
    console.log("🏢 ORGANIZATIONS:");
    for (const org of orgSeeds) {
      console.log(`  • ${org.name}`);
    }
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed script failed:", error);
      process.exit(1);
    });
}

export { seed };
