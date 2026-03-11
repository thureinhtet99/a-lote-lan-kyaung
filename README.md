# Job Portal - Modular Architecture

A modern, scalable job portal application built with Next.js 15, featuring a feature-based modular architecture.

## 🚀 Overview

This job portal connects job seekers with employers, providing a comprehensive platform for:

- **Job Seekers:** Browse and apply for jobs, manage applications, build profiles
- **Employers:** Post jobs, manage organizations, review applications
- **Admins:** Manage users, approve employer requests, monitor system

## ✨ Key Features

### For Job Seekers

- 🔍 Browse and search job listings
- 📝 Apply for jobs with custom cover letters
- 📊 Track application status
- 👤 Manage profile and resume
- 🔔 Receive notifications

### For Employers

- 📋 Post and manage job listings
- 🏢 Create and manage organizations
- 👥 Manage team members and roles
- 💼 Review job applications
- ⭐ Feature important job listings
- 💳 Subscription plans (Free, Pro, Enterprise)

### For Administrators

- 👨‍💼 User management (ban/unban, roles)
- ✅ Approve/reject employer requests
- 📈 System statistics and monitoring
- 🛡️ Content moderation

## 🏗️ Architecture

This project uses a **feature-based modular architecture** where each module is self-contained.

See [Architecture Documentation](./docs/ARCHITECTURE.md) for complete details.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication:** [Better Auth](https://better-auth.com)
- **UI:** [Shadcn UI](https://ui.shadcn.com) + [Tailwind CSS](https://tailwindcss.com)
- **File Upload:** [UploadThing](https://uploadthing.com)
- **Markdown:** [MDXEditor](https://mdxeditor.dev)

## 📦 Getting Started

### Installation

```bash
npm install
```

### Setup Environment

```bash
cp .env.example .env
```

### Setup Database

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System architecture
- [Development Guide](./docs/DEVELOPMENT_GUIDE.md) - How to develop features
- [Module Index](./docs/MODULE_INDEX.md) - Quick reference
- [Migration Guide](./docs/MODULE_MIGRATION_GUIDE.md) - Migration guide

### Module Documentation

- [Admin Module](./modules/admin/README.md)
- [Employer Module](./modules/employer/README.md)
- [Job Seeker Module](./modules/job-seeker/README.md)
- [Shared Module](./modules/shared/README.md)

## 🗂️ Project Structure

```
job-portal/
├── app/                    # Next.js routes
├── modules/                # Feature modules
│   ├── admin/
│   ├── employer/
│   ├── job-seeker/
│   ├── auth/
│   └── shared/
├── drizzle/               # Database schema
├── docs/                  # Documentation
└── lib/                   # Core utilities
```

## 🤝 Contributing

See [Development Guide](./docs/DEVELOPMENT_GUIDE.md) for details on how to contribute.

---

**Version:** 2.0.0  
**Last Updated:** February 17, 2026
