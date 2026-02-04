import { jobListingsTable } from "@/drizzle/schema";
import { db } from "./db";

async function seed() {
  try {
    await db.delete(jobListingsTable);
    console.log("🌱 Starting seed...");

    // Specific organization ID to seed job listings for
    const organizationId = "org_34WNHVj5vGkcW1HoeM8khJlNwwO";

    const jobListings = [
      {
        organizationId,
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
        isFeatured: true,
        locationRequirement: "hybrid" as const,
        experienceLevel: "senior" as const,
        status: "published" as const,
        type: "full-time" as const,
        postedAt: new Date(),
      },
      {
        organizationId,
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
        isFeatured: false,
        locationRequirement: "remote" as const,
        experienceLevel: "mid-level" as const,
        status: "published" as const,
        type: "full-time" as const,
        postedAt: new Date(),
      },
      {
        organizationId,
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
        isFeatured: false,
        locationRequirement: "on-site" as const,
        experienceLevel: "junior" as const,
        status: "published" as const,
        type: "full-time" as const,
        postedAt: new Date(),
      },
      {
        organizationId,
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
        isFeatured: false,
        locationRequirement: "hybrid" as const,
        experienceLevel: "mid-level" as const,
        status: "published" as const,
        type: "part-time" as const,
        postedAt: new Date(),
      },
      {
        organizationId,
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
        isFeatured: false,
        locationRequirement: "on-site" as const,
        experienceLevel: "junior" as const,
        status: "published" as const,
        type: "internship" as const,
        postedAt: new Date(),
      },
      {
        organizationId,
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
        isFeatured: false,
        locationRequirement: "remote" as const,
        experienceLevel: "senior" as const,
        status: "draft" as const,
        type: "full-time" as const,
      },
      {
        organizationId,
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
        isFeatured: false,
        locationRequirement: "hybrid" as const,
        experienceLevel: "mid-level" as const,
        status: "delisted" as const,
        type: "full-time" as const,
      },
    ];

    console.log(
      `📝 Inserting ${jobListings.length} job listings for organization: ${organizationId}`,
    );

    // Insert job listings
    for (const jobListing of jobListings) {
      await db.insert(jobListingsTable).values(jobListing);
      console.log(`✅ Inserted: ${jobListing.title} (${jobListing.status})`);
    }

    console.log("🎉 Seeding completed successfully!");
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
