import React from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

export type TabName = 'index' | 'fridge' | 'meals' | 'fitness' | 'profile';

export function TabIcon({ name, color, size = 24 }: { name: TabName; color: string; size?: number }) {
  const sw = 1.9;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {name === 'index' && (
          <>
            <Path d="M4 11 L12 4 L20 11" />
            <Path d="M6 10 V19 H18 V10" />
          </>
        )}
        {name === 'fridge' && (
          <>
            <Rect x={6} y={3} width={12} height={18} rx={2.5} />
            <Line x1={6} y1={10} x2={18} y2={10} />
            <Line x1={9} y1={6.5} x2={9} y2={8} />
            <Line x1={9} y1={12.5} x2={9} y2={14.5} />
          </>
        )}
        {name === 'meals' && (
          <>
            <Path d="M4 11 a8 8 0 0 0 16 0 Z" />
            <Line x1={4} y1={11} x2={20} y2={11} />
            <Path d="M12 11 V4" />
            <Path d="M9 4 V8 M15 4 V8" />
          </>
        )}
        {name === 'fitness' && (
          <>
            <Line x1={4} y1={9} x2={4} y2={15} />
            <Line x1={20} y1={9} x2={20} y2={15} />
            <Line x1={7} y1={7.5} x2={7} y2={16.5} />
            <Line x1={17} y1={7.5} x2={17} y2={16.5} />
            <Line x1={7} y1={12} x2={17} y2={12} />
          </>
        )}
        {name === 'profile' && (
          <>
            <Circle cx={12} cy={8} r={3.6} />
            <Path d="M5 20 a7 7 0 0 1 14 0" />
          </>
        )}
      </G>
    </Svg>
  );
}
