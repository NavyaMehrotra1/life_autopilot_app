import React, { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Pill } from '@/components/ui/Pill';
import { Title, Label, LabelSm, Mono } from '@/components/ui/Type';
import {
  DepletionRate,
  SupplyCategory,
  isLow,
  selectRestockList,
  supplyDaysLeft,
  useSuppliesStore,
} from '@/stores/suppliesStore';
import { useDailyStore } from '@/stores/dailyStore';

const CATEGORIES: SupplyCategory[] = ['bathroom', 'household', 'health'];
const RATES: DepletionRate[] = ['daily', 'weekly', 'monthly'];

function AddForm({ onDone }: { onDone: () => void }) {
  const addItem = useSuppliesStore((s) => s.addItem);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplyCategory>('bathroom');
  const [quantity, setQuantity] = useState('1');
  const [rate, setRate] = useState<DepletionRate>('monthly');

  const submit = () => {
    if (!name.trim()) return;
    addItem({
      name: name.trim(),
      category,
      quantity: parseInt(quantity || '1', 10) || 1,
      depletionRate: rate,
    });
    onDone();
  };

  return (
    <Card>
      <Title style={{ marginBottom: spacing.md }}>track a supply</Title>
      <View style={{ gap: spacing.md }}>
        <Field label="item" value={name} onChangeText={setName} placeholder="e.g. shampoo" autoCapitalize="none" autoFocus />
        <View>
          <Label dim style={{ marginBottom: spacing.sm }}>category</Label>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {CATEGORIES.map((c) => (
              <Pill key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>
        <Field label="quantity on hand" value={quantity} onChangeText={(t) => setQuantity(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
        <View>
          <Label dim style={{ marginBottom: spacing.sm }}>used up</Label>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {RATES.map((r) => (
              <Pill key={r} label={r} selected={rate === r} onPress={() => setRate(r)} />
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button label="cancel" variant="ghost" onPress={onDone} style={{ flex: 0.6 }} />
          <Button label="add" tone="sage" onPress={submit} disabled={!name.trim()} style={{ flex: 1 }} />
        </View>
      </View>
    </Card>
  );
}

export function SuppliesManager() {
  const { colors } = useTheme();
  const itemsState = useSuppliesStore();
  const items = useSuppliesStore((s) => s.items);
  const restock = useSuppliesStore((s) => s.restock);
  const removeItem = useSuppliesStore((s) => s.removeItem);
  const syncRestockList = useSuppliesStore((s) => s.syncRestockList);
  const completeDaily = useDailyStore((s) => s.complete);

  const [adding, setAdding] = useState(false);

  // Pull low items onto the Amazon list, and count this as a supplies check.
  useEffect(() => {
    syncRestockList();
    completeDaily('supplies_checked');
  }, [syncRestockList, completeDaily]);

  const restockList = selectRestockList(itemsState);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title>supplies</Title>
        <Pressable onPress={() => setAdding((a) => !a)} hitSlop={8}>
          <LabelSm color={colors.amber}>{adding ? 'close' : '+ add'}</LabelSm>
        </Pressable>
      </View>

      {adding && (
        <View style={{ marginTop: spacing.md }}>
          <AddForm onDone={() => setAdding(false)} />
        </View>
      )}

      {items.length === 0 ? (
        <Mono dim style={{ marginTop: spacing.md }}>your shelves are uncharted. add what runs out.</Mono>
      ) : (
        <Card style={{ marginTop: spacing.md }}>
          {items.map((it) => {
            const d = supplyDaysLeft(it);
            const low = isLow(it);
            return (
              <View key={it.id} style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Mono style={{ flex: 1 }}>{it.name.toLowerCase()}</Mono>
                  <Mono color={low ? colors.red : colors.muted} style={{ fontSize: 11 }}>
                    ~{Math.max(0, d)}d left
                  </Mono>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <LabelSm dim style={{ flex: 1 }}>{it.category} · {it.depletionRate}</LabelSm>
                  <Pressable onPress={() => restock(it.id)} hitSlop={8} style={{ marginRight: spacing.lg }}>
                    <LabelSm color={colors.sage}>restocked</LabelSm>
                  </Pressable>
                  <Pressable onPress={() => removeItem(it.id)} hitSlop={8}>
                    <LabelSm dim>remove</LabelSm>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      {restockList.length > 0 && (
        <Card style={{ marginTop: spacing.md }}>
          <Label color={colors.amber} style={{ marginBottom: spacing.sm }}>weekly amazon order</Label>
          {restockList.map((it) => (
            <Mono key={it.id} dim style={{ paddingVertical: 3 }}>→ {it.name.toLowerCase()}</Mono>
          ))}
          <LabelSm dim style={{ marginTop: spacing.sm }}>suggested when they're running low. you approve before ordering.</LabelSm>
        </Card>
      )}
    </View>
  );
}
