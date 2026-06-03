import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTheme } from '@/lib/ThemeContext';
import { spacing } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Title, Label, LabelSm, Mono } from '@/components/ui/Type';
import { LOADING_COPY, generateGroceryList } from '@/lib/claude';
import { buildDraftCart, submitCartToInstacart } from '@/lib/cart';
import { openExternal } from '@/lib/openExternal';
import { useUserStore } from '@/stores/userStore';
import { useCartStore } from '@/stores/cartStore';
import { useMealsStore } from '@/stores/mealsStore';
import {
  FridgeCategory,
  NewFridgeItem,
  selectActive,
  useFridgeStore,
} from '@/stores/fridgeStore';

const SHELF_BY_CATEGORY: Record<string, { cat: FridgeCategory; days: number }> = {
  produce: { cat: 'produce', days: 6 },
  protein: { cat: 'protein', days: 3 },
  dairy: { cat: 'dairy', days: 7 },
  grains: { cat: 'grains', days: 180 },
  condiments: { cat: 'condiments', days: 120 },
  snacks: { cat: 'other', days: 60 },
  other: { cat: 'other', days: 14 },
};

export function GroceryCart() {
  const { colors } = useTheme();
  const { store, diet, cookingEffort, budgetPerWeek, zip, instacartRetailer } =
    useUserStore();
  const setInstacartRetailer = useUserStore((s) => s.setInstacartRetailer);

  const items = useFridgeStore((s) => s.items);
  const addMany = useFridgeStore((s) => s.addMany);
  const plan = useMealsStore((s) => s.plan);

  const phase = useCartStore((s) => s.phase);
  const cart = useCartStore((s) => s.cart);
  const removed = useCartStore((s) => s.removed);
  const unmatched = useCartStore((s) => s.unmatched);
  const instacartUrl = useCartStore((s) => s.instacartUrl);
  const errorMessage = useCartStore((s) => s.errorMessage);
  const setPhase = useCartStore((s) => s.setPhase);
  const setCart = useCartStore((s) => s.setCart);
  const removeLineInStore = useCartStore((s) => s.removeLine);
  const setSubmissionResult = useCartStore((s) => s.setSubmissionResult);
  const setError = useCartStore((s) => s.setError);
  const reset = useCartStore((s) => s.reset);

  const build = async () => {
    reset();
    setPhase('building');
    const fridge = selectActive({ items } as any).map((it) => it.name);
    const plannedMeals = plan.map((m) => m.name);
    const list = await generateGroceryList({
      preferences: diet,
      cookingEffort,
      budget: budgetPerWeek,
      fridge,
      store,
      plannedMeals,
    });
    const draft = buildDraftCart({ store, items: list, dietary: diet, budget: budgetPerWeek });
    setCart(draft);
    setPhase('review');
  };

  const submit = async () => {
    if (!cart) return;
    setPhase('submitting');
    try {
      const result = await submitCartToInstacart({
        cart,
        zip,
        preferredStore: store,
        cachedRetailer: instacartRetailer,
      });
      if (result.retailer && result.retailer.key !== instacartRetailer?.key) {
        setInstacartRetailer(result.retailer);
      }
      setSubmissionResult({ url: result.url, unmatched: result.unmatched });
      openExternal(result.url);

      const newItems: NewFridgeItem[] = cart.items.map((line) => {
        const m = SHELF_BY_CATEGORY[line.category] ?? SHELF_BY_CATEGORY.other;
        return {
          name: line.item,
          quantity: line.quantity,
          category: m.cat,
          storage: 'fridge',
          opened: false,
          purchaseDate: new Date().toISOString(),
          shelfLifeDays: m.days,
        };
      });
      addMany(newItems);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown';
      setError(msg);
    }
  };

  const reopen = () => {
    if (instacartUrl) openExternal(instacartUrl);
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title>this week's groceries</Title>
        <LabelSm dim>
          {(instacartRetailer?.name ?? store).toLowerCase()} · instacart
        </LabelSm>
      </View>

      {phase === 'idle' && (
        <>
          <Mono dim style={{ marginTop: spacing.sm }}>
            i'll build a wishlist around your planned meals plus 1–2 backpack-friendly snacks per day. you review, then approve to send it to instacart.
          </Mono>
          {plan.length === 0 && (
            <LabelSm dim style={{ marginTop: spacing.sm }}>
              tip: plan your week first so the cart matches what you're actually eating.
            </LabelSm>
          )}
          {!zip && (
            <LabelSm color={colors.amber} style={{ marginTop: spacing.sm }}>
              add your zip in profile so i can find your nearest {store}.
            </LabelSm>
          )}
          <Button label="build my wishlist →" tone="amber" onPress={build} style={{ marginTop: spacing.lg }} />
        </>
      )}

      {phase === 'building' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg }}>
          <ActivityIndicator color={colors.amber} />
          <Mono color={colors.amber}>{LOADING_COPY.grocery}</Mono>
        </View>
      )}

      {phase === 'submitting' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg }}>
          <ActivityIndicator color={colors.amber} />
          <Mono color={colors.amber}>
            building your cart at {(instacartRetailer?.name ?? store).toLowerCase()}…
          </Mono>
        </View>
      )}

      {phase === 'error' && (
        <>
          <Mono color={colors.red} style={{ marginTop: spacing.md }}>
            instacart hiccuped — your wishlist is still here, untouched.
          </Mono>
          {errorMessage && (
            <LabelSm dim style={{ marginTop: spacing.xs }}>
              {errorMessage}
            </LabelSm>
          )}
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
            <Button label="back to wishlist" variant="ghost" onPress={() => setPhase('review')} style={{ flex: 0.6 }} />
            <Button label="try again" tone="amber" onPress={submit} style={{ flex: 1 }} />
          </View>
        </>
      )}

      {(phase === 'review' || phase === 'placed') && cart && (
        <>
          {phase === 'placed' && (
            <>
              <Mono color={colors.sage} style={{ marginTop: spacing.md }}>
                lovely — instacart is open with your list staged at {(instacartRetailer?.name ?? store).toLowerCase()}. confirm the items there to land in your cart.
              </Mono>
              {unmatched.length > 0 && (
                <Mono color={colors.amber} style={{ marginTop: spacing.sm, fontSize: 13 }}>
                  couldn't add: {unmatched.join(', ').toLowerCase()}
                </Mono>
              )}
            </>
          )}

          <Label dim style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>
            {phase === 'placed'
              ? `your list · ${cart.items.length} items sent`
              : `here's your week · ${cart.items.length} picks`}
          </Label>

          {cart.items.map((line, i) => {
            const wasUnmatched = unmatched.includes(line.item);
            return (
              <View
                key={i}
                style={{
                  paddingVertical: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  opacity: phase === 'placed' && !wasUnmatched ? 0.85 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Mono>{line.product.toLowerCase()}</Mono>
                    {wasUnmatched && (
                      <LabelSm color={colors.amber} style={{ marginTop: 2 }}>
                        instacart couldn't find this
                      </LabelSm>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end', marginLeft: spacing.md }}>
                    <Mono dim>${line.price.toFixed(2)}</Mono>
                    <LabelSm dim style={{ marginTop: 2 }}>{line.quantity}</LabelSm>
                  </View>
                  {phase === 'review' && (
                    <Pressable
                      onPress={() => removeLineInStore(line.item)}
                      hitSlop={8}
                      style={{ marginLeft: spacing.md, paddingTop: 2 }}
                    >
                      <LabelSm color={colors.red}>remove</LabelSm>
                    </Pressable>
                  )}
                </View>
                {!!line.reason && (
                  <Mono dim style={{ fontSize: 11, marginTop: 4 }}>{line.reason}</Mono>
                )}
              </View>
            );
          })}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
            <Mono dim>subtotal (est.)</Mono>
            <Mono>${cart.subtotal.toFixed(2)}</Mono>
          </View>
          <LabelSm dim style={{ marginTop: 4 }}>
            est. delivery {cart.estimatedDeliveryMins} min · {cart.deliveryWindow}
          </LabelSm>

          {removed.length > 0 && (
            <LabelSm color={colors.sage} style={{ marginTop: spacing.sm }}>
              noted — skipping {removed.join(', ').toLowerCase()} next time.
            </LabelSm>
          )}

          {phase === 'review' ? (
            <>
              <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
                <Button label="redo" variant="ghost" onPress={build} style={{ flex: 0.6 }} />
                <Button label="approve · send to instacart" tone="sage" onPress={submit} style={{ flex: 1 }} />
              </View>
              <LabelSm dim style={{ marginTop: spacing.sm, textAlign: 'center' }}>
                approving sends this list to instacart and opens it in a new tab.
              </LabelSm>
            </>
          ) : (
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
              <Button label="back to edit" variant="ghost" onPress={() => setPhase('review')} style={{ flex: 0.6 }} />
              <Button label="open instacart again" tone="amber" onPress={reopen} style={{ flex: 1 }} />
            </View>
          )}

          {phase === 'placed' && (
            <Pressable onPress={reset} hitSlop={6} style={{ marginTop: spacing.md, alignSelf: 'center' }}>
              <LabelSm dim>start fresh</LabelSm>
            </Pressable>
          )}
        </>
      )}
    </Card>
  );
}
