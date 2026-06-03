import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Mono } from '@/components/ui/Type';
import { MealCard } from './MealCard';
import { Meal, MealSlotName, mealsForDay, nutritionNote } from '@/stores/mealsStore';

export function currentSlot(hour = new Date().getHours()): MealSlotName {
  if (hour < 11) return 'morning';
  if (hour < 16) return 'afternoon';
  return 'evening';
}

const SLOTS: MealSlotName[] = ['morning', 'afternoon', 'evening'];

type Props = {
  plan: Meal[];
  day: number;
  /** Highlight the live slot (only meaningful for today). */
  highlightCurrent?: boolean;
  onSwap?: (slot: MealSlotName, meal?: Meal) => void;
};

/** A day's three meals as a 3-column card, with a gentle nutrition read. */
export function MealPlanRow({ plan, day, highlightCurrent, onSwap }: Props) {
  const { colors } = useTheme();
  const bySlot = mealsForDay(plan, day);
  const live = currentSlot();
  const note = nutritionNote(SLOTS.map((s) => bySlot[s]));

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {SLOTS.map((slot) => (
          <MealCard
            key={slot}
            slot={slot}
            meal={bySlot[slot]}
            active={highlightCurrent && slot === live}
            onPress={onSwap ? () => onSwap(slot, bySlot[slot]) : undefined}
          />
        ))}
      </View>
      <Mono
        color={note.includes('complete') ? colors.sage : colors.muted}
        style={{ marginTop: spacing.sm, fontSize: 11 }}
      >
        {note}
      </Mono>
    </View>
  );
}
