export const APP_CONFIG = {
  ID: "a-lote-lann-kyaung",
  APP_NAME: "A Lote Lann Kyaung",
  APP_VERSION: "0.1.0",
  APP_DESCRIPTION:
    "A modern job portal that seamlessly connects talented job seekers with forward-thinking employers. Built with Next.js 16 and featuring advanced search capabilities, real-time application tracking, and comprehensive job management tools. Employers can create detailed job listings with markdown descriptions, manage applicant workflows, and track hiring metrics. The platform supports organizational management and role-based permissions.",
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
    ORG_REQUESTS: "/admin/organization-requests",
    ORGANIZATIONS: "/admin/organizations",
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
    ORG_REQUEST: "/settings/organization-request",
  },

  ORGANIZATIONS: {
    HOME: "/organizations",
    DETAIL: (slug: string) => `/organizations/${slug}`,
  },

  EMPLOYER: {
    HOME: "/employer",
    MY_ORG: "/employer/my-organization",
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
