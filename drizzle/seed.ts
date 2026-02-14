import { jobListingTable, organizationTable } from "@/drizzle/schema";
import { db } from "@/lib/db";

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

async function seed() {
  try {
    await db.delete(jobListingTable);
    await db.delete(organizationTable);
    console.log("Starting seed...");

    const allOrganizations = [
      {
        id: "1",
        name: "first organization",
        slug: `org-1-${generateId()}`,
        logo: null,
        metadata: null,
        createdAt: new Date(),
      },
      {
        id: "2",
        name: "second organization",
        slug: `org-2-${generateId()}`,
        logo: null,
        metadata: null,
        createdAt: new Date(),
      },
      {
        id: "3",
        name: "third organization",
        slug: `org-3-${generateId()}`,
        logo: null,
        metadata: null,
        createdAt: new Date(),
      },
    ];

    // Insert job listings
    for (const organizations of allOrganizations) {
      await db.insert(organizationTable).values(organizations);
      console.log(`✅ Inserted: ${organizations.name} (${organizations.slug})`);
    }

    const insertedOrganizations = await db
      .insert(organizationTable)
      .values(allOrganizations)
      .returning();

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

    console.log("Seeding completed successfully!");
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
