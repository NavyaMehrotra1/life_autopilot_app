import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { DayPicker } from '@/components/ui/DayPicker';
import { Pill } from '@/components/ui/Pill';
import { Label, Mono } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { computeReviewTime } from '@/lib/notifications';
import { weekdayName } from '@/lib/date';

const TIMES = [
  { label: '12 pm', hour: 12 },
  { label: '3 pm', hour: 15 },
  { label: '5 pm', hour: 17 },
  { label: '6 pm', hour: 18 },
  { label: '8 pm', hour: 20 },
];

function fmt(h: number) {
  const ampm = h >= 12 ? 'pm' : 'am';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:00 ${ampm}`;
}

export default function DeliveryTimeScreen() {
  const router = useRouter();
  const deliveryTime = useUserStore((s) => s.deliveryTime);
  const setDeliveryTime = useUserStore((s) => s.setDeliveryTime);
  const [day, setDay] = useState(deliveryTime.day);
  const [hour, setHour] = useState(deliveryTime.hour);

  const review = computeReviewTime({ day, hour, minute: 0 });

  return (
    <OnboardingScaffold
      step={6}
      prompt="when do you want groceries delivered?"
      subtitle="i'll prep your cart so it's ready to review before then."
      onNext={() => {
        setDeliveryTime({ day, hour, minute: 0 });
        router.push('/onboarding/laundry-day');
      }}
    >
      <Label dim style={{ marginBottom: spacing.sm }}>
        day
      </Label>
      <DayPicker value={day} onChange={setDay} />

      <Label dim style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>
        time
      </Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {TIMES.map((t) => (
          <Pill key={t.hour} label={t.label} selected={hour === t.hour} onPress={() => setHour(t.hour)} />
        ))}
      </View>

      <Mono dim style={{ marginTop: spacing.xl, fontSize: 11 }}>
        i'll nudge you to review around {weekdayName(review.weekday - 1).toLowerCase()} {fmt(review.hour)} — delivery minus prep time.
      </Mono>
    </OnboardingScaffold>
  );
}
