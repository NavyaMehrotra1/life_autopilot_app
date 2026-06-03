import React, { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Greeting, GreetingSub, Mono } from '@/components/ui/Type';
import { Button } from '@/components/ui/Button';
import { Tree } from '@/components/living/Tree';
import { useUserStore } from '@/stores/userStore';
import {
  requestNotificationPermissions,
  scheduleGroceryReview,
  scheduleLaundryDay,
} from '@/lib/notifications';

export default function CompleteScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const name = useUserStore((s) => s.name);
  const deliveryTime = useUserStore((s) => s.deliveryTime);
  const laundryDay = useUserStore((s) => s.laundryDay);
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const [busy, setBusy] = useState(false);

  const enter = async () => {
    setBusy(true);
    completeOnboarding();
    // Schedule the recurring nudges (no-ops on web/simulator).
    const granted = await requestNotificationPermissions();
    if (granted) {
      await scheduleGroceryReview(deliveryTime);
      await scheduleLaundryDay(laundryDay);
    }
    router.replace('/(tabs)');
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Tree state="growing" size={150} />
        <Greeting style={{ textAlign: 'center', marginTop: spacing.xl }}>you're set{name ? `, ${name.split(' ')[0]}` : ''}.</Greeting>
        <GreetingSub dim style={{ textAlign: 'center', marginTop: spacing.xs }}>
          everything's handled.
        </GreetingSub>
        <Mono dim style={{ textAlign: 'center', marginTop: spacing.lg, fontSize: 12 }}>
          your tree is growing. keep the small things going and it'll thrive.
        </Mono>
      </View>
      <Button label="take me home" loading={busy} onPress={enter} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}
