import {
  jobListingTable,
  organizationTable,
  userTable,
  accountTable,
  memberTable,
  invitationTable,
  employerRequestTable,
} from "@/drizzle/schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Helper function to create a user with email/password using Better-auth
async function createUser(
  email: string,
  name: string,
  password: string = "Test123!",
) {
  try {
    // Use Better-auth's signUp method to create user
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (result?.user?.id) {
      console.log(`✅ Created user: ${email} (${name})`);
      return result.user.id;
    } else {
      throw new Error(`Failed to create user: ${email}`);
    }
  } catch (error) {
    console.error(`❌ Error creating user ${email}:`, error);
    throw error;
  }
}

// Helper function to add member to organization
async function addMemberToOrg(
  userId: string,
  organizationId: string,
  role: "owner" | "admin" | "member",
) {
  const { nanoid } = await import("nanoid");

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
    // Clean up existing data (in correct order to avoid foreign key constraints)
    console.log("🌱 Starting seed...");
    console.log("🧹 Cleaning up existing data...");

    await db.delete(jobListingTable);
    await db.delete(memberTable);
    await db.delete(invitationTable);
    await db.delete(employerRequestTable);
    await db.delete(accountTable);
    await db.delete(organizationTable);
    await db.delete(userTable);

    console.log("✅ Cleanup complete");
    console.log("");

    // ===== CREATE TEST USERS =====
    console.log("👤 Creating test users...");

    // Create admin user
    const adminUser = await createUser("admin@test.com", "System Admin");
    await db
      .update(userTable)
      .set({ role: "admin" })
      .where(eq(userTable.id, adminUser));
    console.log("✅ Set admin role for admin@test.com");
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create employer users
    const ownerUser1 = await createUser("owner@test.com", "John Owner");
    await db
      .update(userTable)
      .set({ role: "employer" })
      .where(eq(userTable.id, ownerUser1));
    await new Promise((resolve) => setTimeout(resolve, 100));

    const ownerUser2 = await createUser("jane.owner@test.com", "Jane Owner");
    await db
      .update(userTable)
      .set({ role: "employer" })
      .where(eq(userTable.id, ownerUser2));
    await new Promise((resolve) => setTimeout(resolve, 100));

    const adminUser1 = await createUser("employer@test.com", "Alice Employer");
    await db
      .update(userTable)
      .set({ role: "employer" })
      .where(eq(userTable.id, adminUser1));
    await new Promise((resolve) => setTimeout(resolve, 100));

    const adminUser2 = await createUser(
      "bob.employer@test.com",
      "Bob Employer",
    );
    await db
      .update(userTable)
      .set({ role: "employer" })
      .where(eq(userTable.id, adminUser2));
    console.log("✅ Set employer role for employer users");
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create regular users
    const memberUser1 = await createUser("user@test.com", "Charlie User");
    await new Promise((resolve) => setTimeout(resolve, 100));

    const memberUser2 = await createUser("member@test.com", "Diana Member");
    await new Promise((resolve) => setTimeout(resolve, 100));

    const memberUser3 = await createUser("tom.member@test.com", "Tom Member");
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create a user with pending employer request
    const pendingUser = await createUser(
      "pending@test.com",
      "Pending Employer",
    );
    console.log("✅ Created regular users");

    console.log("");
    console.log("💼 Creating employer requests...");

    const { nanoid } = await import("nanoid");

    // Create a pending employer request
    await db.insert(employerRequestTable).values({
      id: nanoid(),
      userId: pendingUser,
      status: "pending",
      requestMessage:
        "I would like to become an employer to post job listings for my company.",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Created pending employer request for pending@test.com");

    // Create an approved request (historical)
    await db.insert(employerRequestTable).values({
      id: nanoid(),
      userId: ownerUser1,
      status: "approved",
      requestMessage: "I need employer access to hire developers.",
      adminResponse: "Request approved. Welcome!",
      reviewedBy: adminUser,
      reviewedAt: new Date(Date.now() - 86400000), // 1 day ago
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      updatedAt: new Date(Date.now() - 86400000),
    });
    console.log("✅ Created approved employer request (historical)");

    // Create a rejected request (historical)
    const rejectedUser = await createUser("rejected@test.com", "Rejected User");
    await db.insert(employerRequestTable).values({
      id: nanoid(),
      userId: rejectedUser,
      status: "rejected",
      requestMessage: "I want employer access.",
      adminResponse: "Please provide more information about your company.",
      reviewedBy: adminUser,
      reviewedAt: new Date(Date.now() - 86400000),
      createdAt: new Date(Date.now() - 259200000), // 3 days ago
      updatedAt: new Date(Date.now() - 86400000),
    });
    console.log("✅ Created rejected employer request (historical)");

    console.log("");
    console.log("🏢 Creating organizations...");

    // ===== CREATE ORGANIZATIONS =====
    const organizations = [
      {
        id: `org-${generateId()}`,
        name: "Tech Corp",
        slug: `tech-corp-${generateId()}`,
        logo: null,
        metadata: null,
        createdAt: new Date(),
      },
      {
        id: `org-${generateId()}`,
        name: "StartupCo",
        slug: `startupco-${generateId()}`,
        logo: null,
        metadata: null,
        createdAt: new Date(),
      },
      {
        id: `org-${generateId()}`,
        name: "Innovation Labs",
        slug: `innovation-labs-${generateId()}`,
        logo: null,
        metadata: null,
        createdAt: new Date(),
      },
    ];

    const insertedOrganizations = await db
      .insert(organizationTable)
      .values(organizations)
      .returning();

    for (const org of insertedOrganizations) {
      console.log(`✅ Created organization: ${org.name} (${org.slug})`);
    }

    console.log("");
    console.log("👥 Assigning members to organizations...");

    // ===== ASSIGN MEMBERS TO ORGANIZATIONS =====
    // Organization 1: Tech Corp
    await addMemberToOrg(ownerUser1, insertedOrganizations[0].id, "owner");
    await addMemberToOrg(adminUser1, insertedOrganizations[0].id, "admin");
    await addMemberToOrg(memberUser1, insertedOrganizations[0].id, "member");
    await addMemberToOrg(memberUser2, insertedOrganizations[0].id, "member");
    console.log(`✅ Added members to ${insertedOrganizations[0].name}`);

    // Organization 2: StartupCo
    await addMemberToOrg(ownerUser2, insertedOrganizations[1].id, "owner");
    await addMemberToOrg(adminUser2, insertedOrganizations[1].id, "admin");
    await addMemberToOrg(memberUser3, insertedOrganizations[1].id, "member");
    console.log(`✅ Added members to ${insertedOrganizations[1].name}`);

    // Organization 3: Innovation Labs - Owner has multiple orgs
    await addMemberToOrg(ownerUser1, insertedOrganizations[2].id, "owner");
    await addMemberToOrg(adminUser1, insertedOrganizations[2].id, "admin");
    console.log(`✅ Added members to ${insertedOrganizations[2].name}`);

    console.log("");
    console.log("📝 Creating job listings...");

    // ===== CREATE JOB LISTINGS =====
    const allJobListings = insertedOrganizations.flatMap((org) => [
      {
        organizationId: org.id,
        title: "Senior Full Stack Developer",
        description: `## About the Role
We are looking for a Senior Full Stack Developer to join our growing engineering team. You will be responsible for developing and maintaining our web applications using modern technologies.

### Responsibilities
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
- Mentor junior developers

### Requirements
- 5+ years of experience in full-stack development
- Proficiency in React, Node.js, and TypeScript
- Experience with databases (PostgreSQL, MongoDB)
- Strong problem-solving skills
- Excellent communication skills`,
        wage: 120000,
        wageInterval: "yearly" as const,
        state: "California",
        city: "San Francisco",
        is_featured: true,
        locationRequirement: "hybrid" as const,
        experienceLevel: "senior" as const,
        status: "published" as const,
        type: "full-time" as const,
        posted_at: new Date(),
      },
      {
        organizationId: org.id,
        title: "Frontend Developer (React)",
        description: `## Frontend Developer Opportunity
Join our team as a Frontend Developer and help build amazing user experiences with React and modern web technologies.

### What You'll Do
- Build responsive and interactive user interfaces
- Work closely with designers and backend developers
- Optimize applications for performance
- Implement automated testing strategies

### What We're Looking For
- 3+ years of React development experience
- Strong knowledge of HTML, CSS, and JavaScript
- Experience with state management (Redux, Zustand)
- Familiarity with testing frameworks (Jest, React Testing Library)`,
        wage: 85000,
        wageInterval: "yearly" as const,
        state: "New York",
        city: "New York",
        is_featured: false,
        locationRequirement: "remote" as const,
        experienceLevel: "mid-level" as const,
        status: "published" as const,
        type: "full-time" as const,
        posted_at: new Date(),
      },
      {
        organizationId: org.id,
        title: "Junior Backend Developer",
        description: `## Start Your Backend Development Career
We're seeking a motivated Junior Backend Developer to join our team and grow their skills in server-side development.

### You'll Learn
- API development and design
- Database optimization
- Cloud deployment
- Testing and debugging

### Requirements
- Bachelor's degree in Computer Science or related field
- Basic knowledge of Node.js or Python
- Understanding of SQL databases
- Eagerness to learn and grow`,
        wage: 65000,
        wageInterval: "yearly" as const,
        state: "Texas",
        city: "Austin",
        is_featured: false,
        locationRequirement: "on-site" as const,
        experienceLevel: "junior" as const,
        status: "published" as const,
        type: "full-time" as const,
        posted_at: new Date(),
      },
      {
        organizationId: org.id,
        title: "Part-time UI/UX Designer",
        description: `## Creative UI/UX Designer (Part-time)
We're looking for a talented UI/UX Designer to work part-time on exciting projects and help shape our product experience.

### Responsibilities
- Create wireframes and prototypes
- Design user interfaces for web and mobile
- Conduct user research
- Collaborate with development team

### Requirements
- Portfolio showcasing UI/UX work
- Proficiency in Figma or Adobe Creative Suite
- Understanding of user-centered design principles
- 2+ years of design experience`,
        wage: 40,
        wageInterval: "hourly" as const,
        state: "Washington",
        city: "Seattle",
        is_featured: false,
        locationRequirement: "hybrid" as const,
        experienceLevel: "mid-level" as const,
        status: "published" as const,
        type: "part-time" as const,
        posted_at: new Date(),
      },
      {
        organizationId: org.id,
        title: "Software Engineering Intern",
        description: `## Summer Software Engineering Internship
Join our engineering team for a hands-on internship experience where you'll work on real projects and learn from experienced developers.

### What You'll Do
- Work on feature development
- Participate in code reviews
- Learn about software architecture
- Contribute to open source projects

### Requirements
- Currently pursuing Computer Science degree
- Basic programming knowledge (any language)
- Strong analytical and problem-solving skills
- Enthusiasm for learning new technologies`,
        wage: 25,
        wageInterval: "hourly" as const,
        state: "California",
        city: "Palo Alto",
        is_featured: false,
        locationRequirement: "on-site" as const,
        experienceLevel: "junior" as const,
        status: "published" as const,
        type: "internship" as const,
        posted_at: new Date(),
      },
      {
        organizationId: org.id,
        title: "DevOps Engineer - Draft",
        description: `## DevOps Engineer Position
We are planning to hire a DevOps Engineer to help scale our infrastructure and improve our deployment processes.

### Responsibilities
- Manage cloud infrastructure (AWS/GCP)
- Implement CI/CD pipelines
- Monitor system performance
- Ensure security best practices

### Requirements
- Experience with containerization (Docker, Kubernetes)
- Knowledge of infrastructure as code (Terraform, CloudFormation)
- Scripting skills (Bash, Python)
- 3+ years of DevOps experience`,
        wage: 110000,
        wageInterval: "yearly" as const,
        state: "Colorado",
        city: "Denver",
        is_featured: false,
        locationRequirement: "remote" as const,
        experienceLevel: "senior" as const,
        status: "draft" as const,
        type: "full-time" as const,
      },
      {
        organizationId: org.id,
        title: "Mobile App Developer (Delisted)",
        description: `## Mobile App Developer
This position was for developing cross-platform mobile applications using React Native.

### Responsibilities
- Develop mobile applications for iOS and Android
- Optimize app performance
- Integrate with backend APIs
- Publish apps to app stores

### Requirements
- Experience with React Native or Flutter
- Knowledge of mobile UI/UX principles
- Understanding of app store guidelines
- 2+ years of mobile development experience`,
        wage: 95000,
        wageInterval: "yearly" as const,
        state: "Florida",
        city: "Miami",
        is_featured: false,
        locationRequirement: "hybrid" as const,
        experienceLevel: "mid-level" as const,
        status: "delisted" as const,
        type: "full-time" as const,
      },
    ]);

    console.log(
      `📝 Inserting ${allJobListings.length} job listings for ${insertedOrganizations.length} organization`,
    );

    // Insert job listings
    for (const jobListing of allJobListings) {
      await db.insert(jobListingTable).values(jobListing);
      console.log(`✅ Inserted: ${jobListing.title} (${jobListing.status})`);
    }

    console.log("");
    console.log("✨ Seeding completed successfully!");
    console.log("");
    console.log("=".repeat(60));
    console.log("📋 TEST CREDENTIALS");
    console.log("=".repeat(60));
    console.log("");
    console.log("🔑 All passwords: Test123!");
    console.log("");
    console.log("� ADMIN ACCOUNT (Full System Access):");
    console.log("  • admin@test.com (System Admin)");
    console.log("");
    console.log("👑 EMPLOYER ACCOUNTS (Can create organizations):");
    console.log("  • owner@test.com (John Owner)");
    console.log("  • jane.owner@test.com (Jane Owner)");
    console.log("  • employer@test.com (Alice Employer)");
    console.log("  • bob.employer@test.com (Bob Employer)");
    console.log("");
    console.log("👤 REGULAR USER ACCOUNTS:");
    console.log("  • user@test.com (Charlie User)");
    console.log("  • member@test.com (Diana Member)");
    console.log("  • tom.member@test.com (Tom Member)");
    console.log("  • pending@test.com (Has pending employer request)");
    console.log("  • rejected@test.com (Had rejected employer request)");
    console.log("");
    console.log("🏢 ORGANIZATIONS:");
    console.log(`  • Tech Corp (owner: owner@test.com)`);
    console.log(`  • StartupCo (owner: jane.owner@test.com)`);
    console.log(`  • Innovation Labs (owner: owner@test.com)`);
    console.log("");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

// Run the seed function
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
