import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const COLORS = ['#C8922A', '#7A9A6A', '#B0654A', '#3C4A63', '#8C3B3B'];
const PIECES = 18;

function Piece({ index }: { index: number }) {
  const t = useSharedValue(0);
  const angle = (index / PIECES) * Math.PI * 2;
  const dist = 70 + (index % 5) * 22;
  const dx = Math.cos(angle) * dist;
  const dy = Math.sin(angle) * dist - 30;

  useEffect(() => {
    t.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [t]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [
      { translateX: dx * t.value },
      { translateY: dy * t.value + 60 * t.value * t.value },
      { rotate: `${t.value * 360}deg` },
      { scale: 0.6 + 0.4 * (1 - t.value) },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: index % 2 ? 4 : 1,
          backgroundColor: COLORS[index % COLORS.length],
        },
        style,
      ]}
    />
  );
}

/** A one-shot celebratory burst. Mount it to fire; unmount when done. */
export function Confetti() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
      {Array.from({ length: PIECES }).map((_, i) => (
        <Piece key={i} index={i} />
      ))}
    </View>
  );
}
