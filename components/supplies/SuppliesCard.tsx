import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Title, LabelSm, Mono } from '@/components/ui/Type';
import { ArrowRow } from '@/components/ui/ArrowRow';
import {
  isLow,
  supplyDaysLeft,
  useSuppliesStore,
} from '@/stores/suppliesStore';

/** Compact supplies status for the home screen. */
export function SuppliesCard({ onPress }: { onPress?: () => void }) {
  const { colors } = useTheme();
  const items = useSuppliesStore((s) => s.items);
  const low = items.filter(isLow).sort((a, b) => supplyDaysLeft(a) - supplyDaysLeft(b));
  const onList = items.filter((i) => i.onRestockList).length;

  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title>supplies</Title>
        <LabelSm dim>{items.length ? `${items.length} tracked` : 'tap to set up'}</LabelSm>
      </View>

      {items.length === 0 ? (
        <Mono dim style={{ marginTop: spacing.sm }}>
          your shelves are uncharted. add what runs out.
        </Mono>
      ) : low.length === 0 ? (
        <Mono color={colors.sage} style={{ marginTop: spacing.sm }}>
          everything's stocked. nice.
        </Mono>
      ) : (
        <View style={{ marginTop: spacing.xs }}>
          {low.slice(0, 3).map((it) => {
            const d = supplyDaysLeft(it);
            return (
              <ArrowRow
                key={it.id}
                label={it.name.toLowerCase()}
                timing={`~${Math.max(0, d)}d left`}
                timingColor={d <= 2 ? colors.red : colors.amber}
              />
            );
          })}
        </View>
      )}

      {onList > 0 && (
        <LabelSm color={colors.amber} style={{ marginTop: spacing.sm }}>
          {onList} on the amazon list
        </LabelSm>
      )}
    </Card>
  );
}
