import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Title, Label, LabelSm, Mono } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/lib/ThemeContext';

import { MealPlanRow } from '@/components/meals/MealPlanRow';
import { SwapSheet, SwapOption } from '@/components/meals/SwapSheet';
import { GroceryCart } from '@/components/meals/GroceryCart';

import { Meal, MealSlotName, useMealsStore } from '@/stores/mealsStore';
import { useUserStore } from '@/stores/userStore';
import { useFridgeStore, selectActive } from '@/stores/fridgeStore';
import { useDailyStore } from '@/stores/dailyStore';
import { generateWeekPlan } from '@/lib/mealPlanner';
import { LOADING_COPY } from '@/lib/claude';
import { weekdayName } from '@/lib/date';

export default function MealsScreen() {
  const { colors } = useTheme();
  const plan = useMealsStore((s) => s.plan);
  const setPlan = useMealsStore((s) => s.setPlan);
  const swapMeal = useMealsStore((s) => s.swapMeal);
  const swaps = useMealsStore((s) => s.swaps);
  const diningEnabled = useUserStore((s) => s.diningHallsEnabled);
  const diet = useUserStore((s) => s.diet);
  const update = useUserStore((s) => s.update);
  const items = useFridgeStore((s) => s.items);
  const completeDaily = useDailyStore((s) => s.complete);

  const [planning, setPlanning] = useState(false);
  const [swapTarget, setSwapTarget] = useState<Meal | null>(null);

  const today = new Date().getDay();
  const fridgeFirst = selectActive({ items } as any)[0]?.name;
  const days = Array.from({ length: 7 }, (_, i) => (today + i) % 7);

  const planWeek = async () => {
    setPlanning(true);
    const meals = await generateWeekPlan({
      diningEnabled,
      diet,
      fridgeItems: selectActive({ items } as any).map((it) => it.name),
      recentSwaps: swaps.slice(0, 8).map((s) => ({ from: s.from, to: s.to })),
    });
    setPlan(meals);
    setPlanning(false);
  };

  const onSelectSwap = (opt: SwapOption) => {
    if (swapTarget) {
      swapMeal(swapTarget.id, opt);
      completeDaily('meal_logged');
    }
    setSwapTarget(null);
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title style={{ fontSize: 26 }}>meals</Title>
        <LabelSm dim>{plan.length ? 'this week' : 'unplanned'}</LabelSm>
      </View>

      {/* dining toggle */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, alignItems: 'center' }}>
        <Label dim style={{ marginRight: spacing.xs }}>dining halls</Label>
        <Pill label="on" selected={diningEnabled} onPress={() => update({ diningHallsEnabled: true })} />
        <Pill label="off" selected={!diningEnabled} onPress={() => update({ diningHallsEnabled: false })} />
      </View>

      <Button
        label={plan.length ? 're-plan my week' : 'plan my week'}
        tone="amber"
        onPress={planWeek}
        loading={planning}
        disabled={planning}
        style={{ marginTop: spacing.lg }}
      />

      {planning && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
          <ActivityIndicator color={colors.amber} />
          <Mono color={colors.amber}>{LOADING_COPY.meals}</Mono>
        </View>
      )}

      {plan.length === 0 && !planning && (
        <Mono dim style={{ marginTop: spacing.md }}>
          a fresh week, ready when you are. tap above and i'll lay out all three meals — varied, easy, just for you.
        </Mono>
      )}

      {plan.length > 0 &&
        days.map((day) => (
          <View key={day} style={{ marginTop: spacing.xl }}>
            <Label color={day === today ? colors.amber : colors.muted} style={{ marginBottom: spacing.sm }}>
              {day === today ? 'today' : weekdayName(day)}
            </Label>
            <MealPlanRow
              plan={plan}
              day={day}
              highlightCurrent={day === today}
              onSwap={(_slot: MealSlotName, meal?: Meal) => meal && setSwapTarget(meal)}
            />
          </View>
        ))}

      <View style={{ marginTop: spacing.xxl }}>
        <GroceryCart />
      </View>

      <SwapSheet
        visible={!!swapTarget}
        meal={swapTarget ?? undefined}
        diningEnabled={diningEnabled}
        fridgeFirst={fridgeFirst}
        onClose={() => setSwapTarget(null)}
        onSelect={onSelectSwap}
      />
    </Screen>
  );
}
