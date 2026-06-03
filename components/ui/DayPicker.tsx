import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { LabelSm } from './Type';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** A 7-day selector (0 = Sunday). */
export function DayPicker({ value, onChange }: { value: number; onChange: (day: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.xs }}>
      {DAYS.map((label, i) => {
        const selected = value === i;
        return (
          <Pressable
            key={i}
            onPress={() => onChange(i)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              paddingVertical: spacing.md,
              borderRadius: radius.sm,
              borderWidth: 1,
              borderColor: selected ? colors.inverse : colors.border,
              backgroundColor: selected ? colors.inverse : 'transparent',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <LabelSm color={selected ? colors.inverseText : colors.muted}>{label}</LabelSm>
          </Pressable>
        );
      })}
    </View>
  );
}
