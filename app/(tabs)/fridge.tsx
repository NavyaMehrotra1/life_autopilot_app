import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Pill } from '@/components/ui/Pill';
import { Title, Label, LabelSm, Mono } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/lib/ThemeContext';

import { InventoryItem } from '@/components/fridge/InventoryItem';
import {
  FridgeCategory,
  StorageMethod,
  itemDaysRemaining,
  selectActive,
  selectExpiringSoon,
  useFridgeStore,
} from '@/stores/fridgeStore';
import { useUserStore } from '@/stores/userStore';
import { useDailyStore } from '@/stores/dailyStore';
import { LOADING_COPY, Recipe, predictExpiry, suggestRecipes } from '@/lib/claude';

const CATEGORIES: FridgeCategory[] = ['produce', 'dairy', 'protein', 'grains', 'condiments', 'leftovers', 'other'];
const STORAGES: StorageMethod[] = ['fridge', 'pantry', 'freezer'];

function AddItemForm() {
  const { colors } = useTheme();
  const addItem = useFridgeStore((s) => s.addItem);
  const setPrediction = useFridgeStore((s) => s.setPrediction);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState<FridgeCategory>('produce');
  const [storage, setStorage] = useState<StorageMethod>('fridge');
  const [opened, setOpened] = useState(false);
  const [predicting, setPredicting] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    const purchaseDate = new Date().toISOString();
    const id = addItem({
      name: name.trim(),
      quantity: quantity.trim() || '1',
      category,
      storage,
      opened,
      purchaseDate,
      shelfLifeDays: 7, // provisional; refined by Claude below
    });
    // refine expiry with Claude (falls back to heuristic offline)
    setPredicting(true);
    const p = await predictExpiry({ name: name.trim(), storage, opened, purchaseDate });
    setPrediction(id, p);
    setPredicting(false);
    setName('');
    setQuantity('1');
    setOpened(false);
    setOpen(false);
  };

  if (!open) {
    return <Button label="+ add something" variant="ghost" onPress={() => setOpen(true)} />;
  }

  return (
    <Card>
      <Title style={{ marginBottom: spacing.md }}>add to the fridge</Title>
      <View style={{ gap: spacing.md }}>
        <Field label="what is it?" value={name} onChangeText={setName} placeholder="e.g. baby spinach" autoFocus autoCapitalize="none" />
        <Field label="how much?" value={quantity} onChangeText={setQuantity} placeholder="1 bag" />

        <View>
          <Label dim style={{ marginBottom: spacing.sm }}>category</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {CATEGORIES.map((c) => (
              <Pill key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </View>
        </View>

        <View>
          <Label dim style={{ marginBottom: spacing.sm }}>where does it live?</Label>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {STORAGES.map((s) => (
              <Pill key={s} label={s} selected={storage === s} onPress={() => setStorage(s)} />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pill label="sealed" selected={!opened} onPress={() => setOpened(false)} />
          <Pill label="opened" selected={opened} onPress={() => setOpened(true)} />
        </View>

        {predicting && (
          <Mono color={colors.amber}>{LOADING_COPY.expiry}</Mono>
        )}

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button label="cancel" variant="ghost" onPress={() => setOpen(false)} style={{ flex: 0.6 }} />
          <Button label="add" tone="sage" onPress={submit} disabled={!name.trim() || predicting} loading={predicting} style={{ flex: 1 }} />
        </View>
      </View>
    </Card>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Mono style={{ flex: 1 }}>{recipe.name.toLowerCase()}</Mono>
        <LabelSm dim>{recipe.time_mins} min</LabelSm>
      </View>
      <LabelSm color={colors.sage} style={{ marginTop: 4 }}>
        uses: {recipe.ingredients_used.join(', ')}
      </LabelSm>
      <Mono dim style={{ marginTop: 6, fontSize: 12 }}>{recipe.instructions}</Mono>
    </View>
  );
}

export default function FridgeScreen() {
  const { colors } = useTheme();
  const items = useFridgeStore((s) => s.items);
  const markConsumed = useFridgeStore((s) => s.markConsumed);
  const removeItem = useFridgeStore((s) => s.removeItem);
  const markChecked = useFridgeStore((s) => s.markChecked);
  const diet = useUserStore((s) => s.diet);
  const completeDaily = useDailyStore((s) => s.complete);

  const active = selectActive({ items } as any).sort((a, b) => itemDaysRemaining(a) - itemDaysRemaining(b));
  const expiring = selectExpiringSoon({ items } as any);

  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  // Visiting the fridge counts as checking it.
  useEffect(() => {
    markChecked();
    completeDaily('fridge_checked');
  }, [markChecked, completeDaily]);

  const whatCanIMake = async () => {
    setLoadingRecipes(true);
    setRecipes(null);
    const inventory = active.map((it) => ({ name: it.name, daysLeft: itemDaysRemaining(it) }));
    const result = await suggestRecipes(inventory, diet);
    setRecipes(result);
    setLoadingRecipes(false);
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title style={{ fontSize: 26 }}>the fridge</Title>
        <LabelSm color={expiring.length ? colors.amber : colors.muted}>
          {active.length ? `${active.length} items · ${expiring.length} soon` : 'empty'}
        </LabelSm>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Button label="what can i make?" tone="amber" onPress={whatCanIMake} loading={loadingRecipes} disabled={loadingRecipes || active.length === 0} />
        {active.length === 0 && (
          <Mono dim style={{ marginTop: spacing.sm, fontSize: 12 }}>add a few things first and i'll find you something.</Mono>
        )}
      </View>

      {loadingRecipes && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
          <ActivityIndicator color={colors.amber} />
          <Mono color={colors.amber}>{LOADING_COPY.recipes}</Mono>
        </View>
      )}

      {recipes && (
        <Card style={{ marginTop: spacing.md }}>
          <Label dim style={{ marginBottom: spacing.xs }}>3 quick ideas, expiring-first</Label>
          {recipes.map((r, i) => (
            <RecipeCard key={i} recipe={r} />
          ))}
        </Card>
      )}

      <View style={{ marginTop: spacing.xl }}>
        <AddItemForm />
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label dim style={{ marginBottom: spacing.sm }}>in the fridge</Label>
        {active.length === 0 ? (
          <Mono dim>your fridge is a mystery right now. let's fix that.</Mono>
        ) : (
          <Card>
            {active.map((item) => (
              <InventoryItem key={item.id} item={item} onConsume={markConsumed} onRemove={removeItem} />
            ))}
          </Card>
        )}
      </View>
    </Screen>
  );
}
