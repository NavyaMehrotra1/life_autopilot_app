import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Pill } from '@/components/ui/Pill';
import { DayPicker } from '@/components/ui/DayPicker';
import { Greeting, Title, Label, LabelSm, Mono } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/lib/ThemeContext';

import { SuppliesManager } from '@/components/supplies/SuppliesManager';
import { SubscriptionList } from '@/components/subscriptions/SubscriptionList';

import { DietTag, useUserStore } from '@/stores/userStore';
import { BillingCycle, useSubscriptionStore } from '@/stores/subscriptionStore';
import { hasApiKey } from '@/lib/claude';
import {
  cancelAllScheduled,
  requestNotificationPermissions,
  scheduleGroceryReview,
  scheduleLaundryDay,
} from '@/lib/notifications';

const DIETS: DietTag[] = ['vegetarian', 'vegan', 'no eggs', 'halal', 'kosher', 'no restrictions'];
const STORES = ['Target', 'Whole Foods', 'Safeway', 'Giant', "Trader Joe's", 'Walmart'];
const CYCLES: BillingCycle[] = ['monthly', 'yearly', 'weekly'];

function AddSubscription({ onDone }: { onDone: () => void }) {
  const addSub = useSubscriptionStore((s) => s.addSub);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');

  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={{ gap: spacing.md }}>
        <Field label="name" value={name} onChangeText={setName} placeholder="e.g. Netflix" autoCapitalize="words" autoFocus />
        <Field label="cost" value={cost} onChangeText={(t) => setCost(t.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder="15.49" />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {CYCLES.map((c) => (
            <Pill key={c} label={c} selected={cycle === c} onPress={() => setCycle(c)} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button label="cancel" variant="ghost" onPress={onDone} style={{ flex: 0.6 }} />
          <Button
            label="add"
            tone="sage"
            disabled={!name.trim() || !cost}
            onPress={() => {
              addSub({ name: name.trim(), cost: parseFloat(cost) || 0, cycle });
              onDone();
            }}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Card>
  );
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const user = useUserStore();
  const { name, campus, diet, store, laundryDay, deliveryTime, diningHallsEnabled } = user;
  const toggleDiet = useUserStore((s) => s.toggleDiet);
  const update = useUserStore((s) => s.update);
  const setStore = useUserStore((s) => s.setStore);
  const setLaundryDay = useUserStore((s) => s.setLaundryDay);
  const reset = useUserStore((s) => s.reset);

  const [addingSub, setAddingSub] = useState(false);
  const [rescheduled, setRescheduled] = useState(false);

  const reschedule = async () => {
    await cancelAllScheduled();
    const granted = await requestNotificationPermissions();
    if (granted) {
      await scheduleGroceryReview(deliveryTime);
      await scheduleLaundryDay(laundryDay);
    }
    setRescheduled(true);
  };

  return (
    <Screen>
      <Greeting>{name || 'you'}</Greeting>
      <Mono dim style={{ marginTop: 2 }}>{campus ? campus.toLowerCase() : 'no campus set'}</Mono>

      {/* preferences */}
      <Card style={{ marginTop: spacing.xl }}>
        <Title style={{ marginBottom: spacing.md }}>how you eat</Title>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {DIETS.map((d) => (
            <Pill key={d} label={d} selected={diet.includes(d)} onPress={() => toggleDiet(d)} />
          ))}
        </View>

        <Label dim style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>grocery store</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {STORES.map((s) => (
            <Pill key={s} label={s} selected={store === s} onPress={() => setStore(s)} />
          ))}
        </View>

        <Label dim style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>dining halls</Label>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Pill label="on" selected={diningHallsEnabled} onPress={() => update({ diningHallsEnabled: true })} />
          <Pill label="off" selected={!diningHallsEnabled} onPress={() => update({ diningHallsEnabled: false })} />
        </View>
      </Card>

      {/* routines */}
      <Card style={{ marginTop: spacing.lg }}>
        <Title style={{ marginBottom: spacing.md }}>routines</Title>
        <Label dim style={{ marginBottom: spacing.sm }}>laundry day</Label>
        <DayPicker value={laundryDay} onChange={setLaundryDay} />
        <Label dim style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>grocery delivery day</Label>
        <DayPicker value={deliveryTime.day} onChange={(d) => update({ deliveryTime: { ...deliveryTime, day: d } })} />
        <Button label={rescheduled ? 'reminders updated ✓' : 'update my reminders'} variant="ghost" onPress={reschedule} style={{ marginTop: spacing.lg }} />
      </Card>

      {/* subscriptions */}
      <Card style={{ marginTop: spacing.lg }}>
        <SubscriptionList onAdd={() => setAddingSub((a) => !a)} />
      </Card>
      {addingSub && <AddSubscription onDone={() => setAddingSub(false)} />}

      {/* supplies */}
      <View style={{ marginTop: spacing.lg }}>
        <SuppliesManager />
      </View>

      {/* about / reset */}
      <Card style={{ marginTop: spacing.lg }}>
        <Title style={{ marginBottom: spacing.sm }}>under the hood</Title>
        <Mono dim style={{ fontSize: 12 }}>
          claude {hasApiKey() ? 'connected — live expiry, recipes & carts.' : 'offline — using smart estimates. add EXPO_PUBLIC_ANTHROPIC_API_KEY for live answers.'}
        </Mono>
        <Button
          label="start over"
          variant="ghost"
          tone="red"
          onPress={() => {
            reset();
            router.replace('/onboarding/name');
          }}
          style={{ marginTop: spacing.lg }}
        />
        <LabelSm dim style={{ marginTop: spacing.sm, textAlign: 'center' }}>life autopilot · v.01</LabelSm>
      </Card>
    </Screen>
  );
}
