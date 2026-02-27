import {
  accountTable,
  applicationTable,
  employerRequestTable,
  invitationTable,
  jobListingTable,
  memberTable,
  organizationTable,
  organizationUserSettingsTable,
  resumeTable,
  sessionTable,
  userNotificationSettingsTable,
  userTable,
  verificationTable,
} from "@/drizzle/schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

type AppRole = "admin" | "employer" | "user";
type OrgRole = "admin" | "employer" | "user";

type SeedUser = {
  email: string;
  name: string;
  role: AppRole;
};

type CreatedSeedUser = SeedUser & { id: string };

// Helper: create user through Better Auth so auth/account rows stay valid.
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
    await db.delete(jobListingTable);
    await db.delete(organizationUserSettingsTable);
    await db.delete(userNotificationSettingsTable);
    await db.delete(resumeTable);
    await db.delete(memberTable);
    await db.delete(invitationTable);
    await db.delete(employerRequestTable);
    await db.delete(accountTable);
    await db.delete(sessionTable);
    await db.delete(verificationTable);
    await db.delete(organizationTable);
    await db.delete(userTable);

    console.log("✅ Cleanup complete");
    console.log("");

    console.log("👤 Creating users (2 admins, 3 employers, 4 users)...");

    const userPlan: SeedUser[] = [
      { email: "admin.one@test.com", name: "Admin One", role: "admin" },
      { email: "admin.two@test.com", name: "Admin Two", role: "admin" },
      { email: "employer.one@test.com", name: "Employer One", role: "employer" },
      { email: "employer.two@test.com", name: "Employer Two", role: "employer" },
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

    const createdUsers: CreatedSeedUser[] = [];
    for (const user of userPlan) {
      createdUsers.push(await createUserWithRole(user));
    }

    const admins = createdUsers.filter((u) => u.role === "admin");
    const employers = createdUsers.filter((u) => u.role === "employer");
    const users = createdUsers.filter((u) => u.role === "user");

    console.log("✅ Users created with requested distribution");
    console.log("");

    console.log("🏢 Creating organizations (2 per employer)...");

    const orgSeeds = [
      {
        id: nanoid(),
        name: "Atlas Tech",
        slug: "atlas-tech",
        ownerId: employers[0].id,
        collaboratorId: employers[1].id,
      },
      {
        id: nanoid(),
        name: "Vertex Labs",
        slug: "vertex-labs",
        ownerId: employers[0].id,
        collaboratorId: employers[2].id,
      },
      {
        id: nanoid(),
        name: "Blue Orbit",
        slug: "blue-orbit",
        ownerId: employers[1].id,
        collaboratorId: employers[0].id,
      },
      {
        id: nanoid(),
        name: "North Ridge",
        slug: "north-ridge",
        ownerId: employers[1].id,
        collaboratorId: employers[2].id,
      },
      {
        id: nanoid(),
        name: "Signal Foundry",
        slug: "signal-foundry",
        ownerId: employers[2].id,
        collaboratorId: employers[0].id,
      },
      {
        id: nanoid(),
        name: "Nimbus Point",
        slug: "nimbus-point",
        ownerId: employers[2].id,
        collaboratorId: employers[1].id,
      },
    ];

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
    console.log("👥 Creating organization memberships...");

    for (let i = 0; i < orgSeeds.length; i++) {
      const org = orgSeeds[i];
      const userMember = users[i % users.length];

      await addMemberToOrg(org.ownerId, org.id, "admin");
      await addMemberToOrg(org.collaboratorId, org.id, "employer");
      await addMemberToOrg(userMember.id, org.id, "user");

      console.log(`✅ Added 3 members to ${org.name}`);
    }

    console.log("");
    console.log("⚙️ Creating organization user settings...");

    for (let i = 0; i < orgSeeds.length; i++) {
      const org = orgSeeds[i];
      const minimumRating = (i % 5) + 1;

      await db.insert(organizationUserSettingsTable).values([
        {
          userId: org.ownerId,
          organizationId: org.id,
          newApplicationEmailNotification: true,
          minimumRating,
        },
        {
          userId: org.collaboratorId,
          organizationId: org.id,
          newApplicationEmailNotification: i % 2 === 0,
          minimumRating: minimumRating >= 3 ? minimumRating - 1 : null,
        },
      ]);
    }

    console.log("✅ Organization user settings inserted");
    console.log("");

    console.log("🔔 Creating user notification settings...");
    await db.insert(userNotificationSettingsTable).values(
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
        role: index % 2 === 0 ? "user" : "employer",
        status: index === 3 ? "accepted" : "pending",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        inviterId: org.ownerId,
      })),
    );
    console.log("✅ Invitations inserted");
    console.log("");

    console.log("💼 Creating employer requests...");
    await db.insert(employerRequestTable).values([
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
    ]);
    console.log("✅ Employer requests inserted");
    console.log("");

    console.log("📝 Creating job listings (different set for each org)...");

    const jobListings = orgSeeds.flatMap((org, index) => {
      const stateCity = [
        ["California", "San Francisco"],
        ["New York", "New York"],
        ["Texas", "Austin"],
        ["Washington", "Seattle"],
        ["Massachusetts", "Boston"],
        ["Illinois", "Chicago"],
      ] as const;
      const [state, city] = stateCity[index];

      return [
        {
          id: nanoid(),
          organizationId: org.id,
          title: `${org.name} Senior Engineer`,
          description: `Build and scale products at ${org.name}.`,
          wage: 130000 + index * 2000,
          wageInterval: "yearly" as const,
          state,
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
          description: `Design polished product experiences for ${org.name}.`,
          wage: 90000 + index * 1000,
          wageInterval: "yearly" as const,
          state,
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
          description: `Internship role at ${org.name}.`,
          wage: 24 + index,
          wageInterval: "hourly" as const,
          state,
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

    const publishedListings = jobListings.filter((j) => j.status === "published");
    const applicationRows = users.flatMap((u, userIndex) => {
      const first = publishedListings[userIndex * 2];
      const second = publishedListings[userIndex * 2 + 1];

      return [
        {
          jobListingId: first.id,
          userId: u.id,
          coverLetter: `Hello, I am ${u.name} and I am interested in this role.`,
          status: "applied" as const,
          rating: null,
        },
        {
          jobListingId: second.id,
          userId: u.id,
          coverLetter: `I believe I am a strong fit for this opportunity.`,
          status: userIndex % 2 === 0 ? ("interviewed" as const) : ("applied" as const),
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
