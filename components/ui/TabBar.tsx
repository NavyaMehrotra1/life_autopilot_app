import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { LabelSm } from './Type';
import { TabIcon, TabName } from './TabIcon';

const LABELS: Record<string, string> = {
  index: 'home',
  fridge: 'fridge',
  meals: 'meals',
  fitness: 'fitness',
  profile: 'you',
};

/** Editorial bottom nav. Active tab in primary text, others muted. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom || spacing.md,
          paddingHorizontal: spacing.sm,
        },
        shadow,
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? colors.text : colors.muted;

        const onPress = () => {
          if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
          >
            <TabIcon name={route.name as TabName} color={color} size={24} />
            <LabelSm color={color} style={{ fontSize: 10 }}>
              {LABELS[route.name] ?? route.name}
            </LabelSm>
          </Pressable>
        );
      })}
    </View>
  );
}
