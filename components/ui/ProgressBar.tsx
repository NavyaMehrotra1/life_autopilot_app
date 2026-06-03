import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';

type Props = {
  /** 0..1 */
  value: number;
  color?: string;
  height?: number;
  track?: string;
};

/** A thin, calm progress/freshness bar. */
export function ProgressBar({ value, color, height = 6, track }: Props) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      style={{
        height,
        borderRadius: height,
        backgroundColor: track ?? colors.well,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: height,
          backgroundColor: color ?? colors.sage,
        }}
      />
    </View>
  );
}
