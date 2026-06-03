import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const CONFETTI_COLORS = ['#C8922A', '#7A9A6A', '#B0654A', '#3C4A63', '#8C3B3B'];
const LEAF_COLORS = ['#83A870', '#94B885', '#7A9A6A', '#A9BE6B', '#C8922A'];

type Variant = 'confetti' | 'leaves';

/** Deterministic pseudo-random in [0,1) from an integer seed. */
function rand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Leaf({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2 C 4 6 4 16 12 22 C 20 16 20 6 12 2 Z M12 4 L12 20"
        fill={color}
        stroke={color}
        strokeWidth={0.5}
      />
    </Svg>
  );
}

function Piece({ index, variant }: { index: number; variant: Variant }) {
  const leaves = variant === 'leaves';
  const t = useSharedValue(0);

  // Per-piece physics, stable across renders.
  const angle = (index / 18) * Math.PI * 2 + rand(index) * 0.8;
  const speed = 60 + rand(index + 1) * (leaves ? 50 : 90);
  const vx = Math.cos(angle) * speed;
  const launchUp = leaves ? -20 : -70; // leaves drift, confetti pops up first
  const gravity = leaves ? 150 : 230;
  const swayAmp = leaves ? 26 + rand(index + 2) * 22 : 8;
  const swayFreq = 2 + rand(index + 3) * 2.5;
  const spin = (rand(index + 4) - 0.5) * (leaves ? 3 : 6);
  const size = leaves ? 12 + Math.round(rand(index + 5) * 8) : index % 2 ? 8 : 6;
  const color = (leaves ? LEAF_COLORS : CONFETTI_COLORS)[
    index % (leaves ? LEAF_COLORS.length : CONFETTI_COLORS.length)
  ];

  useEffect(() => {
    t.value = withTiming(1, {
      duration: leaves ? 1700 : 1000,
      easing: leaves ? Easing.inOut(Easing.quad) : Easing.out(Easing.cubic),
    });
  }, [t, leaves]);

  const style = useAnimatedStyle(() => {
    const p = t.value;
    const x = vx * p + swayAmp * Math.sin(p * Math.PI * swayFreq);
    const y = launchUp * p + gravity * p * p;
    return {
      opacity: p > 0.7 ? (1 - p) / 0.3 : 1,
      transform: [
        { translateX: x },
        { translateY: y },
        { rotate: `${spin * 360 * p}deg` },
        { scale: leaves ? 1 : 0.6 + 0.4 * (1 - p) },
      ],
    };
  });

  if (leaves) {
    return (
      <Animated.View style={[{ position: 'absolute' }, style]}>
        <Leaf color={color} size={size} />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: index % 2 ? size / 2 : 1,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

type Props = {
  /** `confetti` (default) or themed `leaves`. */
  variant?: Variant;
  /** Number of particles. */
  pieces?: number;
};

/** A one-shot celebratory burst. Mount it to fire; unmount when done. */
export function Confetti({ variant = 'confetti', pieces }: Props = {}) {
  const count = pieces ?? (variant === 'leaves' ? 14 : 18);
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Piece key={i} index={i} variant={variant} />
      ))}
    </View>
  );
}
