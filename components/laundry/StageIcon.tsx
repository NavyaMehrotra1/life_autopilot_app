import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { LaundryStage } from '@/stores/laundryStore';

type Props = { stage: Exclude<LaundryStage, 'idle'>; color: string; size?: number };

/** Distinct line icons: wash tub, drying wind, folded stack. */
export function StageIcon({ stage, color, size = 26 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {stage === 'wash' && (
        <G stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Rect x={6} y={7} width={20} height={19} rx={4} />
          <Path d="M6 13 H26" />
          <Circle cx={11} cy={10} r={0.9} fill={color} stroke="none" />
          <Circle cx={15} cy={10} r={0.9} fill={color} stroke="none" />
          <Path d="M10 19 q3 -3 6 0 q3 3 6 0" />
        </G>
      )}
      {stage === 'dry' && (
        <G stroke={color} strokeWidth={2} strokeLinecap="round" fill="none">
          <Path d="M5 12 H20 a3 3 0 1 0 -3 -3" />
          <Path d="M5 17 H24 a3 3 0 1 1 -3 3" />
          <Path d="M5 22 H17 a2.5 2.5 0 1 0 -2.5 -2.5" />
        </G>
      )}
      {stage === 'fold' && (
        <G stroke={color} strokeWidth={2} strokeLinejoin="round" fill="none">
          <Rect x={7} y={8} width={18} height={4.5} rx={1.5} />
          <Rect x={7} y={14} width={18} height={4.5} rx={1.5} />
          <Rect x={7} y={20} width={18} height={4.5} rx={1.5} />
        </G>
      )}
    </Svg>
  );
}
