import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Title, LabelSm } from '@/components/ui/Type';
import { FridgeInterior } from './FridgeInterior';
import { FridgeDoor } from './FridgeDoor';
import {
  selectActive,
  selectExpiringSoon,
  useFridgeStore,
} from '@/stores/fridgeStore';
import { useDailyStore } from '@/stores/dailyStore';

const STAGE_HEIGHT = 224;

/** The tappable, openable fridge on the home screen. */
export function FridgeCard() {
  const { colors } = useTheme();
  const items = useFridgeStore((s) => s.items);
  const markChecked = useFridgeStore((s) => s.markChecked);
  const completeDaily = useDailyStore((s) => s.complete);

  const active = selectActive({ items } as any);
  const expiring = selectExpiringSoon({ items } as any);
  const [open, setOpen] = useState(false);

  const summary =
    active.length === 0
      ? 'empty'
      : expiring.length > 0
        ? `${expiring.length} expiring soon`
        : `${active.length} fresh`;

  const toggle = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const next = !open;
    setOpen(next);
    if (next) {
      markChecked();
      completeDaily('fridge_checked');
    }
  };

  return (
    <Card bare>
      <Pressable onPress={toggle} style={{ padding: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Title>the fridge</Title>
          <LabelSm dim>{open ? 'tap to close' : 'tap to open'}</LabelSm>
        </View>
        <LabelSm color={expiring.length ? colors.amber : colors.muted} style={{ marginTop: spacing.md }}>
          {summary}
        </LabelSm>

        {/* stage: interior behind, door in front */}
        <View style={{ height: STAGE_HEIGHT, marginTop: spacing.lg }}>
          <FridgeInterior items={active} height={STAGE_HEIGHT} />
          <FridgeDoor open={open} items={active} summary={summary} />
        </View>
      </Pressable>
    </Card>
  );
}
