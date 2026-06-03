import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Field } from '@/components/ui/Field';
import { Mono } from '@/components/ui/Type';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';

const CAMPUSES = [
  'Johns Hopkins University',
  'University of Maryland',
  'Towson University',
  'Georgetown University',
  'University of Pennsylvania',
  'New York University',
  'Boston University',
  'Stanford University',
];

export default function CampusScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const campus = useUserStore((s) => s.campus);
  const setCampus = useUserStore((s) => s.setCampus);
  const [value, setValue] = useState(campus);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return CAMPUSES.filter((c) => c.toLowerCase().includes(q) && c.toLowerCase() !== q).slice(0, 4);
  }, [value]);

  return (
    <OnboardingScaffold
      step={2}
      prompt="what's your campus?"
      subtitle="i use this for dining halls and nearby stores."
      nextDisabled={value.trim().length === 0}
      onNext={() => {
        setCampus(value.trim());
        router.push('/onboarding/zip');
      }}
    >
      <Field
        label="campus"
        value={value}
        onChangeText={setValue}
        placeholder="start typing…"
        autoFocus
        autoCapitalize="words"
      />
      <View style={{ marginTop: spacing.sm }}>
        {matches.map((m) => (
          <Pressable
            key={m}
            onPress={() => setValue(m)}
            style={({ pressed }) => ({
              paddingVertical: spacing.sm + 2,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Mono dim>{m}</Mono>
          </Pressable>
        ))}
      </View>
    </OnboardingScaffold>
  );
}
