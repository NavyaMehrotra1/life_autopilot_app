import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Greeting, GreetingSub } from '@/components/ui/Type';
import { Button } from '@/components/ui/Button';

const TOTAL = 8;

type Props = {
  step: number;
  prompt: string;
  subtitle?: string;
  children?: React.ReactNode;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext: () => void;
  showBack?: boolean;
};

/** Shared layout for every onboarding step: progress, serif prompt, footer. */
export function OnboardingScaffold({
  step,
  prompt,
  subtitle,
  children,
  nextLabel = 'next',
  nextDisabled,
  onNext,
  showBack = true,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.xl }}>
        {/* progress dots */}
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.xxl }}>
          {Array.from({ length: TOTAL }).map((_, i) => (
            <View
              key={i}
              style={{
                height: 4,
                flex: 1,
                borderRadius: 2,
                backgroundColor: i < step ? colors.amber : colors.border,
              }}
            />
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.xl }}>
          <Greeting>{prompt}</Greeting>
          {subtitle ? (
            <GreetingSub dim style={{ marginTop: spacing.xs }}>
              {subtitle}
            </GreetingSub>
          ) : null}
          <View style={{ marginTop: spacing.xxl }}>{children}</View>
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: spacing.md, paddingBottom: insets.bottom + spacing.lg, paddingTop: spacing.md }}>
          {showBack && step > 1 && (
            <Button label="back" variant="ghost" onPress={() => router.back()} style={{ flex: 0.5 }} />
          )}
          <Button label={nextLabel} onPress={onNext} disabled={nextDisabled} style={{ flex: 1 }} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
