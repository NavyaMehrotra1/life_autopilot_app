import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, G, Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { lerpColor } from '@/lib/color';
import { Confetti } from '@/components/ui/Confetti';
import { Label, Mono } from '@/components/ui/Type';
import {
  DAILY_TASKS,
  dailyCompletedCount,
  useDailyStore,
} from '@/stores/dailyStore';

const EMPTY = '#C8D8A8';
const FULL = '#4A7A3A';

// Inner cup vertical span for the liquid (viewBox coords).
const TOP = 44;
const BOTTOM = 96;

const AnimatedPath = Animated.createAnimatedComponent(Path);

function Steam({ delay }: { delay: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, false);
  }, [t]);
  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.15 ? t.value / 0.15 : t.value > 0.7 ? (1 - t.value) / 0.3 : 1,
    transform: [{ translateY: -14 * t.value }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', top: -2, left: 0, right: 0, alignItems: 'center' }, style]}>
      <Svg width={40} height={26} viewBox="0 0 40 26">
        <Path
          d={`M${18 + delay} 24 q -6 -6 0 -12 q 6 -6 0 -10`}
          stroke="#B9C6A6"
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
          opacity={0.7}
        />
      </Svg>
    </Animated.View>
  );
}

/**
 * Real liquid: the surface is a live sine wave, the level springs toward the
 * task ratio, and completing a task kicks a `slosh` that spikes the amplitude
 * then settles — so the matcha visibly rises and rocks as the day fills in.
 * Two offset wave layers give it a little depth.
 */
function Liquid({ ratio, color }: { ratio: number; color: string }) {
  const level = useSharedValue(ratio);
  const phase = useSharedValue(0);
  const slosh = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false);
  }, [phase]);

  useEffect(() => {
    level.value = withSpring(ratio, { damping: 12, stiffness: 90, mass: 0.8 });
    slosh.value = 1;
    slosh.value = withTiming(0, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, [ratio, level, slosh]);

  function wave(phaseShift: number, ampScale: number) {
    'worklet';
    const lvl = level.value;
    const surfaceY = BOTTOM - lvl * (BOTTOM - TOP);
    const amp = (1.0 + slosh.value * 4.5) * ampScale;
    const k = phase.value * Math.PI * 2 + phaseShift;
    const x0 = 26;
    const x1 = 74;
    const steps = 10;
    let d = `M ${x0} ${BOTTOM + 8}`;
    d += ` L ${x0} ${surfaceY + amp * Math.sin(k)}`;
    for (let i = 1; i <= steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps;
      const y = surfaceY + amp * Math.sin(k + (i / steps) * Math.PI * 3);
      d += ` L ${x} ${y}`;
    }
    d += ` L ${x1} ${BOTTOM + 8} Z`;
    return d;
  }

  const backProps = useAnimatedProps(() => ({ d: wave(Math.PI * 0.6, 0.7) }));
  const frontProps = useAnimatedProps(() => ({ d: wave(0, 1) }));

  return (
    <G clipPath="url(#cupInner)">
      <AnimatedPath animatedProps={backProps} fill={lerpColor(color, '#FFFFFF', 0.28)} opacity={0.55} />
      <AnimatedPath animatedProps={frontProps} fill={color} />
    </G>
  );
}

export function MatchaCup() {
  const { colors } = useTheme();
  const done = useDailyStore((s) => s.done);
  const toggle = useDailyStore((s) => s.toggle);

  const completed = dailyCompletedCount(done);
  const total = DAILY_TASKS.length;
  const ratio = completed / total;
  const full = completed === total;

  const fillColor = lerpColor(EMPTY, FULL, ratio);

  // Leaf burst + haptic the moment the cup tops off.
  const prev = useRef(completed);
  const [burst, setBurst] = useState(false);
  useEffect(() => {
    if (completed > prev.current && completed === total) {
      setBurst(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      const id = setTimeout(() => setBurst(false), 1800);
      prev.current = completed;
      return () => clearTimeout(id);
    }
    prev.current = completed;
  }, [completed, total]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* cup */}
      <View style={{ width: 104, height: 124 }}>
        {full && (
          <>
            <Steam delay={-5} />
            <Steam delay={5} />
          </>
        )}
        {burst && <Confetti variant="leaves" />}
        <Svg width={104} height={124} viewBox="0 0 100 120">
          <Defs>
            <ClipPath id="cupInner">
              <Path d="M33 44 H67 L62 96 Q50 100 38 96 Z" />
            </ClipPath>
          </Defs>

          {/* liquid */}
          <Liquid ratio={ratio} color={fillColor} />

          {/* cup outline */}
          <Path
            d="M30 40 H70 L64 98 Q50 104 36 98 Z"
            fill="none"
            stroke={colors.text}
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          {/* handle */}
          <Path d="M70 52 q16 2 12 18 q-2 10 -14 8" fill="none" stroke={colors.text} strokeWidth={2.4} />
          {/* saucer */}
          <Ellipse cx={50} cy={110} rx={30} ry={5} fill="none" stroke={colors.text} strokeWidth={2.4} />
        </Svg>
      </View>

      {/* checklist */}
      <View style={{ flex: 1, paddingLeft: spacing.md }}>
        <Label dim style={{ marginBottom: spacing.sm }}>
          today · {completed}/{total}
        </Label>
        {DAILY_TASKS.map((task) => {
          const isDone = done[task.id] === todayKey();
          return (
            <Pressable
              key={task.id}
              onPress={() => toggle(task.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 4,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Mono color={isDone ? colors.sage : colors.muted} style={{ width: 20 }}>
                {isDone ? '✓' : '○'}
              </Mono>
              <Mono
                dim={!isDone}
                style={{
                  flex: 1,
                  textDecorationLine: isDone ? 'line-through' : 'none',
                }}
              >
                {task.label}
              </Mono>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Local copy to avoid importing date helper into the render loop hot path.
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
