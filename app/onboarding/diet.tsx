import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Pill } from '@/components/ui/Pill';
import { spacing } from '@/constants/theme';
import { DietTag, useUserStore } from '@/stores/userStore';

const OPTIONS: DietTag[] = ['vegetarian', 'vegan', 'no eggs', 'halal', 'kosher', 'no restrictions'];

export default function DietScreen() {
  const router = useRouter();
  const diet = useUserStore((s) => s.diet);
  const toggleDiet = useUserStore((s) => s.toggleDiet);

  return (
    <OnboardingScaffold
      step={4}
      prompt="how do you eat?"
      subtitle="pick any that apply — i'll respect them in every order."
      onNext={() => router.push('/onboarding/store')}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {OPTIONS.map((opt) => (
          <Pill key={opt} label={opt} selected={diet.includes(opt)} onPress={() => toggleDiet(opt)} />
        ))}
      </View>
    </OnboardingScaffold>
  );
}
