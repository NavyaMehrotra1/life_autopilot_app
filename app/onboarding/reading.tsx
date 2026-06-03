import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Pill } from '@/components/ui/Pill';
import { Field } from '@/components/ui/Field';
import { Label } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';
import { useUserStore } from '@/stores/userStore';
import { useReadingStore } from '@/stores/readingStore';
import { addDays } from '@/lib/date';

const TARGETS = [
  { label: 'in 2 weeks', days: 14 },
  { label: 'in a month', days: 30 },
  { label: 'no rush', days: 0 },
];

export default function ReadingScreen() {
  const router = useRouter();
  const isReader = useUserStore((s) => s.isReader);
  const update = useUserStore((s) => s.update);
  const addBook = useReadingStore((s) => s.addBook);

  const [reader, setReader] = useState<boolean | null>(isReader ? true : null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [targetDays, setTargetDays] = useState(14);

  const finish = () => {
    const yes = reader === true;
    update({ isReader: yes });
    if (yes && title.trim()) {
      addBook({
        title: title.trim(),
        author: author.trim() || 'unknown',
        totalPages: parseInt(pages || '0', 10) || 300,
        targetDate: targetDays ? addDays(new Date(), targetDays).toISOString() : null,
      });
    }
    router.push('/onboarding/complete');
  };

  return (
    <OnboardingScaffold
      step={8}
      prompt="are you a reader?"
      subtitle="i'll track your pace gently — never as a chore."
      nextDisabled={reader === null}
      onNext={finish}
    >
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pill label="yes, always" selected={reader === true} onPress={() => setReader(true)} />
        <Pill label="not really" selected={reader === false} onPress={() => setReader(false)} />
      </View>

      {reader === true && (
        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <Label dim>add your first book (optional)</Label>
          <Field value={title} onChangeText={setTitle} placeholder="title" autoCapitalize="words" />
          <Field value={author} onChangeText={setAuthor} placeholder="author" autoCapitalize="words" />
          <Field
            value={pages}
            onChangeText={(t) => setPages(t.replace(/[^0-9]/g, ''))}
            placeholder="total pages"
            keyboardType="number-pad"
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {TARGETS.map((t) => (
              <Pill key={t.label} label={t.label} selected={targetDays === t.days} onPress={() => setTargetDays(t.days)} />
            ))}
          </View>
        </View>
      )}
    </OnboardingScaffold>
  );
}
