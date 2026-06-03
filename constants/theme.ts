/**
 * Life Autopilot — design tokens.
 *
 * Editorial, paper-like, tactile. A physical journal that came to life.
 * Playfair Display (serif) for greetings/headings, DM Mono for everything else.
 */

export type ThemeColors = {
  bg: string;
  card: string;
  sticky: string;
  border: string;
  text: string;
  muted: string;
  amber: string;
  sage: string;
  red: string;
  /** A faint wash used for inset wells (inside fridge, behind shelves). */
  well: string;
  /** Inverted surface — used for the active laundry stage card. */
  inverse: string;
  inverseText: string;
  /** Tape tab color for sticky notes. */
  tape: string;
};

export const lightColors: ThemeColors = {
  bg: '#F5F2ED',
  card: '#FAFAF8',
  sticky: '#EDE9D0',
  border: '#E2DDD5',
  text: '#1A1410',
  muted: '#8F8580',
  amber: '#D4952F',
  sage: '#83A870',
  red: '#BC5344',
  well: '#EBE6DD',
  inverse: '#1A1410',
  inverseText: '#FAF8F5',
  tape: 'rgba(212, 149, 47, 0.3)',
};

export const darkColors: ThemeColors = {
  bg: '#1A1714',
  card: '#27221A',
  sticky: '#2A2618',
  border: '#322B23',
  text: '#F2EEE9',
  muted: '#635754',
  // Accents nudged slightly brighter so they hold up on the dark paper.
  amber: '#E0B045',
  sage: '#94B885',
  red: '#D46B55',
  well: '#1A1410',
  inverse: '#F2EEE9',
  inverseText: '#1A1714',
  tape: 'rgba(224, 176, 69, 0.25)',
};

export type ThemeMode = 'light' | 'dark';

export const palette = (mode: ThemeMode): ThemeColors =>
  mode === 'dark' ? darkColors : lightColors;

/** 4pt spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Font family names exported by @expo-google-fonts. */
export const fonts = {
  serif: 'PlayfairDisplay_500Medium',
  serifSemi: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  serifRegular: 'PlayfairDisplay_400Regular',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  mono: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
  monoLight: 'DMMono_300Light',
} as const;

/** Soft, paper-shadow elevation. Kept subtle and physical. */
export const elevation = (mode: ThemeMode) => ({
  shadowColor: mode === 'dark' ? '#000' : '#2A2218',
  shadowOpacity: mode === 'dark' ? 0.4 : 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
});
