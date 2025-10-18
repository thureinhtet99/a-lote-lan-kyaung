import "dotenv/config";
import { db } from "./db";
import {
  usersTable,
  organizationsTable,
  jobListingsTable,
  jobListingApplicationsTable,
  organizationUserSettingsTable,
  userNotiSettingsTable,
  userResumesTable,
} from "./schema";
import { clerkClient } from "@clerk/clerk-sdk-node";

async function seed() {
  console.log("🌱 Starting database seeding...");

  // Check for required environment variables
  if (!process.env.CLERK_SECRET_KEY) {
    console.error("❌ CLERK_SECRET_KEY environment variable is required!");
    console.log("Please add CLERK_SECRET_KEY to your .env file.");
    console.log("You can find this in your Clerk Dashboard -> API Keys -> Secret keys");
    process.exit(1);
  }

  try {
    // Clear existing data (in correct order to respect foreign keys)
    console.log("🧹 Cleaning existing data...");
    await db.delete(jobListingApplicationsTable);
    await db.delete(organizationUserSettingsTable);
    await db.delete(userNotiSettingsTable);
    await db.delete(userResumesTable);
    await db.delete(jobListingsTable);
    await db.delete(organizationsTable);
    await db.delete(usersTable);

    // Note: We're not deleting Clerk data automatically for safety reasons
    // If you want to clean Clerk data, do it manually via Clerk Dashboard

    // Insert Users (Create in Clerk first, then in database)
    console.log("👥 Seeding users...");
    
    // Generate unique user data with timestamp to avoid conflicts
    const timestamp = Date.now();
    const userData = [
      {
        first_name: "Alex",
        last_name: "Developer",
        username: `alex_dev_${timestamp}`,
        email: `alex.dev.${timestamp}@example.com`,
        image: "https://example.com/avatar1.jpg",
      },
      {
        first_name: "Jordan",
        last_name: "Designer",
        username: `jordan_design_${timestamp}`,
        email: `jordan.design.${timestamp}@example.com`,
        image: "https://example.com/avatar2.jpg",
      },
      {
        first_name: "Taylor",
        last_name: "Engineer",
        username: `taylor_eng_${timestamp}`,
        email: `taylor.eng.${timestamp}@example.com`,
        image: "https://example.com/avatar3.jpg",
      },
      {
        first_name: "Casey",
        last_name: "Manager",
        username: `casey_mgr_${timestamp}`,
        email: `casey.mgr.${timestamp}@example.com`,
        image: "https://example.com/avatar4.jpg",
      },
      {
        first_name: "Quinn",
        last_name: "Analyst",
        username: `quinn_analyst_${timestamp}`,
        email: `quinn.analyst.${timestamp}@example.com`,
        image: "https://example.com/avatar5.jpg",
      },
    ];

    const createdUsers = [];

    for (const user of userData) {
      try {
        // Create user in Clerk
        const clerkUser = await clerkClient.users.createUser({
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          emailAddress: [user.email],
          password: "TempPassword123!",
          skipPasswordChecks: true,
        });

        // Create user in database with Clerk ID
        const [dbUser] = await db
          .insert(usersTable)
          .values({
            id: clerkUser.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            image: user.image,
          })
          .returning();

        createdUsers.push(dbUser);
        console.log(`✅ Created user: ${user.first_name} ${user.last_name} (${clerkUser.id})`);
      } catch (error) {
        console.error(`❌ Error creating user ${user.first_name} ${user.last_name}:`, error);
      }
    }

    console.log(`✅ Created ${createdUsers.length} users total`);

    // Insert Organizations (Create in Clerk first, then in database, then add 5 members each)
    console.log("🏢 Seeding organizations...");
    
    const organizationData = [
      {
        name: "TechCorp Inc.",
        image: "https://example.com/techcorp-logo.jpg",
      },
      {
        name: "Digital Solutions Ltd.",
        image: "https://example.com/digital-solutions-logo.jpg",
      },
      {
        name: "StartupHub",
        image: "https://example.com/startuphub-logo.jpg",
      },
      {
        name: "Enterprise Systems",
        image: "https://example.com/enterprise-systems-logo.jpg",
      },
      {
        name: "Innovation Labs",
        image: "https://example.com/innovation-labs-logo.jpg",
      },
    ];

    const createdOrganizations = [];

    for (let i = 0; i < organizationData.length; i++) {
      const org = organizationData[i];
      try {
        // Create organization in Clerk with the first user as creator
        const createdBy = createdUsers[i % createdUsers.length];
        
        const clerkOrg = await clerkClient.organizations.createOrganization({
          name: org.name,
          createdBy: createdBy.id,
        });

        // Create organization in database with Clerk ID
        const [dbOrg] = await db
          .insert(organizationsTable)
          .values({
            id: clerkOrg.id,
            name: org.name,
            image: org.image,
          })
          .returning();

        createdOrganizations.push(dbOrg);

        // Add 5 members to each organization (including the creator)
        const membersToAdd = [];
        for (let j = 0; j < 5; j++) {
          const userIndex = (i * 5 + j) % createdUsers.length;
          const user = createdUsers[userIndex];
          
          // Skip if it's the creator (already added when creating org)
          if (user.id === createdBy.id) continue;
          
          membersToAdd.push(user);
        }

        // Add remaining members
        for (const member of membersToAdd) {
          try {
            await clerkClient.organizations.createOrganizationMembership({
              organizationId: clerkOrg.id,
              userId: member.id,
              role: "org:member", // Basic member role
            });
            console.log(`  ✅ Added ${member.first_name} ${member.last_name} to ${org.name}`);
          } catch (memberError) {
            console.error(`  ❌ Error adding member ${member.first_name} ${member.last_name} to ${org.name}:`, memberError);
          }
        }

        console.log(`✅ Created organization: ${org.name} (${clerkOrg.id}) with ${membersToAdd.length + 1} members`);
      } catch (error) {
        console.error(`❌ Error creating organization ${org.name}:`, error);
      }
    }

    console.log(`✅ Created ${createdOrganizations.length} organizations total`);

    // Insert Job Listings (only if we have organizations)
    console.log("💼 Seeding job listings...");
    let jobListings: typeof jobListingsTable.$inferSelect[] = [];
    
    if (createdOrganizations.length === 0) {
      console.warn("⚠️  No organizations created, skipping job listings creation");
    } else {
      const jobListingData = [
        {
          organizationId: createdOrganizations[0].id,
          title: "Senior Full Stack Developer",
          description: "We are looking for an experienced full stack developer to join our growing team. You'll work on cutting-edge web applications using React, Node.js, and PostgreSQL.",
          wage: 120000,
          wageIntervel: "yearly",
          stateAbbreviation: "CA",
          city: "San Francisco",
          isFeatured: true,
          locationRequirement: "hybrid",
          experienceLevel: "senior",
          status: "published",
          type: "full-time",
          postedAt: new Date(),
        },
        {
          organizationId: createdOrganizations[0].id,
          title: "Frontend Developer Intern",
          description: "Great opportunity for students or recent graduates to gain experience in frontend development with React and TypeScript.",
          wage: 25,
          wageIntervel: "hourly",
          stateAbbreviation: "CA",
          city: "San Francisco",
          isFeatured: false,
          locationRequirement: "on-site",
          experienceLevel: "junior",
          status: "published",
          type: "internship",
          postedAt: new Date(),
        },
      ];

      // Add job listings for additional organizations if they exist
      if (createdOrganizations.length > 1) {
        jobListingData.push(
          {
            organizationId: createdOrganizations[1].id,
            title: "DevOps Engineer",
            description: "Join our DevOps team to help build and maintain our cloud infrastructure. Experience with AWS, Docker, and Kubernetes required.",
            wage: 95000,
            wageIntervel: "yearly",
            stateAbbreviation: "NY",
            city: "New York",
            isFeatured: false,
            locationRequirement: "remote",
            experienceLevel: "senior",
            status: "published",
            type: "full-time",
            postedAt: new Date(),
          },
          {
            organizationId: createdOrganizations[1].id,
            title: "UI/UX Designer",
            description: "We're seeking a creative UI/UX designer to help create intuitive and beautiful user interfaces for our products.",
            wage: 4500,
            wageIntervel: "monthly",
            stateAbbreviation: "TX",
            city: "Austin",
            isFeatured: true,
            locationRequirement: "hybrid",
            experienceLevel: "senior",
            status: "published",
            type: "full-time",
            postedAt: new Date(),
          }
        );
      }

      if (createdOrganizations.length > 2) {
        jobListingData.push(
          {
            organizationId: createdOrganizations[2].id,
            title: "Backend Developer",
            description: "Looking for a backend developer with expertise in Node.js, Express, and database design to build scalable APIs.",
            wage: 80000,
            wageIntervel: "yearly",
            stateAbbreviation: "WA",
            city: "Seattle",
            isFeatured: false,
            locationRequirement: "remote",
            experienceLevel: "senior",
            status: "published",
            type: "full-time",
            postedAt: new Date(),
          },
          {
            organizationId: createdOrganizations[2].id,
            title: "Part-time QA Tester",
            description: "Part-time position for manual and automated testing of web applications. Flexible hours available.",
            wage: 30,
            wageIntervel: "hourly",
            stateAbbreviation: "FL",
            city: "Miami",
            isFeatured: false,
            locationRequirement: "remote",
            experienceLevel: "junior",
            status: "published",
            type: "part-time",
            postedAt: new Date(),
          }
        );
      }

      if (createdOrganizations.length > 3) {
        jobListingData.push(
          {
            organizationId: createdOrganizations[3].id,
            title: "Senior Software Architect",
            description: "Lead the design and architecture of large-scale enterprise applications. 8+ years experience required.",
            wage: 150000,
            wageIntervel: "yearly",
            stateAbbreviation: "MA",
            city: "Boston",
            isFeatured: true,
            locationRequirement: "on-site",
            experienceLevel: "senior",
            status: "published",
            type: "full-time",
            postedAt: new Date(),
          },
          {
            organizationId: createdOrganizations[3].id,
            title: "Mobile App Developer",
            description: "Develop cross-platform mobile applications using React Native and Flutter. Experience with both iOS and Android preferred.",
            wage: 90000,
            wageIntervel: "yearly",
            stateAbbreviation: "IL",
            city: "Chicago",
            isFeatured: false,
            locationRequirement: "hybrid",
            experienceLevel: "senior",
            status: "published",
            type: "full-time",
            postedAt: new Date(),
          }
        );
      }

      if (createdOrganizations.length > 4) {
        jobListingData.push(
          {
            organizationId: createdOrganizations[4].id,
            title: "Data Scientist",
            description: "Apply machine learning and statistical analysis to solve complex business problems. Python and R experience required.",
            wage: 105000,
            wageIntervel: "yearly",
            stateAbbreviation: "CO",
            city: "Denver",
            isFeatured: false,
            locationRequirement: "remote",
            experienceLevel: "senior",
            status: "published",
            type: "full-time",
            postedAt: new Date(),
          },
          {
            organizationId: createdOrganizations[4].id,
            title: "Junior Web Developer",
            description: "Entry-level position for new developers. We provide mentorship and training in modern web technologies.",
            wage: 65000,
            wageIntervel: "yearly",
            stateAbbreviation: "OR",
            city: "Portland",
            isFeatured: false,
            locationRequirement: "on-site",
            experienceLevel: "junior",
            status: "draft",
            type: "full-time",
            postedAt: new Date(),
          }
        );
      }

      jobListings = await db
        .insert(jobListingsTable)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .values(jobListingData as any)
        .returning();
    }

    console.log(`✅ Created ${jobListings.length} job listings`);

    // Insert User Notification Settings (only if we have users)
    console.log("🔔 Seeding user notification settings...");
    let userNotiSettings: typeof userNotiSettingsTable.$inferSelect[] = [];
    
    if (createdUsers.length === 0) {
      console.warn("⚠️  No users created, skipping user notification settings creation");
    } else {
      const notiSettingsData = [];
      
      if (createdUsers[0]) {
        notiSettingsData.push({
          userId: createdUsers[0].id,
          newJobEmailNoti: true,
          aiPrompt: "Notify me about senior developer positions in tech companies",
        });
      }
      
      if (createdUsers[1]) {
        notiSettingsData.push({
          userId: createdUsers[1].id,
          newJobEmailNoti: false,
          aiPrompt: "Looking for UI/UX design opportunities",
        });
      }
      
      if (createdUsers[2]) {
        notiSettingsData.push({
          userId: createdUsers[2].id,
          newJobEmailNoti: true,
          aiPrompt: "Interested in remote backend development roles",
        });
      }
      
      if (createdUsers[3]) {
        notiSettingsData.push({
          userId: createdUsers[3].id,
          newJobEmailNoti: true,
          aiPrompt: "Seeking DevOps and cloud engineering positions",
        });
      }
      
      if (createdUsers[4]) {
        notiSettingsData.push({
          userId: createdUsers[4].id,
          newJobEmailNoti: false,
          aiPrompt: null,
        });
      }

      if (notiSettingsData.length > 0) {
        userNotiSettings = await db
          .insert(userNotiSettingsTable)
          .values(notiSettingsData)
          .returning();
      }
    }

    console.log(`✅ Created ${userNotiSettings.length} user notification settings`);

    // Insert User Resumes (only if we have users)
    console.log("📄 Seeding user resumes...");
    let userResumes: typeof userResumesTable.$inferSelect[] = [];
    
    if (createdUsers.length === 0) {
      console.warn("⚠️  No users created, skipping user resumes creation");
    } else {
      const resumeData = [];
      
      if (createdUsers[0]) {
        resumeData.push({
          userId: createdUsers[0].id,
          resumeFileUrl: "https://example.com/resumes/john-doe-resume.pdf",
          resumeFileKey: "resumes/john-doe-resume.pdf",
          aiSummary: "Experienced full stack developer with 8 years in React, Node.js, and cloud technologies. Strong background in agile development and team leadership.",
        });
      }
      
      if (createdUsers[1]) {
        resumeData.push({
          userId: createdUsers[1].id,
          resumeFileUrl: "https://example.com/resumes/jane-smith-resume.pdf",
          resumeFileKey: "resumes/jane-smith-resume.pdf",
          aiSummary: "Creative UI/UX designer with expertise in user research, prototyping, and modern design tools. 5 years of experience in creating user-centered designs.",
        });
      }
      
      if (createdUsers[2]) {
        resumeData.push({
          userId: createdUsers[2].id,
          resumeFileUrl: "https://example.com/resumes/michael-johnson-resume.pdf",
          resumeFileKey: "resumes/michael-johnson-resume.pdf",
          aiSummary: "Backend developer specializing in API development and database optimization. 4 years of experience with Node.js, Python, and PostgreSQL.",
        });
      }
      
      if (createdUsers[3]) {
        resumeData.push({
          userId: createdUsers[3].id,
          resumeFileUrl: "https://example.com/resumes/sarah-williams-resume.pdf",
          resumeFileKey: "resumes/sarah-williams-resume.pdf",
          aiSummary: "DevOps engineer with strong AWS and containerization skills. Experience in CI/CD pipelines and infrastructure automation.",
        });
      }

      if (resumeData.length > 0) {
        userResumes = await db
          .insert(userResumesTable)
          .values(resumeData)
          .returning();
      }
    }

    console.log(`✅ Created ${userResumes.length} user resumes`);

    // Insert Organization User Settings (only if we have users and organizations)
    console.log("⚙️ Seeding organization user settings...");
    let orgUserSettings: typeof organizationUserSettingsTable.$inferSelect[] = [];
    
    if (createdUsers.length === 0 || createdOrganizations.length === 0) {
      console.warn("⚠️  No users or organizations created, skipping organization user settings creation");
    } else {
      const orgSettingsData = [];
      
      if (createdUsers[0] && createdOrganizations[0]) {
        orgSettingsData.push({
          userId: createdUsers[0].id,
          organizationId: createdOrganizations[0].id,
          newApplicationEmailNoti: true,
          minimumRating: 4,
        });
      }
      
      if (createdUsers[1] && createdOrganizations[1]) {
        orgSettingsData.push({
          userId: createdUsers[1].id,
          organizationId: createdOrganizations[1].id,
          newApplicationEmailNoti: true,
          minimumRating: 3,
        });
      }
      
      if (createdUsers[0] && createdOrganizations[2]) {
        orgSettingsData.push({
          userId: createdUsers[0].id,
          organizationId: createdOrganizations[2].id,
          newApplicationEmailNoti: false,
          minimumRating: 5,
        });
      }
      
      if (createdUsers[2] && createdOrganizations[3]) {
        orgSettingsData.push({
          userId: createdUsers[2].id,
          organizationId: createdOrganizations[3].id,
          newApplicationEmailNoti: true,
          minimumRating: 4,
        });
      }
      
      if (createdUsers[3] && createdOrganizations[4]) {
        orgSettingsData.push({
          userId: createdUsers[3].id,
          organizationId: createdOrganizations[4].id,
          newApplicationEmailNoti: true,
          minimumRating: null,
        });
      }

      if (orgSettingsData.length > 0) {
        orgUserSettings = await db
          .insert(organizationUserSettingsTable)
          .values(orgSettingsData)
          .returning();
      }
    }

    console.log(`✅ Created ${orgUserSettings.length} organization user settings`);

    // Insert Job Applications (only if we have job listings and users)
    console.log("📋 Seeding job applications...");
    let applications: typeof jobListingApplicationsTable.$inferSelect[] = [];
    
    if (jobListings.length === 0 || createdUsers.length === 0) {
      console.warn("⚠️  No job listings or users created, skipping job applications creation");
    } else {
      const applicationData = [];
      
      // Create applications based on available job listings
      if (jobListings.length > 0 && createdUsers[1]) {
        applicationData.push({
          jobListingId: jobListings[0].id, // First job listing
          userId: createdUsers[1].id,
          coverLetter: "I am very interested in this position. With my experience in React and Node.js, I believe I would be a great fit for your team.",
          rating: 4,
          stage: "interviewed" as const,
        });
      }

      if (jobListings.length > 0 && createdUsers[2]) {
        applicationData.push({
          jobListingId: jobListings[0].id, // First job listing
          userId: createdUsers[2].id,
          coverLetter: "Dear hiring manager, I have been following your company's work and would love to contribute to your team. Please find my portfolio attached.",
          rating: 5,
          stage: "hired" as const,
        });
      }

      if (jobListings.length > 1 && createdUsers[4]) {
        applicationData.push({
          jobListingId: jobListings[1].id, // Second job listing
          userId: createdUsers[4].id,
          coverLetter: "As a recent computer science graduate, I am eager to start my career with your company. I have built several projects during my studies.",
          rating: 3,
          stage: "applied" as const,
        });
      }

      if (jobListings.length > 2 && createdUsers[3]) {
        applicationData.push({
          jobListingId: jobListings[2].id, // Third job listing
          userId: createdUsers[3].id,
          coverLetter: "I have extensive experience that would be valuable for your team. I am excited about the opportunity to work with you.",
          rating: 4,
          stage: "interested" as const,
        });
      }

      if (jobListings.length > 3 && createdUsers[1]) {
        applicationData.push({
          jobListingId: jobListings[3].id, // Fourth job listing
          userId: createdUsers[1].id,
          coverLetter: "I am passionate about creating beautiful and intuitive experiences. My portfolio demonstrates my ability to solve complex challenges.",
          rating: 5,
          stage: "applied" as const,
        });
      }

      if (jobListings.length > 4 && createdUsers[2]) {
        applicationData.push({
          jobListingId: jobListings[4].id, // Fifth job listing
          userId: createdUsers[2].id,
          coverLetter: "Development is my specialty. I have experience building scalable systems and optimizing performance.",
          rating: 4,
          stage: "applied" as const,
        });
      }

      if (jobListings.length > 5 && createdUsers[4]) {
        applicationData.push({
          jobListingId: jobListings[5].id, // Sixth job listing
          userId: createdUsers[4].id,
          coverLetter: "I am looking for opportunities while completing my degree. I have experience with both manual and automated processes.",
          rating: 3,
          stage: "denied" as const,
        });
      }

      if (jobListings.length > 6 && createdUsers[0]) {
        applicationData.push({
          jobListingId: jobListings[6].id, // Seventh job listing
          userId: createdUsers[0].id,
          coverLetter: "With years of experience in software architecture, I am excited about the opportunity to lead technical decisions.",
          rating: 5,
          stage: "interviewed" as const,
        });
      }

      if (applicationData.length > 0) {
        applications = await db
          .insert(jobListingApplicationsTable)
          .values(applicationData)
          .returning();
      }
    }

    console.log(`✅ Created ${applications.length} job applications`);

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Users: ${createdUsers.length} (created in Clerk & Database)`);
    console.log(`- Organizations: ${createdOrganizations.length} (created in Clerk & Database, each with 5 members)`);
    console.log(`- Job Listings: ${jobListings.length}`);
    console.log(`- User Notification Settings: ${userNotiSettings.length}`);
    console.log(`- User Resumes: ${userResumes.length}`);
    console.log(`- Organization User Settings: ${orgUserSettings.length}`);
    console.log(`- Job Applications: ${applications.length}`);

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("🎉 Seeding process completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });
