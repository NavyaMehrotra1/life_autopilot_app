/** Themed text primitives. Color comes from the active theme by default. */
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { type } from '@/constants/typography';

type Variant = keyof typeof type;

type Props = TextProps & {
  /** Override color explicitly. */
  color?: string;
  /** Use the muted/secondary text color. */
  dim?: boolean;
  /** Use an accent color token. */
  accent?: 'amber' | 'sage' | 'red';
  style?: TextStyle | TextStyle[];
};

function make(variant: Variant) {
  return function Themed({ color, dim, accent, style, ...rest }: Props) {
    const { colors } = useTheme();
    const resolved =
      color ??
      (accent ? colors[accent] : dim ? colors.muted : colors.text);
    return <Text {...rest} style={[type[variant], { color: resolved }, style]} />;
  };
}

export const Greeting = make('greeting');
export const GreetingSub = make('greetingSub');
export const Title = make('title');
export const TitleSm = make('titleSm');
export const Brand = make('brand');
export const Label = make('label');
export const LabelSm = make('labelSm');
export const Meta = make('meta');
export const Mono = make('body');
export const MonoLg = make('bodyLg');
export const Numeral = make('numeral');
