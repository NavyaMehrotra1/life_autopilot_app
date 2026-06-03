import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Field } from '@/components/ui/Field';
import { useUserStore } from '@/stores/userStore';

export default function NameScreen() {
  const router = useRouter();
  const name = useUserStore((s) => s.name);
  const setName = useUserStore((s) => s.setName);
  const [value, setValue] = useState(name);

  return (
    <OnboardingScaffold
      step={1}
      prompt="hi. let's set you up."
      subtitle="this takes about a minute. then i handle the rest."
      nextDisabled={value.trim().length === 0}
      showBack={false}
      onNext={() => {
        setName(value);
        router.push('/onboarding/campus');
      }}
    >
      <Field
        label="what should i call you?"
        value={value}
        onChangeText={setValue}
        placeholder="your name"
        autoFocus
        autoCapitalize="words"
        returnKeyType="next"
      />
    </OnboardingScaffold>
  );
}
