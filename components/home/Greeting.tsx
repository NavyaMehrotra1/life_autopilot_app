import React from 'react';
import { View } from 'react-native';
import { Greeting as GreetingText, GreetingSub } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';

function partOfDay(h: number): string {
  if (h < 5) return 'late night';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

const REASSURANCE = [
  'You are held today.',
  'Everything’s handled.',
  'Nothing’s slipping.',
  'I’ve got the small stuff.',
];

export function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours();
  const greet = partOfDay(hour);
  const first = name ? name.split(' ')[0] : 'friend';
  // Stable per-day reassurance line so it doesn't flicker on re-render.
  const line = REASSURANCE[new Date().getDate() % REASSURANCE.length];

  return (
    <View style={{ marginTop: spacing.lg, marginBottom: spacing.xxl }}>
      <GreetingText>
        Good {greet}, {first}.
      </GreetingText>
      <GreetingSub dim style={{ marginTop: spacing.md }}>
        {line}
      </GreetingSub>
    </View>
  );
}
