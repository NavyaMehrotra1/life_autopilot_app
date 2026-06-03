import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Remove inner padding (for cards that manage their own). */
  bare?: boolean;
  /** Lift the card off the page with a soft paper shadow. */
  raised?: boolean;
};

/** The base paper card surface used across the app. */
export function Card({ children, onPress, style, bare, raised = true }: Props) {
  const { colors, shadow } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: bare ? 0 : spacing.lg,
  };
  const content = (
    <View style={[base, raised && shadow, style]}>{children}</View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.94 : 1, transform: [{ scale: pressed ? 0.995 : 1 }] }]}
    >
      {content}
    </Pressable>
  );
}
