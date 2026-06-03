import React from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Title, Label, Mono } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';
import { FitnessGoal, useUserStore } from '@/stores/userStore';

const GOALS: FitnessGoal[] = ['strength', 'cardio', 'flexibility', 'general'];

export default function FitnessScreen() {
  const goal = useUserStore((s) => s.fitnessGoal);
  const update = useUserStore((s) => s.update);

  return (
    <Screen>
      <Title style={{ fontSize: 26 }}>fitness</Title>
      <Mono dim style={{ marginTop: spacing.sm }}>
        the body part. landing soon — set your intention now and it'll be ready.
      </Mono>

      <Card style={{ marginTop: spacing.xl }}>
        <Label dim style={{ marginBottom: spacing.md }}>what are you after?</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {GOALS.map((g) => (
            <Pill key={g} label={g} selected={goal === g} onPress={() => update({ fitnessGoal: g })} />
          ))}
        </View>
      </Card>

      <Card style={{ marginTop: spacing.lg }}>
        <Title>rec center classes</Title>
        <Mono dim style={{ marginTop: spacing.sm }}>
          coming soon — i'll pull the JHU Athletics schedule and slot classes into your week, same as meals.
        </Mono>
        <Label dim style={{ marginTop: spacing.lg }}>phase 2</Label>
      </Card>
    </Screen>
  );
}
