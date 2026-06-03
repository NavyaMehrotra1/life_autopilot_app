import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { fonts } from '@/constants/theme';
import { useTheme } from '@/lib/ThemeContext';

type Props = {
  value: number;
  fontSize?: number;
  color?: string;
  letterSpacing?: number;
};

/**
 * Odometer / slot-machine number. Each digit lives in a clipped column and
 * springs vertically to its target when the value changes — so the score
 * visibly rolls up as you complete things. Monospaced, so columns stay aligned.
 */
function DigitColumn({
  digit,
  cellH,
  fontSize,
  color,
  letterSpacing,
}: {
  digit: number;
  cellH: number;
  fontSize: number;
  color: string;
  letterSpacing: number;
}) {
  const y = useSharedValue(-digit * cellH);

  useEffect(() => {
    y.value = withSpring(-digit * cellH, {
      damping: 14,
      stiffness: 150,
      mass: 0.6,
    });
  }, [digit, cellH, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <View style={{ height: cellH, overflow: 'hidden' }}>
      <Animated.View style={style}>
        {Array.from({ length: 10 }).map((_, n) => (
          <Text
            key={n}
            style={{
              fontFamily: fonts.monoMedium,
              fontSize,
              lineHeight: cellH,
              color,
              letterSpacing,
              textAlign: 'center',
            }}
          >
            {n}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

export function RollingNumber({
  value,
  fontSize = 14,
  color,
  letterSpacing = 0,
}: Props) {
  const { colors } = useTheme();
  const c = color ?? colors.text;
  const cellH = Math.round(fontSize * 1.2);
  const digits = String(Math.max(0, Math.round(value))).split('');

  return (
    <View style={{ flexDirection: 'row' }}>
      {digits.map((d, i) => (
        <DigitColumn
          key={`${digits.length}-${i}`}
          digit={Number(d)}
          cellH={cellH}
          fontSize={fontSize}
          color={c}
          letterSpacing={letterSpacing}
        />
      ))}
    </View>
  );
}
