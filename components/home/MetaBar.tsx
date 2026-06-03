import React from 'react';
import { Meta } from '@/components/ui/Type';
import { longDate } from '@/lib/date';

/**
 * The monospace metadata line under the greeting.
 * "Sunday, May 25 — soft grey skies — 3 things need you"
 *
 * Weather is a calm placeholder (no weather provider in the stack); swap in a
 * real reading by passing `weather`.
 */
const PSEUDO_WEATHER = [
  'soft grey skies',
  'clear and cool',
  'a little overcast',
  'bright out',
  'crisp air',
  'light drizzle',
  'mild day',
];

export function MetaBar({ count, weather }: { count: number; weather?: string }) {
  const w = weather ?? PSEUDO_WEATHER[new Date().getDay() % PSEUDO_WEATHER.length];
  const things =
    count === 0
      ? 'nothing needs you'
      : count === 1
        ? '1 thing needs you'
        : `${count} things need you`;
  return <Meta dim>{`${longDate()} — ${w} — ${things}`}</Meta>;
}
