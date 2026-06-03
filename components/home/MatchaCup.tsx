import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { lerpColor } from '@/lib/color';
import { Label, Mono } from '@/components/ui/Type';
import {
  DAILY_TASKS,
  dailyCompletedCount,
  useDailyStore,
} from '@/stores/dailyStore';

const EMPTY = '#C8D8A8';
const FULL = '#4A7A3A';

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

export function MatchaCup() {
  const { colors } = useTheme();
  const done = useDailyStore((s) => s.done);
  const toggle = useDailyStore((s) => s.toggle);

  const completed = dailyCompletedCount(done);
  const total = DAILY_TASKS.length;
  const ratio = completed / total;
  const full = completed === total;

  const fillColor = lerpColor(EMPTY, FULL, ratio);
  // Inner cup vertical span for the liquid (viewBox coords).
  const top = 44;
  const bottom = 96;
  const fillTop = bottom - ratio * (bottom - top);

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
        <Svg width={104} height={124} viewBox="0 0 100 120">
          <Defs>
            <ClipPath id="cupInner">
              <Path d="M33 44 H67 L62 96 Q50 100 38 96 Z" />
            </ClipPath>
          </Defs>

          {/* liquid */}
          {ratio > 0 && (
            <G clipPath="url(#cupInner)">
              <Rect x={30} y={fillTop} width={40} height={bottom - fillTop + 4} fill={fillColor} />
              {/* surface foam line */}
              <Ellipse cx={50} cy={fillTop} rx={17} ry={2.4} fill={lerpColor(fillColor, '#FFFFFF', 0.35)} />
            </G>
          )}

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
