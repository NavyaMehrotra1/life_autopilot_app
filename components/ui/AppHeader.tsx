import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Brand } from './Type';
import { ModeToggle } from './ModeToggle';

/** The fixed editorial header: LIFE AUTOPILOT / V.01 + mode toggle. */
export function AppHeader() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Brand>LIFE AUTOPILOT</Brand>
        <Brand color={colors.muted} style={{ marginLeft: spacing.sm }}>
          / V.01
        </Brand>
      </View>
      <ModeToggle />
    </View>
  );
}
