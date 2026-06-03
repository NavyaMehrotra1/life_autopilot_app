import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Title, LabelSm, Mono } from '@/components/ui/Type';
import { TimerStage, StageState } from './TimerStage';
import {
  DRY_MINUTES,
  WASH_MINUTES,
  daysSinceLaundry,
  doneThisWeek,
  useLaundryStore,
} from '@/stores/laundryStore';
import { useDailyStore } from '@/stores/dailyStore';
import { scheduleLaundryStageDone } from '@/lib/notifications';
import { formatCountdown, relativeDays } from '@/lib/date';

export function LaundryTimers() {
  const { colors } = useTheme();
  const stage = useLaundryStore((s) => s.stage);
  const stageEndsAt = useLaundryStore((s) => s.stageEndsAt);
  const lastCompleted = useLaundryStore((s) => s.lastCompleted);
  const history = useLaundryStore((s) => s.history);
  const { startWash, startDry, startFold, finishFold, cancel } = useLaundryStore();
  const completeDaily = useDailyStore((s) => s.complete);

  const timed = stage === 'wash' || stage === 'dry';
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!timed) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timed]);

  const remaining = timed && stageEndsAt ? stageEndsAt - now : 0;
  const timerDone = timed && remaining <= 0;
  const countdown = formatCountdown(remaining);

  // Per-stage display state.
  const washState: StageState =
    stage === 'idle' ? 'upcoming' : stage === 'wash' ? (timerDone ? 'done' : 'active') : 'done';
  const dryState: StageState =
    stage === 'dry' ? (timerDone ? 'done' : 'active') : stage === 'fold' ? 'done' : 'upcoming';
  const foldState: StageState = stage === 'fold' ? 'active' : 'upcoming';

  const onStartWash = () => {
    startWash();
    completeDaily('laundry_touched');
    scheduleLaundryStageDone('wash', WASH_MINUTES * 60);
  };
  const onStartDry = () => {
    startDry();
    scheduleLaundryStageDone('dry', DRY_MINUTES * 60);
  };

  const since = daysSinceLaundry(lastCompleted);
  const statusLine =
    stage !== 'idle'
      ? 'a load is in motion.'
      : doneThisWeek(history)
        ? `last done ${since != null ? relativeDays(-since) : 'recently'}.`
        : 'no load this week yet.';

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title>laundry</Title>
        <LabelSm dim>{statusLine}</LabelSm>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
        <TimerStage stage="wash" label="wash" state={washState} status={washState === 'active' ? countdown : undefined} />
        <TimerStage stage="dry" label="dry" state={dryState} status={dryState === 'active' ? countdown : undefined} />
        <TimerStage stage="fold" label="fold" state={foldState} status="tap when done" />
      </View>

      <View style={{ marginTop: spacing.lg }}>
        {stage === 'idle' && <Button label="start a load" tone="sage" onPress={onStartWash} />}

        {stage === 'wash' && !timerDone && (
          <>
            <Mono dim style={{ textAlign: 'center', marginBottom: spacing.sm }}>washing…</Mono>
            <Button label="cancel" variant="ghost" onPress={cancel} />
          </>
        )}
        {stage === 'wash' && timerDone && <Button label="into the dryer →" tone="amber" onPress={onStartDry} />}

        {stage === 'dry' && !timerDone && (
          <>
            <Mono dim style={{ textAlign: 'center', marginBottom: spacing.sm }}>drying…</Mono>
            <Button label="cancel" variant="ghost" onPress={cancel} />
          </>
        )}
        {stage === 'dry' && timerDone && <Button label="time to fold →" tone="amber" onPress={startFold} />}

        {stage === 'fold' && <Button label="all folded ✓" tone="sage" onPress={finishFold} />}
      </View>
    </Card>
  );
}
