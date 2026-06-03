import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { LabelSm, Mono } from '@/components/ui/Type';
import { Meal, MealSlotName } from '@/stores/mealsStore';

const SLOT_LABEL: Record<MealSlotName, string> = {
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
};

const SOURCE_TAG: Record<Meal['source'], string> = {
  dining: 'dining',
  restaurant: 'out',
  home: 'home',
};

type Props = {
  slot: MealSlotName;
  meal?: Meal;
  active?: boolean;
  onPress?: () => void;
};

/** One meal slot in the 3-column day plan. */
export function MealCard({ slot, meal, active, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 104,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: active ? colors.amber : colors.border,
        backgroundColor: active ? colors.well : 'transparent',
        padding: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <LabelSm color={active ? colors.amber : colors.muted}>{SLOT_LABEL[slot]}</LabelSm>
      {meal ? (
        <>
          <Mono style={{ marginTop: spacing.sm }} numberOfLines={3}>
            {meal.name.toLowerCase()}
          </Mono>
          <View style={{ flex: 1 }} />
          <Mono dim style={{ fontSize: 10, marginTop: spacing.sm }} numberOfLines={1}>
            {meal.location.toLowerCase()}
            {meal.distance ? ` · ${meal.distance}` : ''}
          </Mono>
          <LabelSm dim style={{ marginTop: 2 }}>
            {SOURCE_TAG[meal.source]}
          </LabelSm>
        </>
      ) : (
        <Mono dim style={{ marginTop: spacing.sm }}>
          tap to plan
        </Mono>
      )}
    </Pressable>
  );
}
