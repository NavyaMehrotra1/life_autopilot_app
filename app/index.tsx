import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';
import { useUserStore } from '@/stores/userStore';
import { useUserHydrated } from '@/lib/useHydrated';

/** Entry gate: wait for persisted state, then route to home or onboarding. */
export default function Index() {
  const { colors } = useTheme();
  const hydrated = useUserHydrated();
  const onboarded = useUserStore((s) => s.onboarded);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.muted} />
      </View>
    );
  }

  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding/name'} />;
}
