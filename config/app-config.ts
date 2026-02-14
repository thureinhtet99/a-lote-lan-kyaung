export const APP_CONFIG = {
  ID: "a-lote-lann-kyaung",
  APP_NAME: "A Lote Lann Kyaung",
  APP_VERSION: "0.1.0",
  APP_DESCRIPTION:
    "A modern, AI-powered job portal that seamlessly connects talented job seekers with forward-thinking employers. Built with Next.js 15 and featuring advanced search capabilities, real-time application tracking, and comprehensive job management tools. Employers can create detailed job listings with markdown descriptions, manage applicant workflows, and track hiring metrics, while job seekers enjoy a streamlined browsing experience with intelligent filtering and personalized recommendations. The platform supports multi-organizational management, role-based permissions, and features both free and premium tiers for enhanced visibility and advanced features.",
};

export const APP_ROUTES = {
  // Auth
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  SIGN_OUT: "/sign-out",
  FORGOT_PASSWORD: "/forgot-password",

  HOME: "/",
  // AI_SEARCH: "/ai-search",
  JOB_BOARD: "/job-board",

  JOB_LISTINGS: {
    HOME: "/job-listings",
  },

  SETTINGS: {
    HOME: "/settings",
    PROFILE: "/settings/profile",
    RESUME: "/settings/resume",
    NOTIFICATIONS: "/settings/notifications",
  },

  EMPLOYER: {
    HOME: "/employer",
    JOB_LISTINGS: "/employer/job-listings",
    JOB_LISTINGS_NEW: "/employer/job-listings/new",
    PRICING: "/employer/pricing",
    SETTINGS: "/employer/settings",
  },

  ORG: {
    HOME: "/organizations",
    SELECT: "/organizations/select",
  },
};
