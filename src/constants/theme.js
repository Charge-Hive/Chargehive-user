// Design System - ChargeHive User App
// Based on CH-User reference design

export const COLORS = {
  // Primary Colors
  primary: '#161622',          // Dark charcoal/navy background
  secondary: '#FF9C01',        // Bright orange/amber accent
  secondaryLight: '#FF9001',
  secondaryDark: '#FF8E01',

  // Yellow Accent
  yellow: '#facc15',
  yellowDark: '#f59e0b',

  // Black Shades
  black: '#000',
  blackLight: '#1E1E2D',
  blackMedium: '#232533',

  // Gray Shades
  gray100: '#CDCDE0',          // Light gray
  gray200: '#A0A0A0',
  gray300: '#808080',
  gray400: '#6b7280',          // Medium gray for placeholders
  gray500: '#666666',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',

  // Status Colors
  success: '#4CAF50',          // Green
  error: '#ef4444',            // Red
  warning: '#f59e0b',          // Orange
  info: '#3b82f6',             // Blue

  // UI Colors
  white: '#FFFFFF',
  background: '#161622',       // Main app background
  cardBackground: '#1E1E2D',   // Card backgrounds
  border: '#232533',           // Border color
  inputBackground: '#232533',  // Input field backgrounds

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#CDCDE0',
  textMuted: '#808080',
  textPlaceholder: '#6b7280',

  // Parking & Charging Colors
  parking: '#3b82f6',          // Blue for parking
  charging: '#facc15',         // Yellow for charging
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
};
