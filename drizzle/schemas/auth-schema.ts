import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { resumeTable } from "./resume-schema";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(3, "Username must be at least 1 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInFormType = z.infer<typeof signInSchema>;
export type SignUpFormType = z.infer<typeof signUpSchema>;

export const userTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role", { enum: ["user", "employer", "admin"] })
    .default("user")
    .notNull(),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessionTable = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    activeOrganizationId: text("active_organization_id"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const accountTable = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verificationTable = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organizationTable = pgTable(
  "organizations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    metadata: text("metadata"),
  },
  (table) => [uniqueIndex("organization_slug_uidx").on(table.slug)],
);

export const memberTable = pgTable(
  "members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationTable.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["org-admin", "hr"] })
      .default("hr")
      .notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
  ],
);

export const invitationTable = pgTable(
  "invitations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizationTable.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role", { enum: ["org-admin", "hr"] }),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
  ],
);

// Employer requests table
export const employerRequestTable = pgTable(
  "employer_requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .default("pending")
      .notNull(),
    requestMessage: text("request_message").notNull(),
    adminResponse: text("admin_response"),
    reviewedBy: text("reviewed_by").references(() => userTable.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("employer_request_userId_idx").on(table.userId),
    index("employer_request_status_idx").on(table.status),
  ],
);

// Organization creation request table
export const organizationRequestTable = pgTable(
  "organization_requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    orgName: text("org_name").notNull(),
    orgSlug: text("org_slug").notNull(),
    orgLogo: text("org_logo"),
    requestMessage: text("request_message").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .default("pending")
      .notNull(),
    adminResponse: text("admin_response"),
    reviewedBy: text("reviewed_by").references(() => userTable.id),
    reviewedAt: timestamp("reviewed_at"),
    createdOrganizationId: text("created_organization_id").references(
      () => organizationTable.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("org_request_userId_idx").on(table.userId),
    index("org_request_status_idx").on(table.status),
  ],
);

export const userRelations = relations(userTable, ({ one, many }) => ({
  sessions: many(sessionTable),
  accounts: many(accountTable),
  members: many(memberTable),
  invitations: many(invitationTable),
  resume: one(resumeTable),
  employerRequests: many(employerRequestTable),
  organizationRequests: many(organizationRequestTable),
}));

export const sessionRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}));

export const accountRelations = relations(accountTable, ({ one }) => ({
  user: one(userTable, {
    fields: [accountTable.userId],
    references: [userTable.id],
  }),
}));

export const organizationRelations = relations(
  organizationTable,
  ({ many }) => ({
    members: many(memberTable),
    invitations: many(invitationTable),
  }),
);

export const memberRelations = relations(memberTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [memberTable.organizationId],
    references: [organizationTable.id],
  }),
  user: one(userTable, {
    fields: [memberTable.userId],
    references: [userTable.id],
  }),
}));

export const invitationRelations = relations(invitationTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [invitationTable.organizationId],
    references: [organizationTable.id],
  }),
  user: one(userTable, {
    fields: [invitationTable.inviterId],
    references: [userTable.id],
  }),
}));

export const employerRequestRelations = relations(
  employerRequestTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [employerRequestTable.userId],
      references: [userTable.id],
    }),
    reviewer: one(userTable, {
      fields: [employerRequestTable.reviewedBy],
      references: [userTable.id],
    }),
  }),
);

export const organizationRequestRelations = relations(
  organizationRequestTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [organizationRequestTable.userId],
      references: [userTable.id],
    }),
    reviewer: one(userTable, {
      fields: [organizationRequestTable.reviewedBy],
      references: [userTable.id],
    }),
    createdOrganization: one(organizationTable, {
      fields: [organizationRequestTable.createdOrganizationId],
      references: [organizationTable.id],
    }),
  }),
);
