import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Label } from '@/components/ui/Type';

export type BuddyMood = 'thriving' | 'happy' | 'tired' | 'neglected';

export function moodFromScore(score: number): BuddyMood {
  if (score > 75) return 'thriving';
  if (score > 50) return 'happy';
  if (score > 25) return 'tired';
  return 'neglected';
}

const MOOD_TEXT: Record<BuddyMood, string> = {
  thriving: 'thriving!',
  happy: 'happy',
  tired: 'a little tired',
  neglected: 'feeling neglected',
};

type Props = {
  score: number;
  size?: number;
  flags?: { dirtyClothes?: boolean; emptyBowl?: boolean; disheveled?: boolean };
};

export function Buddy({ score, size = 120, flags }: Props) {
  const mood = moodFromScore(score);
  const [petting, setPetting] = useState(false);
  const petTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Gentle bounce only when thriving; everyone else rests.
  const t = useSharedValue(0);
  useEffect(() => {
    if (mood === 'thriving') {
      t.value = withRepeat(withTiming(1, { duration: 850, easing: Easing.inOut(Easing.sin) }), -1, true);
    } else {
      cancelAnimation(t);
      t.value = withTiming(0, { duration: 300 });
    }
    return () => cancelAnimation(t);
  }, [mood, t]);

  useEffect(() => () => {
    if (petTimer.current) clearTimeout(petTimer.current);
  }, []);

  const bounce = useAnimatedStyle(() => ({ transform: [{ translateY: -7 * t.value }] }));

  const onPet = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
    setPetting(true);
    if (petTimer.current) clearTimeout(petTimer.current);
    petTimer.current = setTimeout(() => setPetting(false), 2000);
  };

  // Visuals
  const neglected = mood === 'neglected';
  const bodyFill = neglected ? '#C8C2B6' : '#F4EEDD';
  const accent = neglected ? '#AEA89C' : '#E29B9B';
  const stroke = neglected ? '#6F6A60' : '#5B4A38';
  const eye = neglected ? '#6F6A60' : '#3A2E22';

  const earDroop = neglected || flags?.disheveled;
  const leftEar = earDroop ? -42 : -12;
  const rightEar = earDroop ? 42 : 12;

  const bigSmile = petting || mood === 'thriving';
  const mouthPath = petting
    ? 'M50 90 Q60 104 70 90' // wide grin
    : mood === 'thriving'
      ? 'M52 90 Q60 101 68 90'
      : mood === 'happy'
        ? 'M54 91 Q60 98 66 91'
        : mood === 'tired'
          ? 'M56 94 H64' // small straight mouth
          : 'M54 95 Q60 89 66 95'; // frown

  const tiredEyes = mood === 'tired';
  const h = size * (140 / 120);

  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable onPress={onPet} accessibilityLabel="pet your buddy" hitSlop={8}>
        <Animated.View style={bounce}>
          <Svg width={size} height={h} viewBox="0 0 120 140">
            {/* ears */}
            <G>
              <Ellipse cx={46} cy={34} rx={8} ry={21} fill={bodyFill} stroke={stroke} strokeWidth={2}
                origin="46, 52" rotation={leftEar} />
              <Ellipse cx={74} cy={34} rx={8} ry={21} fill={bodyFill} stroke={stroke} strokeWidth={2}
                origin="74, 52" rotation={rightEar} />
              <Ellipse cx={46} cy={34} rx={3.4} ry={13} fill={accent} origin="46, 52" rotation={leftEar} />
              <Ellipse cx={74} cy={34} rx={3.4} ry={13} fill={accent} origin="74, 52" rotation={rightEar} />
            </G>

            {/* body / head blob */}
            <Ellipse cx={60} cy={82} rx={40} ry={36} fill={bodyFill} stroke={stroke} strokeWidth={2.4} />

            {/* cheeks */}
            <Circle cx={42} cy={88} r={5.5} fill={accent} opacity={0.55} />
            <Circle cx={78} cy={88} r={5.5} fill={accent} opacity={0.55} />

            {/* eyes */}
            {tiredEyes ? (
              <G stroke={eye} strokeWidth={2.6} strokeLinecap="round">
                <Path d="M44 78 Q50 81 56 78" fill="none" />
                <Path d="M64 78 Q70 81 76 78" fill="none" />
              </G>
            ) : (
              <>
                <Circle cx={50} cy={78} r={3.4} fill={eye} />
                <Circle cx={70} cy={78} r={3.4} fill={eye} />
                {mood === 'thriving' && (
                  <>
                    <Circle cx={51.4} cy={76.6} r={1.1} fill="#fff" />
                    <Circle cx={71.4} cy={76.6} r={1.1} fill="#fff" />
                  </>
                )}
              </>
            )}

            {/* sparkles when thriving */}
            {mood === 'thriving' && (
              <G fill="#F2C84B">
                <Path d="M30 60 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" />
                <Path d="M92 64 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z" />
              </G>
            )}

            {/* mouth */}
            <Path d={mouthPath} stroke={eye} strokeWidth={2.6} strokeLinecap="round" fill="none" />

            {/* accessory: tiny dirty clothes */}
            {flags?.dirtyClothes && (
              <G>
                <Rect x={42} y={92} width={36} height={22} rx={7} fill="#9AA0A6" opacity={0.92} />
                <Circle cx={52} cy={102} r={2.4} fill="#6F757B" />
                <Circle cx={66} cy={107} r={3} fill="#6F757B" />
                <Circle cx={70} cy={99} r={1.8} fill="#6F757B" />
              </G>
            )}

            {/* accessory: tiny empty bowl */}
            {flags?.emptyBowl && (
              <G>
                <Path d="M46 120 Q60 134 74 120 Z" fill="#CFC9BC" stroke={stroke} strokeWidth={1.6} />
                <Ellipse cx={60} cy={120} rx={14} ry={3} fill="#B9B2A2" />
              </G>
            )}
          </Svg>
        </Animated.View>
      </Pressable>
      <Label dim style={{ marginTop: 4 }}>
        {petting ? 'so happy!!' : MOOD_TEXT[mood]}
      </Label>
    </View>
  );
}
