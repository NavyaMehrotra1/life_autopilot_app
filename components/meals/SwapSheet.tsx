import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { radius, spacing } from '@/constants/theme';
import { Title, Label, LabelSm, Mono } from '@/components/ui/Type';
import { HOPKINS_HALLS } from '@/lib/nutrislice';
import { Meal, MealSource } from '@/stores/mealsStore';

export type SwapOption = {
  name: string;
  location: string;
  distance?: string;
  source: MealSource;
  protein?: boolean;
};

function buildOptions(diningEnabled: boolean, fridgeFirst?: string): SwapOption[] {
  const opts: SwapOption[] = [];
  if (diningEnabled) {
    HOPKINS_HALLS.slice(0, 2).forEach((h) => {
      opts.push({ name: 'chef\'s pick', location: h.name, distance: h.distance, source: 'dining', protein: true });
    });
  }
  opts.push({ name: 'burrito bowl', location: 'Chipotle', distance: '8 min', source: 'restaurant', protein: true });
  opts.push({ name: 'harvest bowl', location: 'Sweetgreen', distance: '10 min', source: 'restaurant', protein: true });
  opts.push({
    name: fridgeFirst ? `cook with ${fridgeFirst}` : 'cook something simple',
    location: 'home',
    source: 'home',
    protein: true,
  });
  return opts;
}

type Props = {
  visible: boolean;
  meal?: Meal;
  diningEnabled: boolean;
  fridgeFirst?: string;
  onClose: () => void;
  onSelect: (opt: SwapOption) => void;
};

/** Bottom sheet of alternatives for a tapped meal slot. */
export function SwapSheet({ visible, meal, diningEnabled, fridgeFirst, onClose, onSelect }: Props) {
  const { colors } = useTheme();
  const options = buildOptions(diningEnabled, fridgeFirst);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            padding: spacing.xl,
            paddingBottom: spacing.xxxl,
          }}
        >
          <Title>swap this meal</Title>
          {meal ? <Label dim style={{ marginTop: 4 }}>{meal.slot} · currently {meal.name.toLowerCase()}</Label> : null}

          <View style={{ marginTop: spacing.lg }}>
            {options.map((opt, i) => (
              <Pressable
                key={i}
                onPress={() => onSelect(opt)}
                style={({ pressed }) => ({
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Mono style={{ flex: 1 }}>{opt.name.toLowerCase()}</Mono>
                  <LabelSm dim>{opt.source}</LabelSm>
                </View>
                <Mono dim style={{ fontSize: 11, marginTop: 2 }}>
                  {opt.location.toLowerCase()}{opt.distance ? ` · ${opt.distance}` : ''}
                </Mono>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
