import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useTheme } from '@/lib/ThemeContext';

/** Sun (light) / crescent moon (dark) toggle. */
export function ModeToggle() {
  const { mode, colors, toggle } = useTheme();
  return (
    <Pressable
      onPress={toggle}
      hitSlop={12}
      accessibilityRole="switch"
      accessibilityLabel={mode === 'dark' ? 'switch to light mode' : 'switch to dark mode'}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <Svg width={22} height={22} viewBox="0 0 24 24">
        {mode === 'dark' ? (
          <Path
            d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z"
            fill={colors.amber}
          />
        ) : (
          <>
            <Circle cx={12} cy={12} r={4.4} fill={colors.amber} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const r = (deg * Math.PI) / 180;
              const x1 = 12 + Math.cos(r) * 7.5;
              const y1 = 12 + Math.sin(r) * 7.5;
              const x2 = 12 + Math.cos(r) * 9.6;
              const y2 = 12 + Math.sin(r) * 9.6;
              return (
                <Line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={colors.amber}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
              );
            })}
          </>
        )}
      </Svg>
    </Pressable>
  );
}
