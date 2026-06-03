import React from 'react';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { LabelSm, Mono } from '@/components/ui/Type';
import { freshnessColor } from './ExpiryBar';
import { FridgeItem, freshnessOf } from '@/stores/fridgeStore';

/** The lit interior: shelves with item tokens that glow by freshness. */
export function FridgeInterior({ items, height = 220 }: { items: FridgeItem[]; height?: number }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        height,
        borderRadius: radius.md,
        backgroundColor: colors.well,
        padding: spacing.md,
        overflow: 'hidden',
        justifyContent: 'space-between',
      }}
    >
      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Mono dim>nothing in here yet.</Mono>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {items.slice(0, 9).map((item, i) => {
              const color = freshnessColor(freshnessOf(item), colors);
              return (
                <Animated.View
                  key={item.id}
                  entering={ZoomIn.delay(i * 55).springify().damping(14)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: colors.card,
                    borderColor: color,
                    borderWidth: 1.5,
                    alignItems: 'center',
                    justifyContent: 'center',
                    // soft "glow"
                    shadowColor: color,
                    shadowOpacity: 0.6,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 0 },
                  }}
                >
                  <LabelSm color={color}>{item.name.slice(0, 2).toUpperCase()}</LabelSm>
                  <Mono dim style={{ fontSize: 9, marginTop: 2 }} numberOfLines={1}>
                    {item.name.split(' ')[0].toLowerCase()}
                  </Mono>
                </Animated.View>
              );
            })}
          </View>
          {/* shelf rails */}
          <View>
            <View style={{ height: 1, backgroundColor: colors.border, opacity: 0.6, marginBottom: spacing.md }} />
            <LabelSm dim>{items.length} items · cold and quiet</LabelSm>
          </View>
        </>
      )}
    </View>
  );
}
