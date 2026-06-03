import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Mono, LabelSm } from '@/components/ui/Type';
import { ExpiryBar, freshnessColor } from './ExpiryBar';
import { FridgeItem, freshnessOf } from '@/stores/fridgeStore';

type Props = {
  item: FridgeItem;
  onConsume?: (id: string) => void;
  onRemove?: (id: string) => void;
};

/** A single fridge line: name, quantity, freshness bar, quick actions. */
export function InventoryItem({ item, onConsume, onRemove }: Props) {
  const { colors } = useTheme();
  const dot = freshnessColor(freshnessOf(item), colors);

  return (
    <View style={{ paddingVertical: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot, marginRight: spacing.sm }} />
        <Mono style={{ flex: 1 }} numberOfLines={1}>
          {item.name.toLowerCase()}
        </Mono>
        <Mono dim style={{ fontSize: 11 }}>
          {item.quantity}
        </Mono>
      </View>

      <ExpiryBar item={item} showLabel={false} />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <Mono color={dot} style={{ flex: 1, fontSize: 11 }}>
          {freshnessOf(item) === 'expired' ? 'expired' : item.storage}
        </Mono>
        {onConsume && (
          <Pressable onPress={() => onConsume(item.id)} hitSlop={8} style={{ marginRight: spacing.lg }}>
            <LabelSm color={colors.sage}>ate it</LabelSm>
          </Pressable>
        )}
        {onRemove && (
          <Pressable onPress={() => onRemove(item.id)} hitSlop={8}>
            <LabelSm color={colors.muted}>toss</LabelSm>
          </Pressable>
        )}
      </View>
    </View>
  );
}
