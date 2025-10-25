CREATE TYPE "public"."experience" AS ENUM('junior', 'mid-level', 'senior');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'published', 'delisted');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('internship', 'part-time', 'full-time');--> statement-breakpoint
CREATE TYPE "public"."location_requirement" AS ENUM('on-site', 'hybrid', 'remote');--> statement-breakpoint
CREATE TYPE "public"."wage_interval" AS ENUM('monthly', 'yearly', 'hourly');--> statement-breakpoint
CREATE TYPE "public"."application_stage" AS ENUM('denied', 'applied', 'interested', 'interviewed', 'hired');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"image" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"wage" integer NOT NULL,
	"wageInterval" "wage_interval" NOT NULL,
	"state" varchar,
	"city" varchar,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"locationRequirement" "location_requirement" NOT NULL,
	"experienceLevel" "experience" NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"type" "type" NOT NULL,
	"postedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_listing_applications" (
	"jobListingId" uuid NOT NULL,
	"userId" varchar NOT NULL,
	"coverLetter" text,
	"rating" integer,
	"stage" "application_stage" DEFAULT 'applied' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_listing_applications_jobListingId_userId_pk" PRIMARY KEY("jobListingId","userId")
);
--> statement-breakpoint
CREATE TABLE "user_resumes" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"resumeFileUrl" varchar NOT NULL,
	"resumeFileKey" varchar NOT NULL,
	"aiSummary" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notification_settings" (
	"userId" varchar PRIMARY KEY NOT NULL,
	"newJobEmailNotification" boolean DEFAULT false NOT NULL,
	"aiPrompt" varchar,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_user_settings" (
	"userId" varchar NOT NULL,
	"organizationId" varchar NOT NULL,
	"newApplicationEmailNotification" boolean DEFAULT false NOT NULL,
	"minimumRating" integer,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organization_user_settings_userId_organizationId_pk" PRIMARY KEY("userId","organizationId")
);
--> statement-breakpoint
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_applications" ADD CONSTRAINT "job_listing_applications_jobListingId_job_listings_id_fk" FOREIGN KEY ("jobListingId") REFERENCES "public"."job_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_applications" ADD CONSTRAINT "job_listing_applications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_resumes" ADD CONSTRAINT "user_resumes_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_user_settings" ADD CONSTRAINT "organization_user_settings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_user_settings" ADD CONSTRAINT "organization_user_settings_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_listings_state_index" ON "job_listings" USING btree ("state");