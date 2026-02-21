// Unified Design System - Dark Theme Only

export const colors = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  success: { light: '#86EFAC', DEFAULT: '#22C55E', dark: '#166534' },
  warning: { light: '#FED7AA', DEFAULT: '#F97316', dark: '#9A3412' },
  error: { light: '#FECACA', DEFAULT: '#EF4444', dark: '#991B1B' },
  info: { light: '#BFDBFE', DEFAULT: '#3B82F6', dark: '#1E40AF' },
  
  background: {
    primary: '#0F0F0F',
    secondary: '#1A1A1A',
    tertiary: '#262626',
    elevated: '#2D2D2D',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    disabled: '#52525B',
    inverse: '#0F0F0F',
  },
  
  border: {
    DEFAULT: '#3F3F46',
    subtle: '#27272A',
    focus: '#6366F1',
  },
} as const;

export const spacing = {
  0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14,
  4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9: 36, 10: 40, 11: 44, 12: 48,
  14: 56, 16: 64, 20: 80, 24: 96, 28: 112, 32: 128, 36: 144, 40: 160,
  44: 176, 48: 192, 52: 208, 56: 224, 60: 240, 64: 256, 72: 288, 80: 320, 96: 384,
} as const;

export const borderRadius = {
  none: 0, xs: 2, sm: 4, DEFAULT: 8, md: 8, lg: 12, xl: 16,
  '2xl': 20, '3xl': 24, full: 9999,
} as const;

export const typography = {
  fontFamily: { sans: 'System', mono: 'Courier' },
  fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60 },
  fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeight: { none: 1, tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2 },
} as const;

export const shadows = {
  none: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  DEFAULT: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 12 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 24 },
} as const;

export const animation = {
  duration: { instant: 0, fast: 150, normal: 300, slow: 500, slower: 700 },
  easing: {
    easeInOut: [0.4, 0, 0.2, 1] as const,
    easeOut: [0, 0, 0.2, 1] as const,
    easeIn: [0.4, 0, 1, 1] as const,
  },
} as const;

export const theme = { colors, spacing, borderRadius, typography, shadows, animation } as const;
export type Theme = typeof theme;