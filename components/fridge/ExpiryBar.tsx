import React from 'react';
import { View } from 'react-native';
import { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/lib/ThemeContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Mono } from '@/components/ui/Type';
import {
  FridgeItem,
  Freshness,
  freshnessOf,
  itemDaysRemaining,
  expiryDate,
} from '@/stores/fridgeStore';
import { daysBetween } from '@/lib/date';
import { relativeDays } from '@/lib/date';

export function freshnessColor(f: Freshness, c: ThemeColors): string {
  switch (f) {
    case 'fresh':
      return c.sage;
    case 'soon':
      return c.amber;
    case 'urgent':
      return c.red;
    case 'expired':
      return c.muted;
  }
}

export function ExpiryBar({ item, showLabel = true }: { item: FridgeItem; showLabel?: boolean }) {
  const { colors } = useTheme();
  const f = freshnessOf(item);
  const days = itemDaysRemaining(item);

  // Fraction of total shelf life still remaining.
  const totalLife = Math.max(1, daysBetween(item.purchaseDate, expiryDate(item)));
  const ratio = Math.max(0, Math.min(1, days / totalLife));
  const color = freshnessColor(f, colors);

  return (
    <View>
      <ProgressBar value={f === 'expired' ? 1 : ratio} color={color} height={5} />
      {showLabel && (
        <Mono color={color} style={{ marginTop: 4, fontSize: 11 }}>
          {f === 'expired' ? 'expired' : `${relativeDays(days)}`}
        </Mono>
      )}
    </View>
  );
}
