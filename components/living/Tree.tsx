import React from 'react';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { TreeState } from '@/lib/scoring';

type Props = { state: TreeState; size?: number };

type Blob = { cx: number; cy: number; r: number };

const CANOPY: Blob[] = [
  { cx: 60, cy: 42, r: 24 },
  { cx: 44, cy: 56, r: 18 },
  { cx: 78, cy: 56, r: 18 },
  { cx: 52, cy: 70, r: 15 },
  { cx: 72, cy: 70, r: 15 },
];

/**
 * An illustrated tree whose fullness + color track the life-health score.
 *   needs water → bare brown branches
 *   growing     → sparse yellow-green buds
 *   healthy     → full green canopy
 *   thriving    → lush bright canopy with light spots
 */
export function Tree({ state, size = 120 }: Props) {
  const h = size * (160 / 120);

  const trunkColor = state === 'needs water' ? '#8A6A48' : '#6E4F36';

  const leaf =
    state === 'growing'
      ? '#A9BE6B'
      : state === 'healthy'
        ? '#7A9A6A'
        : '#8FC46A'; // thriving

  const showCanopy = state !== 'needs water';
  const blobs =
    state === 'growing' ? CANOPY.slice(0, 3) : CANOPY;
  const shrink = state === 'growing' ? 0.55 : 1;

  return (
    <Svg width={size} height={h} viewBox="0 0 120 160">
      {/* ground line */}
      <Line x1={24} y1={150} x2={96} y2={150} stroke="#C9B79A" strokeWidth={2} strokeLinecap="round" opacity={0.6} />

      {/* trunk + main branches */}
      <Path
        d="M60 150 C 58 120 58 104 60 92"
        stroke={trunkColor}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M60 108 C 52 100 48 92 44 84" stroke={trunkColor} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M60 102 C 68 96 74 90 80 82" stroke={trunkColor} strokeWidth={5} strokeLinecap="round" fill="none" />

      {/* bare twigs only when parched */}
      {!showCanopy && (
        <G stroke={trunkColor} strokeWidth={2.4} strokeLinecap="round">
          <Line x1={44} y1={84} x2={36} y2={70} />
          <Line x1={44} y1={84} x2={50} y2={66} />
          <Line x1={80} y1={82} x2={88} y2={68} />
          <Line x1={80} y1={82} x2={74} y2={64} />
          <Line x1={60} y1={92} x2={60} y2={68} />
        </G>
      )}

      {/* canopy */}
      {showCanopy &&
        blobs.map((b, i) => (
          <Circle key={i} cx={b.cx} cy={b.cy} r={b.r * shrink} fill={leaf} />
        ))}

      {/* light spots when thriving */}
      {state === 'thriving' && (
        <G fill="#D8F0B0" opacity={0.85}>
          <Circle cx={54} cy={40} r={3.4} />
          <Circle cx={72} cy={52} r={3} />
          <Circle cx={62} cy={62} r={2.6} />
          <Circle cx={46} cy={56} r={2.4} />
        </G>
      )}
    </Svg>
  );
}
