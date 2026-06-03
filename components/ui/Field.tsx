import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { fonts, radius, spacing } from '@/constants/theme';
import { Label } from './Type';

type Props = TextInputProps & {
  label?: string;
};

/** Themed monospace text input. */
export function Field({ label, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View>
      {label ? (
        <Label dim style={{ marginBottom: spacing.sm }}>
          {label}
        </Label>
      ) : null}
      <TextInput
        placeholderTextColor={colors.muted}
        {...rest}
        style={[
          {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md + 2,
            color: colors.text,
            fontFamily: fonts.mono,
            fontSize: 15,
            backgroundColor: colors.card,
          },
          style,
        ]}
      />
    </View>
  );
}
