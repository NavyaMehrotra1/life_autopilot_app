import React from 'react';
import { ScrollView, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { AppHeader } from './AppHeader';

type Props = {
  children: React.ReactNode;
  /** Show the fixed LIFE AUTOPILOT header. */
  header?: boolean;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

/** Page chrome: themed background, safe-area top, optional header + scroll. */
export function Screen({ children, header = true, scroll = true, contentStyle }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const inner = (
    <>
      {header ? <AppHeader /> : null}
      <View style={[{ paddingHorizontal: spacing.xl + 2 }, contentStyle]}>{children}</View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing.md }}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxxl + insets.bottom + 80 }}
          keyboardShouldPersistTaps="handled"
        >
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </View>
  );
}
