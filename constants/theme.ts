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
  bg: '#EDEAE3',
  card: '#F8F5EE',
  sticky: '#EDE9D0',
  border: '#D4D0C8',
  text: '#1E1A16',
  muted: '#8A8278',
  amber: '#C8922A',
  sage: '#7A9A6A',
  red: '#B85040',
  well: '#E4DFD4',
  inverse: '#1E1A16',
  inverseText: '#EDE8DC',
  tape: 'rgba(200, 146, 42, 0.28)',
};

export const darkColors: ThemeColors = {
  bg: '#1C1917',
  card: '#242018',
  sticky: '#2A2618',
  border: '#2E2820',
  text: '#EDE8DC',
  muted: '#5A5048',
  // Accents nudged slightly brighter so they hold up on the dark paper.
  amber: '#D8A23E',
  sage: '#8FAE7C',
  red: '#C9614F',
  well: '#1A1713',
  inverse: '#EDE8DC',
  inverseText: '#1C1917',
  tape: 'rgba(216, 162, 62, 0.22)',
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
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
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
  shadowColor: mode === 'dark' ? '#000' : '#3A332A',
  shadowOpacity: mode === 'dark' ? 0.35 : 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
});
