import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { Label } from './Type';

type Props = {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Slight rotation for a hand-placed feel. */
  tilt?: number;
};

/** A sticky note card with a strip of tape across the top. */
export function StickyNote({ title, children, style, tilt = -0.4 }: Props) {
  const { colors, shadow } = useTheme();
  return (
    <View style={[{ transform: [{ rotate: `${tilt}deg` }] }, style]}>
      {/* tape tab */}
      <View
        style={[
          styles.tape,
          { backgroundColor: colors.tape, borderColor: colors.border },
        ]}
      />
      <View
        style={[
          styles.note,
          shadow,
          { backgroundColor: colors.sticky, borderColor: colors.border },
        ]}
      >
        {title ? (
          <Label dim style={{ marginBottom: spacing.md }}>
            {title}
          </Label>
        ) : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tape: {
    position: 'absolute',
    top: -9,
    alignSelf: 'center',
    width: 78,
    height: 18,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 2,
    transform: [{ rotate: '-1.5deg' }],
  },
  note: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg + 2,
    paddingBottom: spacing.lg,
  },
});
