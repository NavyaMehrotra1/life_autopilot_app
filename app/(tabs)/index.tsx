import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Title, LabelSm, Mono } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';

import { Greeting } from '@/components/home/Greeting';
import { MetaBar } from '@/components/home/MetaBar';
import { LivingRow } from '@/components/home/LivingRow';
import { MatchaCup } from '@/components/home/MatchaCup';
import { AttentionNote } from '@/components/home/AttentionNote';
import { FridgeCard } from '@/components/fridge/FridgeCard';
import { MealPlanRow } from '@/components/meals/MealPlanRow';
import { LaundryTimers } from '@/components/laundry/LaundryTimers';
import { ReadingCard } from '@/components/reading/ReadingCard';
import { SuppliesCard } from '@/components/supplies/SuppliesCard';

import { useUserStore } from '@/stores/userStore';
import { useMealsStore } from '@/stores/mealsStore';
import { useAttentionItems } from '@/lib/attention';

function Section({ children }: { children: React.ReactNode }) {
  return <View style={{ marginTop: spacing.xl + 4 }}>{children}</View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const name = useUserStore((s) => s.name);
  const plan = useMealsStore((s) => s.plan);
  const attention = useAttentionItems();
  const today = new Date().getDay();

  return (
    <Screen>
      <Greeting name={name} />
      <MetaBar count={attention.length} />

      <LivingRow />

      <Card>
        <Title style={{ marginBottom: spacing.md }}>today's cup</Title>
        <MatchaCup />
      </Card>

      <Section>
        <AttentionNote items={attention} />
      </Section>

      <Section>
        <FridgeCard />
      </Section>

      <Section>
        <Card onPress={() => router.push('/(tabs)/meals')}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: spacing.md }}>
            <Title>today's meals</Title>
            <LabelSm dim>{plan.length ? 'tap to plan week' : 'not planned'}</LabelSm>
          </View>
          {plan.length ? (
            <MealPlanRow plan={plan} day={today} highlightCurrent onSwap={() => router.push('/(tabs)/meals')} />
          ) : (
            <Mono dim>no plan yet. i can lay out your whole week — tap to start.</Mono>
          )}
        </Card>
      </Section>

      <Section>
        <LaundryTimers />
      </Section>

      <Section>
        <ReadingCard onPress={() => router.push('/reading')} />
      </Section>

      <Section>
        <SuppliesCard onPress={() => router.push('/(tabs)/profile')} />
      </Section>

      <Section>
        <Card onPress={() => router.push('/(tabs)/fitness')}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Title>fitness</Title>
            <LabelSm dim>coming soon</LabelSm>
          </View>
          <Mono dim style={{ marginTop: spacing.sm }}>
            rec center classes + your goals. landing here next.
          </Mono>
        </Card>
      </Section>
    </Screen>
  );
}
