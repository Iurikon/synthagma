// Synthagma Dark Theme — Purple-centric palette
export const Colors = {
  bg: '#0D0221',
  bgCard: '#1A0A2E',
  bgSurface: '#220D3E',
  bgElevated: '#2D1450',

  primary: '#9B30FF',
  primaryLight: '#B550FF',
  primaryDark: '#7B1FA2',
  primaryGlow: '#C77DFF',

  accent: '#E040FB',
  accentLight: '#EA80FC',

  text: '#F5F0FF',
  textSecondary: '#B0A0CC',
  textMuted: '#6B5B8A',

  white: '#FFFFFF',
  black: '#000000',

  success: '#69F0AE',
  warning: '#FFD740',
  error: '#FF5252',

  xp: '#FFD740',
  streak: '#FF6E40',

  keyWhite: '#F5F0FF',
  keyBlack: '#1A0A2E',
  keyWhitePressed: '#C77DFF',
  keyBlackPressed: '#9B30FF',
};

export const Gradients = {
  bgPrimary: ['#0D0221', '#1A0A2E', '#220D3E'] as const,
  bgCard: ['#1A0A2E', '#220D3E'] as const,
  purpleGlow: ['#9B30FF', '#7B1FA2'] as const,
  purpleBright: ['#B550FF', '#E040FB'] as const,
  accentButton: ['#9B30FF', '#E040FB'] as const,
  progress: ['#9B30FF', '#C77DFF'] as const,
  xpBar: ['#FFD740', '#FF6E40'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  glow: {
    shadowColor: '#9B30FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
