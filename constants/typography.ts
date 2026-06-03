import { TextStyle } from 'react-native';
import { fonts } from './theme';

/**
 * Text style presets. Color is intentionally omitted — apply it from the
 * active theme at the call site, e.g. `{...type.label, color: c.muted}`.
 */
export const type = {
  /** "Good morning, Priya." — the big serif moment. */
  greeting: {
    fontFamily: fonts.serifBold,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -0.6,
  } as TextStyle,

  /** "You are held today." — softer serif second line. */
  greetingSub: {
    fontFamily: fonts.serifRegular,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.1,
  } as TextStyle,

  /** Section + card headings. */
  title: {
    fontFamily: fonts.serifSemi,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.25,
  } as TextStyle,

  titleSm: {
    fontFamily: fonts.serifSemi,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.15,
  } as TextStyle,

  /** The fixed top header: LIFE AUTOPILOT / V.01 */
  brand: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 2.8,
  } as TextStyle,

  /** Monospace UI labels (uppercase, tracked out). */
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  } as TextStyle,

  labelSm: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  } as TextStyle,

  /** Metadata line under the greeting, timing strings, etc. */
  meta: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.3,
  } as TextStyle,

  /** Default monospace body copy. */
  body: {
    fontFamily: fonts.mono,
    fontSize: 14,
    lineHeight: 21,
  } as TextStyle,

  bodyLg: {
    fontFamily: fonts.mono,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  /** Numbers we want to feel weighty (cup %, prices, page counts). */
  numeral: {
    fontFamily: fonts.monoMedium,
    fontSize: 32,
    letterSpacing: -0.6,
  } as TextStyle,
} as const;
