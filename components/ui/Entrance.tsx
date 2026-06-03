import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = {
  children: React.ReactNode;
  /** Position in the list — drives the stagger delay. */
  index?: number;
  /** Per-item stagger in ms. */
  step?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Wraps a block so it fades + lifts into place on mount. Stagger several with
 * increasing `index` to make a screen choreograph itself in. Calm by design:
 * short travel, soft spring — motion you feel more than notice.
 */
export function Entrance({ children, index = 0, step = 70, style }: Props) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * step)
        .duration(420)
        .springify()
        .damping(18)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
