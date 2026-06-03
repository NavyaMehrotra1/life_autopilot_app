import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Mono } from './Type';

type Props = {
  label: string;
  /** Right-aligned timing / status string. */
  timing?: string;
  timingColor?: string;
  onPress?: () => void;
  /** Replace the arrow glyph (e.g. a check). */
  glyph?: string;
  dim?: boolean;
};

/** The signature "→ thing ............ timing" editorial list row. */
export function ArrowRow({ label, timing, timingColor, onPress, glyph = '→', dim }: Props) {
  const { colors } = useTheme();
  const body = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
      }}
    >
      <Mono color={timingColor ?? colors.muted} style={{ width: 18 }}>
        {glyph}
      </Mono>
      <Mono
        dim={dim}
        numberOfLines={1}
        style={{ flex: 1, paddingRight: spacing.sm }}
      >
        {label}
      </Mono>
      {timing ? (
        <Mono color={timingColor ?? colors.muted} style={{ textAlign: 'right' }}>
          {timing}
        </Mono>
      ) : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      {body}
    </Pressable>
  );
}
