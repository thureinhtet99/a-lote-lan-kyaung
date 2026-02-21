/**
 * Color palette for Myanmar Job Portal
 *
 * Primary: Deep Myanmar Blue - Professional, trustworthy
 * Secondary: Golden Yellow - Represents prosperity and Myanmar's golden pagodas
 * Tertiary: Warm Orange - Energy and opportunity
 */

export const COLORS = {
  // Primary - Deep Blue (Professional, Trust)
  primary: {
    50: "#e6f0ff",
    100: "#cce0ff",
    200: "#99c2ff",
    300: "#66a3ff",
    400: "#3385ff",
    500: "#0066ff", // Main primary color
    600: "#0052cc",
    700: "#003d99",
    800: "#002966",
    900: "#001433",
  },

  // Secondary - Golden Yellow (Myanmar Gold, Prosperity)
  secondary: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b", // Main secondary color
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // Tertiary - Warm Orange (Energy, Opportunity)
  tertiary: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316", // Main tertiary color
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
  },

  // Neutral shades
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },

  // Semantic colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

export type ColorPalette = typeof COLORS;
