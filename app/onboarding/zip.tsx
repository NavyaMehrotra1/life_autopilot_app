import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Field } from '@/components/ui/Field';
import { useUserStore } from '@/stores/userStore';

const isValidZip = (s: string) => /^\d{5}$/.test(s.trim());

export default function ZipScreen() {
  const router = useRouter();
  const zip = useUserStore((s) => s.zip);
  const setZip = useUserStore((s) => s.setZip);
  const [value, setValue] = useState(zip);

  return (
    <OnboardingScaffold
      step={3}
      prompt="what's your zip?"
      subtitle="i use this to find the nearest target on instacart."
      nextDisabled={!isValidZip(value)}
      onNext={() => {
        setZip(value.trim());
        router.push('/onboarding/diet');
      }}
    >
      <Field
        label="zip code"
        value={value}
        onChangeText={(t) => setValue(t.replace(/[^0-9]/g, '').slice(0, 5))}
        placeholder="21218"
        autoFocus
        keyboardType="number-pad"
        maxLength={5}
      />
    </OnboardingScaffold>
  );
}
