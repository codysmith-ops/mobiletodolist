export const palette = {
  // Primary brand colors
  primary: '#5159B0',
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',
  
  // Backgrounds
  background: '#F8FAFC',
  backgroundDark: '#0F172A',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  
  // Text colors
  text: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Semantic colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Priority colors
  priorityHigh: '#DC2626',
  priorityMedium: '#F59E0B',
  priorityLow: '#10B981',
  
  // Borders
  border: '#E2E8F0',
  borderDark: '#CBD5E1',
  divider: '#F1F5F9',
  
  // Overlays
  overlay: 'rgba(15, 23, 42, 0.6)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',
  
  // Legacy
  dark: '#1E293B',
  muted: '#64748B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {fontSize: 32, fontWeight: '800' as const, lineHeight: 40, letterSpacing: -0.5},
  h2: {fontSize: 24, fontWeight: '700' as const, lineHeight: 32, letterSpacing: -0.3},
  h3: {fontSize: 20, fontWeight: '600' as const, lineHeight: 28},
  body: {fontSize: 16, fontWeight: '400' as const, lineHeight: 24},
  bodyBold: {fontSize: 16, fontWeight: '600' as const, lineHeight: 24},
  caption: {fontSize: 14, fontWeight: '400' as const, lineHeight: 20},
  small: {fontSize: 12, fontWeight: '500' as const, lineHeight: 16},
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
  card: {shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: {width: 0, height: 4}, elevation: 4},
};

export const shadowLarge = {
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 4},
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 6,
};

export const animations = {fast: 200, normal: 300, slow: 500};
