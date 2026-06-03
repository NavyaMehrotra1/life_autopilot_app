import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { DayPicker } from '@/components/ui/DayPicker';
import { Mono } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { weekdayName } from '@/lib/date';

export default function LaundryDayScreen() {
  const router = useRouter();
  const laundryDay = useUserStore((s) => s.laundryDay);
  const setLaundryDay = useUserStore((s) => s.setLaundryDay);
  const [day, setDay] = useState(laundryDay);

  return (
    <OnboardingScaffold
      step={7}
      prompt="what day do you do laundry?"
      subtitle="i'll keep the cadence and run the timers."
      onNext={() => {
        setLaundryDay(day);
        router.push('/onboarding/reading');
      }}
    >
      <DayPicker value={day} onChange={setDay} />
      <Mono dim style={{ marginTop: spacing.lg, fontSize: 11 }}>
        every {weekdayName(day).toLowerCase()}. if it slips past wednesday, your buddy starts to notice.
      </Mono>
    </OnboardingScaffold>
  );
}
