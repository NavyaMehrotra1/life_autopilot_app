import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { LabelSm } from './Type';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** A selectable monospace chip. Used in onboarding + filters. */
export function Pill({ label, selected, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? colors.inverse : 'transparent',
        borderColor: selected ? colors.inverse : colors.border,
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg + 4,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <LabelSm color={selected ? colors.inverseText : colors.muted}>{label}</LabelSm>
    </Pressable>
  );
}
