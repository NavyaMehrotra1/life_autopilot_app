import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Tree } from '@/components/living/Tree';
import { Buddy } from '@/components/living/Buddy';
import { Label, Mono } from '@/components/ui/Type';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { useBuddyFlags, useLifeScore } from '@/lib/scoring';

/** Tree + Buddy, sharing the one life-health score. */
export function LivingRow() {
  const { colors } = useTheme();
  const { score, state, weakest } = useLifeScore();
  const flags = useBuddyFlags();
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={{ marginVertical: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
        {/* Tree — tap to learn what's dragging the score down. */}
        <Pressable
          onPress={() => setRevealed((r) => !r)}
          style={{ alignItems: 'center', flex: 1 }}
          accessibilityLabel="your tree — tap to see what needs attention"
        >
          <Tree state={state} size={108} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Label dim>{state} · </Label>
            <RollingNumber value={score} fontSize={12} letterSpacing={1.4} color={colors.muted} />
          </View>
        </Pressable>

        {/* Buddy — tap to pet. */}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Buddy score={score} size={112} flags={flags} />
        </View>
      </View>

      {revealed && (
        <View
          style={{
            marginTop: spacing.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: 10,
            backgroundColor: colors.well,
          }}
        >
          <Mono dim>
            {weakest
              ? `your tree is ${state}. ${weakest.nudge}.`
              : `your tree is ${state}. everything's in good shape.`}
          </Mono>
        </View>
      )}
    </View>
  );
}
