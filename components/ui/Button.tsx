import React from 'react';
import { ActivityIndicator, Pressable, View, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { Label } from './Type';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'solid' | 'ghost';
  tone?: 'default' | 'amber' | 'sage' | 'red';
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'solid',
  tone = 'default',
  style,
}: Props) {
  const { colors } = useTheme();
  const toneColor =
    tone === 'amber' ? colors.amber : tone === 'sage' ? colors.sage : tone === 'red' ? colors.red : colors.inverse;

  const solid = variant === 'solid';
  const bg = solid ? toneColor : 'transparent';
  const textColor = solid
    ? tone === 'default'
      ? colors.inverseText
      : '#fff'
    : toneColor;

  const isOff = disabled || loading;

  return (
    <Pressable
      onPress={isOff ? undefined : onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderColor: solid ? bg : colors.border,
          borderWidth: solid ? 0 : 1,
          borderRadius: radius.pill,
          paddingVertical: spacing.md + 2,
          paddingHorizontal: spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isOff ? 0.45 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <View style={{ height: 14, justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={textColor} />
        </View>
      ) : (
        <Label color={textColor}>{label}</Label>
      )}
    </Pressable>
  );
}
