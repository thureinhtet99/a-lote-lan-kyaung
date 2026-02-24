export const APP_CONFIG = {
  ID: "a-lote-lann-kyaung",
  APP_NAME: "A Lote Lann Kyaung",
  APP_VERSION: "0.1.0",
  APP_DESCRIPTION:
    "A modern, AI-powered job portal that seamlessly connects talented job seekers with forward-thinking employers. Built with Next.js 15 and featuring advanced search capabilities, real-time application tracking, and comprehensive job management tools. Employers can create detailed job listings with markdown descriptions, manage applicant workflows, and track hiring metrics, while job seekers enjoy a streamlined browsing experience with intelligent filtering and personalized recommendations. The platform supports multi-organizational management, role-based permissions, and features both free and premium tiers for enhanced visibility and advanced features.",
};

export const APP_ROUTES = {
  // Auth
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  SIGN_OUT: "/auth/sign-out",
  FORGOT_PASSWORD: "/forgot-password",

  HOME: "/",
  // AI_SEARCH: "/ai-search",
  JOB_BOARD: "/job-board",

  ADMIN: {
    HOME: "/admin",
    USERS: "/admin/users",
    EMPLOYER_REQUESTS: "/admin/employer-requests",
  },

  JOB_LISTINGS: {
    HOME: "/job-listings",
  },

  SETTINGS: {
    HOME: "/settings",
    PROFILE: "/settings/profile",
    RESUME: "/settings/resume",
    NOTIFICATIONS: "/settings/notifications",
    EMPLOYER_REQUEST: "/settings/employer-request",
  },

  EMPLOYER: {
    HOME: "/employer",
    ORG: "/employer/organizations",
    // ORG_SELECT: "/employer/organizations/select",
    JOB_LISTINGS: "/employer/job-listings",
    JOB_LISTINGS_NEW: "/employer/job-listings/new",
    PRICING: "/employer/pricing",
    SETTINGS: {
      HOME: "/employer/settings",
      MEMBERS: "/employer/settings/members",
      INVITATIONS: "/employer/settings/invitations",
      ORGANIZATION: "/employer/settings/organization",
      ACTIVITY: "/employer/settings/activity",
      PERMISSIONS: "/employer/settings/permissions",
    },
  },
};
