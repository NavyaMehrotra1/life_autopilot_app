import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { Label, LabelSm, Mono } from '@/components/ui/Type';
import { StageIcon } from './StageIcon';
import { LaundryStage } from '@/stores/laundryStore';

export type StageState = 'upcoming' | 'active' | 'done';

type Props = {
  stage: Exclude<LaundryStage, 'idle'>;
  label: string;
  state: StageState;
  /** Shown when active — countdown text or "tap when done". */
  status?: string;
};

/** A single laundry stage. Active = inverted dark card; others muted. */
export function TimerStage({ stage, label, state, status }: Props) {
  const { colors } = useTheme();
  const active = state === 'active';

  const bg = active ? colors.inverse : 'transparent';
  const fg = active ? colors.inverseText : state === 'done' ? colors.sage : colors.muted;
  const border = active ? colors.inverse : colors.border;

  return (
    <View
      style={{
        flex: 1,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: bg,
        padding: spacing.md,
        alignItems: 'center',
        opacity: state === 'upcoming' ? 0.6 : 1,
      }}
    >
      <StageIcon stage={stage} color={fg} />
      <Label color={fg} style={{ marginTop: spacing.sm }}>
        {label}
      </Label>

      {active && stage !== 'fold' ? (
        <Mono color={fg} style={{ marginTop: 6, fontSize: 18 }}>
          {status ?? '--:--'}
        </Mono>
      ) : (
        <LabelSm color={fg} style={{ marginTop: 4 }} numberOfLines={1}>
          {state === 'done' ? 'done ✓' : active ? status ?? 'tap when done' : 'up next'}
        </LabelSm>
      )}
    </View>
  );
}
