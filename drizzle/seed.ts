import { userTable } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { UserRoleType } from "@/types/index.type";

type SeedAccount = {
  email: string;
  username: string;
  password: string;
  role: UserRoleType;
};

const seedAccounts: SeedAccount[] = [
  {
    email: process.env.SEED_USER_EMAIL ?? "user.test@gmail.com",
    username: process.env.SEED_USER_NAME ?? "testuser",
    password: process.env.SEED_USER_PASSWORD ?? "Test123!",
    role: "user",
  },
  {
    email: process.env.SEED_EMPLOYER_EMAIL ?? "employer.test@gmail.com",
    username: process.env.SEED_EMPLOYER_NAME ?? "testemployer One",
    password: process.env.SEED_EMPLOYER_PASSWORD ?? "Test123!",
    role: "employer",
  },
  {
    email: process.env.SEED_ADMIN_EMAIL ?? "admin.test@gmail.com",
    username: process.env.SEED_ADMIN_NAME ?? "testadmin",
    password: process.env.SEED_ADMIN_PASSWORD ?? "Test123!",
    role: "admin",
  },
];

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

async function seed(accounts: SeedAccount[] = seedAccounts) {
  try {
    console.log("Cleaning up existing data...");
    await db.delete(userTable);
    console.log("Cleanup complete!");

    const createdUserIds: string[] = [];
    for (const account of accounts) {
      const id = await seedAccount(account);
      createdUserIds.push(id);
    }

    console.log("Created accounts successfully!");
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
