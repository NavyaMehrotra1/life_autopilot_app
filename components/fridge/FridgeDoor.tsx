import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { Label, LabelSm, Mono } from '@/components/ui/Type';
import { ExpiryBar } from './ExpiryBar';
import { FridgeItem } from '@/stores/fridgeStore';

type Props = {
  open: boolean;
  items: FridgeItem[];
  summary: string;
};

/** The fridge door face: shows the inventory list, swings open on rotateY. */
export function FridgeDoor({ open, items, summary }: Props) {
  const { colors } = useTheme();
  const progress = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, {
      duration: 540,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [open, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${-108 * progress.value}deg` }],
    opacity: 1 - progress.value * 0.1,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          transformOrigin: 'left center',
          backfaceVisibility: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: radius.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          padding: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Label dim>inside</Label>
          <LabelSm dim>{summary}</LabelSm>
        </View>

        <View style={{ marginTop: spacing.sm, flex: 1 }}>
          {items.length === 0 ? (
            <Mono dim style={{ marginTop: spacing.md }}>
              your fridge is a mystery right now. let's fix that.
            </Mono>
          ) : (
            items.slice(0, 4).map((item) => (
              <View key={item.id} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Mono numberOfLines={1} style={{ flex: 1 }}>
                    {item.name.toLowerCase()}
                  </Mono>
                  <Mono dim style={{ fontSize: 11 }}>
                    {item.quantity}
                  </Mono>
                </View>
                <View style={{ marginTop: 4 }}>
                  <ExpiryBar item={item} showLabel={false} />
                </View>
              </View>
            ))
          )}
        </View>

        {/* handle */}
        <View
          style={{
            position: 'absolute',
            right: 8,
            top: '38%',
            width: 6,
            height: 48,
            borderRadius: 3,
            backgroundColor: colors.border,
          }}
        />
      </View>
    </Animated.View>
  );
}
