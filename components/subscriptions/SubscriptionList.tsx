import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Title, Label, LabelSm, Mono, Numeral } from '@/components/ui/Type';
import {
  Subscription,
  annualTotal,
  isUnused,
  monthlyTotal,
  useSubscriptionStore,
} from '@/stores/subscriptionStore';
import { daysSince } from '@/lib/date';

const money = (n: number) => `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`;

function Row({ sub }: { sub: Subscription }) {
  const { colors } = useTheme();
  const markUsed = useSubscriptionStore((s) => s.markUsed);
  const removeSub = useSubscriptionStore((s) => s.removeSub);
  const unused = isUnused(sub);

  return (
    <View style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Mono style={{ flex: 1 }}>{sub.name}</Mono>
        <Mono dim>{money(sub.cost)}/{sub.cycle === 'monthly' ? 'mo' : sub.cycle === 'yearly' ? 'yr' : 'wk'}</Mono>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <Mono color={unused ? colors.red : colors.muted} style={{ flex: 1, fontSize: 11 }}>
          {unused ? `unused ${daysSince(sub.lastUsed)} days` : `used ${daysSince(sub.lastUsed)}d ago`}
        </Mono>
        <Pressable onPress={() => markUsed(sub.id)} hitSlop={8} style={{ marginRight: spacing.lg }}>
          <LabelSm color={colors.sage}>used it</LabelSm>
        </Pressable>
        <Pressable onPress={() => removeSub(sub.id)} hitSlop={8}>
          <LabelSm dim>remove</LabelSm>
        </Pressable>
      </View>
    </View>
  );
}

export function SubscriptionList({ onAdd }: { onAdd?: () => void }) {
  const { colors } = useTheme();
  const subs = useSubscriptionStore((s) => s.subs);
  const annual = annualTotal(subs);
  const monthly = monthlyTotal(subs);
  const unusedCount = subs.filter(isUnused).length;

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title>subscriptions</Title>
        {onAdd && (
          <Pressable onPress={onAdd} hitSlop={8}>
            <LabelSm color={colors.amber}>+ add</LabelSm>
          </Pressable>
        )}
      </View>

      {subs.length === 0 ? (
        <Mono dim style={{ marginTop: spacing.sm }}>
          nothing tracked yet. add the ones quietly draining your account.
        </Mono>
      ) : (
        <>
          <View style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
            <Numeral>{money(Math.round(annual))}</Numeral>
            <Label dim style={{ marginTop: 2 }}>a year · {money(Math.round(monthly))}/mo</Label>
            {unusedCount > 0 && (
              <LabelSm color={colors.red} style={{ marginTop: 6 }}>
                {unusedCount} unused this month
              </LabelSm>
            )}
          </View>
          {subs.map((s) => (
            <Row key={s.id} sub={s} />
          ))}
        </>
      )}
    </View>
  );
}
