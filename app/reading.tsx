import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Pill } from '@/components/ui/Pill';
import { Title, Label, LabelSm } from '@/components/ui/Type';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/lib/ThemeContext';

import { Bookshelf } from '@/components/reading/Bookshelf';
import { BookDetail } from '@/components/reading/BookDetail';
import {
  BookStatus,
  readingStreak,
  useReadingStore,
} from '@/stores/readingStore';
import { addDays } from '@/lib/date';

const TARGETS = [
  { label: 'in 2 weeks', days: 14 },
  { label: 'in a month', days: 30 },
  { label: 'no rush', days: 0 },
];

function AddBook({ onDone }: { onDone: () => void }) {
  const addBook = useReadingStore((s) => s.addBook);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [targetDays, setTargetDays] = useState(14);
  const [status, setStatus] = useState<BookStatus>('reading');

  const submit = () => {
    if (!title.trim()) return;
    addBook({
      title: title.trim(),
      author: author.trim() || 'unknown',
      totalPages: parseInt(pages || '0', 10) || 300,
      targetDate: targetDays ? addDays(new Date(), targetDays).toISOString() : null,
      status,
    });
    onDone();
  };

  return (
    <Card>
      <Title style={{ marginBottom: spacing.md }}>add a book</Title>
      <View style={{ gap: spacing.md }}>
        <Field label="title" value={title} onChangeText={setTitle} placeholder="title" autoCapitalize="words" autoFocus />
        <Field label="author" value={author} onChangeText={setAuthor} placeholder="author" autoCapitalize="words" />
        <Field label="total pages" value={pages} onChangeText={(t) => setPages(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="320" />
        <View>
          <Label dim style={{ marginBottom: spacing.sm }}>shelf</Label>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Pill label="reading now" selected={status === 'reading'} onPress={() => setStatus('reading')} />
            <Pill label="up next" selected={status === 'next'} onPress={() => setStatus('next')} />
          </View>
        </View>
        <View>
          <Label dim style={{ marginBottom: spacing.sm }}>finish by</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {TARGETS.map((t) => (
              <Pill key={t.label} label={t.label} selected={targetDays === t.days} onPress={() => setTargetDays(t.days)} />
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button label="cancel" variant="ghost" onPress={onDone} style={{ flex: 0.6 }} />
          <Button label="add to shelf" tone="sage" onPress={submit} disabled={!title.trim()} style={{ flex: 1 }} />
        </View>
      </View>
    </Card>
  );
}

export default function ReadingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const books = useReadingStore((s) => s.books);
  const readDates = useReadingStore((s) => s.readDates);

  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const active = books.find((b) => b.status === 'reading');
  const streak = readingStreak(readDates);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} hitSlop={8} style={{ marginBottom: spacing.sm }}>
        <LabelSm dim>← back</LabelSm>
      </Pressable>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Title style={{ fontSize: 26 }}>reading</Title>
        <LabelSm color={streak > 0 ? colors.sage : colors.muted}>
          {streak > 0 ? `${streak}-day streak` : 'no streak yet'}
        </LabelSm>
      </View>

      <Button
        label={adding ? 'close' : '+ add a book'}
        variant="ghost"
        onPress={() => setAdding((a) => !a)}
        style={{ marginTop: spacing.md }}
      />
      {adding && (
        <View style={{ marginTop: spacing.md }}>
          <AddBook onDone={() => setAdding(false)} />
        </View>
      )}

      {selectedId && (
        <Card style={{ marginTop: spacing.lg }}>
          <BookDetail bookId={selectedId} onClose={() => setSelectedId(null)} />
        </Card>
      )}

      <View style={{ marginTop: spacing.xl }}>
        <Bookshelf books={books} activeId={selectedId ?? active?.id} onSelect={(b) => setSelectedId(b.id)} />
      </View>
    </Screen>
  );
}
