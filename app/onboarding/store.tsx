import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Pill } from '@/components/ui/Pill';
import { Mono } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';

const STORES = ['Target', 'Whole Foods', 'Safeway', 'Giant', 'Trader Joe\'s', 'Walmart', 'Wegmans'];

export default function StoreScreen() {
  const router = useRouter();
  const store = useUserStore((s) => s.store);
  const setStore = useUserStore((s) => s.setStore);

  return (
    <OnboardingScaffold
      step={5}
      prompt="what's your go-to grocery store?"
      subtitle="i'll build carts here through instacart — you always review first."
      onNext={() => router.push('/onboarding/delivery-time')}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {STORES.map((s) => (
          <Pill key={s} label={s} selected={store === s} onPress={() => setStore(s)} />
        ))}
      </View>
      <Mono dim style={{ marginTop: spacing.lg, fontSize: 11 }}>
        i'll look up the nearest {store} on instacart when you build your first cart.
      </Mono>
    </OnboardingScaffold>
  );
}
