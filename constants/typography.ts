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
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.5,
  } as TextStyle,

  /** "You are held today." — softer serif second line. */
  greetingSub: {
    fontFamily: fonts.serifRegular,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.2,
  } as TextStyle,

  /** Section + card headings. */
  title: {
    fontFamily: fonts.serifSemi,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.2,
  } as TextStyle,

  titleSm: {
    fontFamily: fonts.serifSemi,
    fontSize: 17,
    lineHeight: 22,
  } as TextStyle,

  /** The fixed top header: LIFE AUTOPILOT / V.01 */
  brand: {
    fontFamily: fonts.monoMedium,
    fontSize: 12,
    letterSpacing: 3,
  } as TextStyle,

  /** Monospace UI labels (uppercase, tracked out). */
  label: {
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } as TextStyle,

  labelSm: {
    fontFamily: fonts.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  } as TextStyle,

  /** Metadata line under the greeting, timing strings, etc. */
  meta: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.2,
  } as TextStyle,

  /** Default monospace body copy. */
  body: {
    fontFamily: fonts.mono,
    fontSize: 13.5,
    lineHeight: 20,
  } as TextStyle,

  bodyLg: {
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 23,
  } as TextStyle,

  /** Numbers we want to feel weighty (cup %, prices, page counts). */
  numeral: {
    fontFamily: fonts.monoMedium,
    fontSize: 28,
    letterSpacing: -0.5,
  } as TextStyle,
} as const;
